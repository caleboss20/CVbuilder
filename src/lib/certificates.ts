/**
 * The certificate engine: draws a certificate for each name and returns PDFs. Everything runs in
 * the browser with pdf-lib, so the organiser's list of names never leaves their device.
 *
 * A design is a background drawing plus a layout (where each line of text goes). All three designs
 * are original, drawn from simple shapes, so the accent colour can change everything at once.
 * Coordinates are measured from the TOP LEFT of the page, as on a screen; `Y()` converts to PDF's
 * bottom-left origin only at the moment something is drawn.
 */

import { PDFDocument, LineCapStyle, rgb, type PDFFont, type PDFPage, type RGB } from "pdf-lib";
import { loadFontFile, renderPages, type PreviewPage } from "./sign-pdf";

/** A4 landscape, in PDF points. */
export const PAGE_W = 841.89;
export const PAGE_H = 595.28;

export type CertDesign = "navyWaves" | "blackGold" | "goldFrame";
export type CertKind = "participation" | "appreciation" | "achievement" | "completion" | "award";
export type Signer = { name: string; title: string };

export type CertSettings = {
  design: CertDesign;
  /** Accent colour as #rrggbb. */
  color: string;
  kind: CertKind;
  /** The line under CERTIFICATE, such as "OF PARTICIPATION". */
  subtitle: string;
  /** What is written before the name. */
  intro: string;
  /** The sentence after the name. {event}, {date} and {issuer} are filled in. */
  body: string;
  event: string;
  date: string;
  issuer: string;
  signer1: Signer;
  signer2: Signer;
  /** The first signer's signature as a PNG data URL, or "". */
  signature: string;
};

export const DESIGNS: { id: CertDesign; label: string; color: string }[] = [
  { id: "navyWaves", label: "Navy Waves", color: "#14305c" },
  { id: "blackGold", label: "Black & Gold", color: "#161616" },
  { id: "goldFrame", label: "Gold Frame", color: "#14305c" },
];

/** Accent colours offered for every design. */
export const COLORS: { name: string; hex: string }[] = [
  { name: "Navy", hex: "#14305c" },
  { name: "Emerald", hex: "#0f5a3c" },
  { name: "Burgundy", hex: "#7a1f2b" },
  { name: "Royal blue", hex: "#1d4ed8" },
  { name: "Black", hex: "#161616" },
];

export const KINDS: Record<CertKind, { label: string; subtitle: string; intro: string; body: string }> = {
  participation: {
    label: "Participation",
    subtitle: "OF PARTICIPATION",
    intro: "THIS CERTIFICATE IS PROUDLY PRESENTED TO",
    body: "For taking part in {event}, held on {date}.",
  },
  appreciation: {
    label: "Appreciation",
    subtitle: "OF APPRECIATION",
    intro: "THIS CERTIFICATE IS PROUDLY PRESENTED TO",
    body: "In appreciation of your valuable contribution to {event}, held on {date}.",
  },
  achievement: {
    label: "Achievement",
    subtitle: "OF ACHIEVEMENT",
    intro: "THIS CERTIFICATE IS PROUDLY PRESENTED TO",
    body: "For outstanding achievement at {event}, held on {date}.",
  },
  completion: {
    label: "Completion",
    subtitle: "OF COMPLETION",
    intro: "THIS CERTIFICATE IS PROUDLY PRESENTED TO",
    body: "For successfully completing {event} on {date}.",
  },
  award: {
    label: "Award",
    subtitle: "OF AWARD",
    intro: "THIS CERTIFICATE IS PROUDLY PRESENTED TO",
    body: "Awarded for winning {event}, held on {date}.",
  },
};

export function defaultSettings(): CertSettings {
  const kind = KINDS.participation;
  return {
    design: "navyWaves",
    color: "#14305c",
    kind: "participation",
    subtitle: kind.subtitle,
    intro: kind.intro,
    body: kind.body,
    event: "",
    date: "",
    issuer: "",
    signer1: { name: "", title: "" },
    signer2: { name: "", title: "" },
    signature: "",
  };
}

// ---------------------------------------------------------------- small helpers

const Y = (top: number) => PAGE_H - top;

function hex(color: string): RGB {
  const n = parseInt(color.replace("#", "").padEnd(6, "0").slice(0, 6), 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

const GOLD = rgb(0.79, 0.64, 0.16);
const GOLD_LIGHT = rgb(0.91, 0.82, 0.54);
const GOLD_DARK = rgb(0.69, 0.49, 0.1);
const INK = rgb(0.13, 0.15, 0.2);
const GREY = rgb(0.32, 0.35, 0.4);

type Point = [number, number];

/** A closed shape from points, drawn filled. */
function polygon(page: PDFPage, points: Point[], color: RGB) {
  const d = `M${points.map(([x, y]) => `${x} ${y}`).join(" L")} Z`;
  page.drawSvgPath(d, { x: 0, y: PAGE_H, color });
}

/** A filled shape from an SVG path written in top-left page coordinates. */
function shape(page: PDFPage, d: string, color: RGB) {
  page.drawSvgPath(d, { x: 0, y: PAGE_H, color });
}

/** A straight line between two points. */
function line(page: PDFPage, from: Point, to: Point, thickness: number, color: RGB) {
  page.drawLine({ start: { x: from[0], y: Y(from[1]) }, end: { x: to[0], y: Y(to[1]) }, thickness, color, lineCap: LineCapStyle.Round });
}

/** A smooth stroked curve through one cubic Bezier: start, two handles, end. */
function curve(page: PDFPage, [p0, p1, p2, p3]: [Point, Point, Point, Point], thickness: number, color: RGB) {
  const at = (t: number): Point => {
    const u = 1 - t;
    return [0, 1].map((i) => u ** 3 * p0[i] + 3 * u * u * t * p1[i] + 3 * u * t * t * p2[i] + t ** 3 * p3[i]) as Point;
  };
  const steps = 48;
  let prev = at(0);
  for (let s = 1; s <= steps; s++) {
    const next = at(s / steps);
    line(page, prev, next, thickness, color);
    prev = next;
  }
}

// ---------------------------------------------------------------------- fonts

type Fonts = { title: PDFFont; body: PDFFont; bold: PDFFont; script: PDFFont; chars: Map<PDFFont, Set<number>> };

/** Embeds the four fonts (subset, so each PDF stays small). They are fetched once and reused. */
async function embedFonts(doc: PDFDocument): Promise<Fonts> {
  const { default: fontkit } = await import("@pdf-lib/fontkit");
  doc.registerFontkit(fontkit);
  const [title, body, bold, script] = await Promise.all(
    ["Marcellus-Regular.ttf", "DejaVuSans.ttf", "DejaVuSans-Bold.ttf", "GreatVibes-Regular.ttf"].map(async (file) =>
      doc.embedFont(await loadFontFile(file), { subset: true }),
    ),
  );
  const chars = new Map<PDFFont, Set<number>>();
  for (const font of [title, body, bold, script]) chars.set(font, new Set(font.getCharacterSet()));
  return { title, body, bold, script, chars };
}

/** The wanted font if it can draw every letter, otherwise the fallback (Ghanaian letters like Ɛ and Ɔ need DejaVu). */
function pick(fonts: Fonts, wanted: PDFFont, text: string, fallback: PDFFont): PDFFont {
  const set = fonts.chars.get(wanted);
  return set && Array.from(text).every((ch) => set.has(ch.codePointAt(0)!)) ? wanted : fallback;
}

// ------------------------------------------------------------------- text tools

function spacedWidth(font: PDFFont, size: number, text: string, spacing: number): number {
  const chars = Array.from(text);
  return chars.reduce((sum, ch) => sum + font.widthOfTextAtSize(ch, size), 0) + spacing * (chars.length - 1);
}

/** Centred text with extra space between the letters, for titles. */
function drawSpaced(page: PDFPage, text: string, font: PDFFont, size: number, cx: number, top: number, spacing: number, color: RGB) {
  let x = cx - spacedWidth(font, size, text, spacing) / 2;
  for (const ch of Array.from(text)) {
    page.drawText(ch, { x, y: Y(top), size, font, color });
    x += font.widthOfTextAtSize(ch, size) + spacing;
  }
}

function drawCentred(page: PDFPage, text: string, font: PDFFont, size: number, cx: number, top: number, color: RGB) {
  page.drawText(text, { x: cx - font.widthOfTextAtSize(text, size) / 2, y: Y(top), size, font, color });
}

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const lines: string[] = [];
  let current = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const test = current ? `${current} ${word}` : word;
    if (current && font.widthOfTextAtSize(test, size) > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/** Puts the event, date and organiser into the sentence, then tidies leftovers such as ", ," or double spaces. */
export function fillBody(s: Pick<CertSettings, "body" | "event" | "date" | "issuer">): string {
  return s.body
    .replace(/\{event\}/g, s.event.trim() || "your event")
    .replace(/\{date\}/g, s.date.trim() || "the day")
    .replace(/\{issuer\}/g, s.issuer.trim())
    .replace(/\s+([,.])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();
}

// ------------------------------------------------------------------ decorations

/** A medal with a ribbon: a scalloped disc, a ring, a star, and two ribbon tails. */
function drawSeal(page: PDFPage, cx: number, cy: number, r: number, main: RGB, ribbon: RGB) {
  const tail = (side: 1 | -1): Point[] => [
    [cx + side * 0.6 * r, cy + 0.5 * r],
    [cx + side * 0.05 * r, cy + 0.8 * r],
    [cx + side * 0.35 * r, cy + 1.85 * r],
    [cx + side * 0.62 * r, cy + 1.55 * r],
    [cx + side * 0.95 * r, cy + 1.75 * r],
  ];
  polygon(page, tail(-1), ribbon);
  polygon(page, tail(1), ribbon);

  // Scalloped edge: 28 points alternating between the full and a slightly smaller radius
  const edge: Point[] = Array.from({ length: 56 }, (_, i) => {
    const a = (i * Math.PI) / 28;
    const rad = i % 2 === 0 ? r : r * 0.9;
    return [cx + rad * Math.cos(a), cy + rad * Math.sin(a)];
  });
  polygon(page, edge, GOLD);
  page.drawCircle({ x: cx, y: Y(cy), size: r * 0.78, color: GOLD_LIGHT });
  page.drawCircle({ x: cx, y: Y(cy), size: r * 0.66, color: main });

  const star: Point[] = Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 === 0 ? r * 0.4 : r * 0.17;
    return [cx + rad * Math.cos(a), cy + rad * Math.sin(a)];
  });
  polygon(page, star, GOLD);
}

// --------------------------------------------------------------------- designs

type Layout = {
  cx: number;
  /** Width of the text column. */
  w: number;
  title: number;
  subtitle: number;
  intro: number;
  name: number;
  nameLine: number;
  body: number;
  sig: number;
  /** Where the signature lines are centred, for one signer and for two. */
  slots: (two: boolean) => number[];
  nameColor: (main: RGB) => RGB;
  titleColor: (main: RGB) => RGB;
};

type Design = { layout: Layout; background: (page: PDFPage, main: RGB) => void; foreground?: (page: PDFPage, main: RGB) => void };

const centreSlots = (cx: number) => (two: boolean) => (two ? [cx - 135, cx + 135] : [cx]);

const DRAW: Record<CertDesign, Design> = {
  // Wave bands top and bottom, a gold line along each, and the seal on the left
  navyWaves: {
    layout: {
      cx: 455, w: 620, title: 196, subtitle: 228, intro: 282, name: 352, nameLine: 366, body: 402, sig: 462,
      slots: centreSlots(455), nameColor: () => GOLD_DARK, titleColor: (main) => main,
    },
    background(page, main) {
      shape(page, "M0 0 L842 0 L842 60 C720 100 560 40 400 62 C250 82 120 100 0 82 Z", main);
      curve(page, [[0, 92], [120, 110], [250, 92], [400, 72]], 3.5, GOLD);
      curve(page, [[400, 72], [560, 50], [720, 110], [842, 70]], 3.5, GOLD);
      shape(page, "M0 595 L842 595 L842 540 C720 500 560 556 400 536 C250 518 120 500 0 520 Z", main);
      curve(page, [[0, 508], [120, 488], [250, 506], [400, 524]], 3.5, GOLD);
      curve(page, [[400, 524], [560, 546], [720, 490], [842, 528]], 3.5, GOLD);
      drawSeal(page, 120, 112, 38, main, GOLD);
    },
  },
  // A dark curved panel on the left carrying a big gold seal, inside a gold frame
  blackGold: {
    layout: {
      cx: 540, w: 500, title: 190, subtitle: 222, intro: 276, name: 346, nameLine: 360, body: 396, sig: 470,
      slots: centreSlots(540), nameColor: () => GOLD_DARK, titleColor: () => INK,
    },
    background(page, main) {
      shape(page, "M0 0 L205 0 C140 150 130 330 190 595 L0 595 Z", main);
      shape(page, "M205 0 C140 150 130 330 190 595 L232 595 C176 330 190 150 252 0 Z", GOLD_LIGHT);
      drawSeal(page, 112, 190, 64, main, GOLD);
    },
    foreground(page) {
      page.drawRectangle({ x: 14, y: 14, width: PAGE_W - 28, height: PAGE_H - 28, borderColor: GOLD, borderWidth: 5 });
    },
  },
  // Notched corners in the accent colour, a gold frame, a flourish on top and the seal below
  goldFrame: {
    layout: {
      cx: PAGE_W / 2, w: 600, title: 178, subtitle: 208, intro: 256, name: 322, nameLine: 336, body: 370, sig: 470,
      slots: (two) => (two ? [PAGE_W / 2 - 215, PAGE_W / 2 + 215] : [PAGE_W / 2 - 215]),
      nameColor: (main) => main, titleColor: () => INK,
    },
    background(page, main) {
      const corner = (flipX: boolean, flipY: boolean) => {
        const pts: Point[] = [[0, 0], [150, 0], [118, 32], [32, 32], [32, 118], [0, 150]];
        const place = ([x, y]: Point): Point => [flipX ? PAGE_W - x : x, flipY ? PAGE_H - y : y];
        polygon(page, pts.map(place), main);
        const inner: Point[] = [[125, 40], [40, 40], [40, 125]];
        const [a, b, c] = inner.map(place);
        line(page, a, b, 3, GOLD);
        line(page, b, c, 3, GOLD);
      };
      corner(false, false);
      corner(true, false);
      corner(false, true);
      corner(true, true);

      // The frame joining the corners
      const t = 34;
      line(page, [150, t], [PAGE_W - 150, t], 4, GOLD);
      line(page, [150, PAGE_H - t], [PAGE_W - 150, PAGE_H - t], 4, GOLD);
      line(page, [t, 150], [t, PAGE_H - 150], 4, GOLD);
      line(page, [PAGE_W - t, 150], [PAGE_W - t, PAGE_H - 150], 4, GOLD);
      page.drawRectangle({ x: 48, y: 48, width: PAGE_W - 96, height: PAGE_H - 96, borderColor: GOLD_LIGHT, borderWidth: 1 });

      // A small flourish above the title
      const cx = PAGE_W / 2;
      line(page, [cx - 90, 92], [cx - 14, 92], 2, GOLD);
      line(page, [cx + 14, 92], [cx + 90, 92], 2, GOLD);
      polygon(page, [[cx, 84], [cx + 8, 92], [cx, 100], [cx - 8, 92]], GOLD);
      drawSeal(page, cx, 452, 31, main, GOLD);
    },
  },
};

// ------------------------------------------------------------------- one page

/** Turns a PNG data URL into bytes. */
function dataUrlBytes(dataUrl: string): Uint8Array {
  const binary = atob(dataUrl.split(",")[1] ?? "");
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

/** Draws one certificate onto a new page of `doc`. */
function drawCertificate(doc: PDFDocument, fonts: Fonts, settings: CertSettings, name: string, signature: Awaited<ReturnType<PDFDocument["embedPng"]>> | null) {
  const page = doc.addPage([PAGE_W, PAGE_H]);
  const design = DRAW[settings.design];
  const L = design.layout;
  const main = hex(settings.color);

  design.background(page, main);

  // Title and subtitle
  drawSpaced(page, "CERTIFICATE", fonts.title, 46, L.cx, L.title, 5, L.titleColor(main));
  const subtitle = settings.subtitle.trim().toUpperCase();
  if (subtitle) drawSpaced(page, subtitle, pick(fonts, fonts.bold, subtitle, fonts.bold), 14, L.cx, L.subtitle, 4, main);

  const intro = settings.intro.trim().toUpperCase();
  if (intro) drawSpaced(page, intro, fonts.bold, 9.5, L.cx, L.intro, 1.6, GREY);

  // The name in script, as large as fits. Letters Great Vibes lacks fall back to bold sans.
  const nameFont = pick(fonts, fonts.script, name, fonts.bold);
  let size = nameFont === fonts.script ? 60 : 34;
  while (size > 24 && nameFont.widthOfTextAtSize(name, size) > L.w * 0.92) size -= 2;
  drawCentred(page, name, nameFont, size, L.cx, L.name, L.nameColor(main));
  line(page, [L.cx - L.w * 0.4, L.nameLine], [L.cx + L.w * 0.4, L.nameLine], 1, GREY);

  // What it was for
  const bodyLines = wrap(fillBody(settings), pick(fonts, fonts.body, fillBody(settings), fonts.body), 12.5, L.w * 0.86).slice(0, 4);
  bodyLines.forEach((text, i) => drawCentred(page, text, fonts.body, 12.5, L.cx, L.body + i * 19, INK));

  // Signers
  const signers = [settings.signer1, settings.signer2].filter((s, i) => i === 0 || s.name.trim());
  const centres = L.slots(signers.length > 1);
  signers.forEach((signer, i) => {
    const c = centres[i];
    line(page, [c - 78, L.sig], [c + 78, L.sig], 1, INK);
    if (i === 0 && signature) {
      const scale = Math.min(140 / signature.width, 50 / signature.height);
      page.drawImage(signature, { x: c - (signature.width * scale) / 2, y: Y(L.sig - 4), width: signature.width * scale, height: signature.height * scale });
    }
    if (signer.name.trim()) drawCentred(page, signer.name.trim(), fonts.bold, 10.5, c, L.sig + 17, INK);
    if (signer.title.trim()) drawCentred(page, signer.title.trim(), fonts.body, 9, c, L.sig + 31, GREY);
  });

  design.foreground?.(page, main);
}

// ---------------------------------------------------------------------- outputs

/** Lets the browser breathe between certificates so the page does not freeze on a big batch. */
const breathe = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

/** One PDF holding every certificate, one per page. Best for printing. */
export async function buildCombinedPdf(settings: CertSettings, names: string[], onProgress?: (done: number) => void): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`${settings.event.trim() || "Certificates"} certificates`);
  const fonts = await embedFonts(doc);
  const signature = settings.signature ? await doc.embedPng(dataUrlBytes(settings.signature)) : null;
  for (let i = 0; i < names.length; i++) {
    drawCertificate(doc, fonts, settings, names[i], signature);
    onProgress?.(i + 1);
    if (i % 10 === 9) await breathe();
  }
  return doc.save();
}

/** A separate PDF for each name, ready to be sent to each person or zipped. */
export async function buildSeparatePdfs(
  settings: CertSettings,
  names: string[],
  onProgress?: (done: number) => void,
): Promise<{ name: string; bytes: Uint8Array }[]> {
  const files: { name: string; bytes: Uint8Array }[] = [];
  for (let i = 0; i < names.length; i++) {
    const doc = await PDFDocument.create();
    doc.setTitle(`Certificate for ${names[i]}`);
    const fonts = await embedFonts(doc);
    const signature = settings.signature ? await doc.embedPng(dataUrlBytes(settings.signature)) : null;
    drawCertificate(doc, fonts, settings, names[i], signature);
    files.push({ name: names[i], bytes: await doc.save() });
    onProgress?.(i + 1);
    await breathe();
  }
  return files;
}

/** A picture of one certificate for the live preview. */
export async function previewCertificate(settings: CertSettings, name: string): Promise<PreviewPage> {
  const bytes = await buildCombinedPdf(settings, [name]);
  return (await renderPages(bytes))[0];
}

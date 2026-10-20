/**
 * The certificate engine: draws a certificate for each name and returns PDFs. Everything runs in
 * the browser with pdf-lib, so the organiser's list of names never leaves their device.
 *
 * The artwork lives in certificate-designs.ts (what each design looks like) and certificate-draw.ts
 * (gradients, shapes, medals). This file puts the words on top, fits each name, and builds the files.
 */

import { PDFDocument, type PDFFont } from "pdf-lib";
import { PAGE_H, PAGE_W, drawCentred, drawSpaced, line, setPageHeight, wrap, Y } from "./certificate-draw";
import { pageSize } from "./certificate-design-types";
import { DESIGNS, designById, type CertDesign } from "./certificate-designs";
import { loadFontFile, renderPages, type PreviewPage } from "./sign-pdf";

export { DESIGNS, PAGE_H, PAGE_W };
export type { CertDesign };

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

/** Accent colours offered for every design. */
export const COLORS: { name: string; hex: string }[] = [
  { name: "Navy", hex: "#14305c" },
  { name: "Emerald", hex: "#0f5a3c" },
  { name: "Burgundy", hex: "#7a1f2b" },
  { name: "Royal blue", hex: "#1d4ed8" },
  { name: "Purple", hex: "#5b3aa8" },
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
    color: DESIGNS[0].color,
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

// ------------------------------------------------------------------- one page

/** Turns a PNG data URL into bytes. */
function dataUrlBytes(dataUrl: string): Uint8Array {
  const binary = atob(dataUrl.split(",")[1] ?? "");
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

type EmbeddedImage = Awaited<ReturnType<PDFDocument["embedPng"]>>;

/** Draws one certificate onto a new page of `doc`. */
function drawCertificate(doc: PDFDocument, fonts: Fonts, settings: CertSettings, name: string, signature: EmbeddedImage | null) {
  const design = designById(settings.design);
  const dims = pageSize(design);
  setPageHeight(dims.height);
  const page = doc.addPage([dims.width, dims.height]);
  const main = settings.color;
  const L = design.layout(main);

  design.draw({ page, main, bold: fonts.bold });

  // Title and subtitle
  const titleFont = L.titleFont === "title" ? fonts.title : fonts.bold;
  drawSpaced(page, "CERTIFICATE", titleFont, L.titleSize, L.cx, L.title, L.titleSpacing ?? (L.titleFont === "title" ? 5 : 3), L.titleColor);
  const subtitle = settings.subtitle.trim().toUpperCase();
  if (subtitle) drawSpaced(page, subtitle, fonts.bold, L.subtitleSize ?? 15, L.cx, L.subtitle, L.subtitleSpacing ?? 4, L.subtitleColor);

  const intro = settings.intro.trim().toUpperCase();
  if (intro) drawSpaced(page, intro, fonts.bold, 10.5, L.cx, L.intro, 1.6, L.introColor);

  // The name, as large as fits. Handwriting by default; letters a font lacks fall back to bold sans.
  const shown = L.nameCaps ? name.toUpperCase() : name;
  const wanted = L.nameFont === "title" ? fonts.title : L.nameFont === "bold" ? fonts.bold : fonts.script;
  const nameFont = pick(fonts, wanted, shown, fonts.bold);
  let size = nameFont === fonts.script ? 68 : nameFont === fonts.title ? 48 : 36;
  while (size > 24 && nameFont.widthOfTextAtSize(shown, size) > L.w * 0.92) size -= 2;
  drawCentred(page, shown, nameFont, size, L.cx, L.name, L.nameColor);
  if (!L.noNameLine) line(page, [L.cx - L.w * 0.4, L.nameLine], [L.cx + L.w * 0.4, L.nameLine], 1, L.lineColor);

  // What it was for
  const body = fillBody(settings);
  wrap(body, fonts.body, 13.5, L.w * 0.86)
    .slice(0, 4)
    .forEach((text, i) => drawCentred(page, text, fonts.body, 13.5, L.cx, L.body + i * 20, L.ink));

  // Signers
  const signers = [settings.signer1, settings.signer2].filter((s, i) => i === 0 || s.name.trim());
  const centres = L.slots(signers.length > 1);
  signers.forEach((signer, i) => {
    const c = centres[i];
    line(page, [c - 78, L.sig], [c + 78, L.sig], 1, L.ink);
    if (i === 0 && signature) {
      const scale = Math.min(140 / signature.width, 50 / signature.height);
      page.drawImage(signature, { x: c - (signature.width * scale) / 2, y: Y(L.sig - 4), width: signature.width * scale, height: signature.height * scale });
    }
    if (signer.name.trim()) drawCentred(page, signer.name.trim(), fonts.bold, 10.5, c, L.sig + 17, L.ink);
    if (signer.title.trim()) drawCentred(page, signer.title.trim(), fonts.body, 9, c, L.sig + 31, L.grey);
  });

  design.foreground?.({ page, main, bold: fonts.bold });
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

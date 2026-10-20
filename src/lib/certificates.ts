/**
 * The certificate engine: draws a certificate for each name and returns PDFs. Everything runs in
 * the browser with pdf-lib, so the organiser's list of names never leaves their device.
 *
 * The artwork lives in certificate-designs.ts and certificate-designs-more.ts (what each design looks
 * like) and certificate-draw.ts (gradients, shapes, medals). This file puts the words and the logo on
 * top, fits each name, and builds the files.
 */

import { PDFDocument, type PDFFont } from "pdf-lib";
import { PAGE_H, PAGE_W, drawCentred, drawSpaced, line, setPageHeight, wrap, Y } from "./certificate-draw";
import { pageSize, type Layout } from "./certificate-design-types";
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
  /** The organiser's logo as a PNG data URL, or "". */
  logo: string;
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
    logo: "",
  };
}

/**
 * Where the logo goes on designs whose default spot (centred above the title) would collide with
 * their artwork. `false` means a medal already sits there, so that design has no room for a logo.
 */
const LOGO_SPOTS: Partial<Record<CertDesign, Layout["logo"]>> = {
  whiteWave: false,
  ornateCream: false,
  excellence: false,
  goldFrame: { cx: PAGE_W / 2, top: 100, maxW: 150, maxH: 30 },
  royalGold: { cx: 421, top: 56, maxW: 180, maxH: 46 },
  ribbonBlue: { cx: 490, top: 116, maxW: 150, maxH: 34 },
  cleanFrame: { cx: PAGE_W / 2, top: 62, maxW: 160, maxH: 42 },
  ornateBlue: { cx: PAGE_W / 2, top: 56, maxW: 160, maxH: 40 },
};

/** Whether a design has room for the organiser's logo. */
export function supportsLogo(design: CertDesign): boolean {
  return LOGO_SPOTS[design] !== false;
}

// ---------------------------------------------------------------------- fonts

type Fonts = {
  /** Light serif for titles. */
  title: PDFFont;
  /** Bold serif for titles and names in capitals. */
  display: PDFFont;
  /** Poppins Regular, for sentences. */
  body: PDFFont;
  /** Poppins SemiBold, for small labels and signer names. */
  bold: PDFFont;
  /** Poppins Bold, for heavy sans titles. */
  heavy: PDFFont;
  /** Handwriting, for names. */
  script: PDFFont;
  /** DejaVu, loaded only when some text has letters the other fonts lack (Ghanaian Ɛ and Ɔ). */
  fallback?: PDFFont;
  fallbackBold?: PDFFont;
  chars: Map<PDFFont, Set<number>>;
};

/**
 * Embeds the fonts for one PDF (subset, so each file stays small). Font files are fetched once and
 * reused. `text` is everything that will be written, so the wider fallback font is only loaded
 * when it is really needed.
 */
async function embedFonts(doc: PDFDocument, text: string): Promise<Fonts> {
  const { default: fontkit } = await import("@pdf-lib/fontkit");
  doc.registerFontkit(fontkit);
  const load = async (file: string) => doc.embedFont(await loadFontFile(file), { subset: true });
  const [title, display, body, bold, heavy, script] = await Promise.all(
    ["Marcellus-Regular.ttf", "PlayfairDisplaySC-Bold.ttf", "Poppins-Regular.ttf", "Poppins-SemiBold.ttf", "Poppins-Bold.ttf", "GreatVibes-Regular.ttf"].map(load),
  );
  const fonts: Fonts = { title, display, body, bold, heavy, script, chars: new Map() };
  for (const font of [title, display, body, bold, heavy, script]) fonts.chars.set(font, new Set(font.getCharacterSet()));

  const covered = fonts.chars.get(body)!;
  if (Array.from(text).some((ch) => ch.trim() && !covered.has(ch.codePointAt(0)!))) {
    [fonts.fallback, fonts.fallbackBold] = await Promise.all(["DejaVuSans.ttf", "DejaVuSans-Bold.ttf"].map(load));
    for (const font of [fonts.fallback, fonts.fallbackBold]) fonts.chars.set(font!, new Set(font!.getCharacterSet()));
  }
  return fonts;
}

/** The wanted font if it can draw every letter of `text`, otherwise the DejaVu fallback. */
function pick(fonts: Fonts, wanted: PDFFont, text: string): PDFFont {
  const set = fonts.chars.get(wanted);
  if (set && Array.from(text).every((ch) => set.has(ch.codePointAt(0)!))) return wanted;
  return (wanted === fonts.body ? fonts.fallback : fonts.fallbackBold) ?? wanted;
}

/** Every piece of text a batch will write, so the fonts can be chosen once. */
function allText(settings: CertSettings, names: string[]): string {
  const { subtitle, intro, body, event, date, issuer, signer1, signer2 } = settings;
  return [...names, subtitle, intro, body, event, date, issuer, signer1.name, signer1.title, signer2.name, signer2.title].join(" ");
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
type Images = { signature: EmbeddedImage | null; logo: EmbeddedImage | null };

async function embedImages(doc: PDFDocument, settings: CertSettings): Promise<Images> {
  return {
    signature: settings.signature ? await doc.embedPng(dataUrlBytes(settings.signature)) : null,
    logo: settings.logo ? await doc.embedPng(dataUrlBytes(settings.logo)) : null,
  };
}

/** The spot for the logo when a design does not say: centred above the title, as large as the room allows. */
function logoBox(design: CertDesign, L: Layout): { cx: number; top: number; maxW: number; maxH: number } | null {
  const spot = LOGO_SPOTS[design] ?? L.logo;
  if (spot === false) return null;
  if (spot) return spot;
  const capTop = L.title - L.titleSize * 0.78;
  const top = Math.max(44, capTop - 62);
  return { cx: L.cx, top, maxW: 180, maxH: Math.max(Math.min(50, capTop - top - 10), 22) };
}

/** Draws one certificate onto a new page of `doc`. */
function drawCertificate(doc: PDFDocument, fonts: Fonts, settings: CertSettings, name: string, images: Images) {
  const design = designById(settings.design);
  const dims = pageSize(design);
  setPageHeight(dims.height);
  const page = doc.addPage([dims.width, dims.height]);
  const main = settings.color;
  const L = design.layout(main);

  design.draw({ page, main, bold: fonts.bold });

  // The organiser's logo, fitted into its box
  const box = logoBox(settings.design, L);
  if (images.logo && box) {
    const scale = Math.min(box.maxW / images.logo.width, box.maxH / images.logo.height);
    const w = images.logo.width * scale;
    const h = images.logo.height * scale;
    page.drawImage(images.logo, { x: box.cx - w / 2, y: Y(box.top + (box.maxH + h) / 2), width: w, height: h });
  }

  // Title and subtitle
  const titleFont = L.titleFont === "title" ? fonts.title : L.titleFont === "display" ? fonts.display : fonts.heavy;
  drawSpaced(page, "CERTIFICATE", titleFont, L.titleSize, L.cx, L.title, L.titleSpacing ?? (L.titleFont === "title" ? 5 : 2), L.titleColor);
  const subtitle = settings.subtitle.trim().toUpperCase();
  if (subtitle) drawSpaced(page, subtitle, pick(fonts, fonts.bold, subtitle), L.subtitleSize ?? 15, L.cx, L.subtitle, L.subtitleSpacing ?? 4, L.subtitleColor);

  const intro = settings.intro.trim().toUpperCase();
  if (intro) drawSpaced(page, intro, pick(fonts, fonts.bold, intro), 10.5, L.cx, L.intro, 1.6, L.introColor);

  // The name, as large as fits. Handwriting by default; letters a font lacks fall back to bold sans.
  const shown = L.nameCaps ? name.toUpperCase() : name;
  const wanted = L.nameFont === "title" ? fonts.title : L.nameFont === "display" ? fonts.display : L.nameFont === "bold" ? fonts.bold : fonts.script;
  const nameFont = pick(fonts, wanted, shown);
  let size = nameFont === fonts.script ? 68 : nameFont === fonts.title || nameFont === fonts.display ? 48 : 36;
  while (size > 24 && nameFont.widthOfTextAtSize(shown, size) > L.w * 0.92) size -= 2;
  drawCentred(page, shown, nameFont, size, L.cx, L.name, L.nameColor);
  if (!L.noNameLine) line(page, [L.cx - L.w * 0.4, L.nameLine], [L.cx + L.w * 0.4, L.nameLine], 1, L.lineColor);

  // What it was for
  const body = fillBody(settings);
  const bodyFont = pick(fonts, fonts.body, body);
  wrap(body, bodyFont, 13.5, L.w * 0.86)
    .slice(0, 4)
    .forEach((text, i) => drawCentred(page, text, bodyFont, 13.5, L.cx, L.body + i * 20, L.ink));

  // Signers
  const signers = [settings.signer1, settings.signer2].filter((s, i) => i === 0 || s.name.trim());
  const centres = L.slots(signers.length > 1);
  signers.forEach((signer, i) => {
    const c = centres[i];
    line(page, [c - 78, L.sig], [c + 78, L.sig], 1, L.ink);
    if (i === 0 && images.signature) {
      const scale = Math.min(140 / images.signature.width, 50 / images.signature.height);
      page.drawImage(images.signature, { x: c - (images.signature.width * scale) / 2, y: Y(L.sig - 4), width: images.signature.width * scale, height: images.signature.height * scale });
    }
    const signerName = signer.name.trim();
    const signerTitle = signer.title.trim();
    if (signerName) drawCentred(page, signerName, pick(fonts, fonts.bold, signerName), 10.5, c, L.sig + 17, L.ink);
    if (signerTitle) drawCentred(page, signerTitle, pick(fonts, fonts.body, signerTitle), 9, c, L.sig + 31, L.grey);
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
  const fonts = await embedFonts(doc, allText(settings, names));
  const images = await embedImages(doc, settings);
  for (let i = 0; i < names.length; i++) {
    drawCertificate(doc, fonts, settings, names[i], images);
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
    const fonts = await embedFonts(doc, allText(settings, [names[i]]));
    const images = await embedImages(doc, settings);
    drawCertificate(doc, fonts, settings, names[i], images);
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

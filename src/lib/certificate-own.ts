/**
 * "Use my own certificate": the organiser uploads a certificate they already have (a PDF from Canva,
 * or a photo or scan) with the name left blank, shows where the names go, and we write each name onto
 * it. Everything runs in the browser, so neither their design nor their list of names is uploaded.
 *
 * A PDF is embedded as a page, so Canva's artwork stays sharp and its text stays text. An image is
 * placed on a page of matching shape. Names are drawn with the same fonts as the built-in designs
 * (including the fallback for Ghanaian letters).
 */

import { PDFDocument } from "pdf-lib";
import { hex } from "./certificate-draw";
import { dataUrlBytes, embedFonts, pick, type Fonts } from "./certificates";
import { renderPages, type PreviewPage } from "./sign-pdf";

/** Fonts a name can be written in. */
export type OwnFont = "script" | "display" | "bold" | "title";

export const OWN_FONTS: { id: OwnFont; label: string; family: string; file: string }[] = [
  { id: "script", label: "Handwriting", family: "CertScript", file: "GreatVibes-Regular.ttf" },
  { id: "display", label: "Bold serif (capitals)", family: "CertDisplay", file: "PlayfairDisplaySC-Bold.ttf" },
  { id: "bold", label: "Clean sans", family: "CertSans", file: "Poppins-SemiBold.ttf" },
  { id: "title", label: "Light serif", family: "CertSerif", file: "Marcellus-Regular.ttf" },
];

/** Where and how a name is written. x, y and w are fractions of the page; size is in PDF points. */
export type NamePlace = { x: number; y: number; w: number; size: number; color: string; font: OwnFont };

/** A signature to place on the organiser's own design. x and y are the centre, w the width, as fractions of the page. */
export type OwnSignature = { dataUrl: string; x: number; y: number; w: number };

export const defaultNamePlace = (): NamePlace => ({ x: 0.5, y: 0.45, w: 0.7, size: 56, color: "#1f2937", font: "script" });

/** An uploaded certificate, ready to have names written on it. */
export type OwnDesign = {
  kind: "pdf" | "image";
  /** The PDF file, or the image re-saved as a JPEG. */
  bytes: Uint8Array;
  /** Page size in PDF points. */
  width: number;
  height: number;
  /** A picture of it for the screen. */
  preview: PreviewPage;
  /** True when a PDF had more than one page (only the first is used). */
  extraPages: boolean;
};

const MAX_BYTES = 15 * 1024 * 1024;
/** Longest side of an uploaded photo, in pixels. Larger photos are shrunk so the PDFs stay light. */
const MAX_IMAGE_SIDE = 2400;
const A4_LONG = 841.89;
const A4_SHORT = 595.28;

/** Reads an uploaded PDF or image. Throws an Error with a message that is safe to show. */
export async function readOwnDesign(file: File): Promise<OwnDesign> {
  if (file.size > MAX_BYTES) throw new Error("That file is too large. Please use one under 15 MB.");
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

  if (isPdf) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    let doc: PDFDocument;
    try {
      doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    } catch {
      throw new Error("We could not read that PDF. Try downloading it again from Canva as a PDF.");
    }
    const { width, height } = doc.getPage(0).getSize();
    const [preview] = await renderPages(bytes);
    if (!preview) throw new Error("We could not draw that PDF. Try a different file.");
    return { kind: "pdf", bytes, width, height, preview, extraPages: doc.getPageCount() > 1 };
  }

  if (!file.type.startsWith("image/")) throw new Error("Please upload a PDF, or a photo or scan of your certificate (PNG or JPG).");

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("We could not read that picture. Try a PNG or JPG.");
  }
  const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Your browser could not process the picture.");
  // A white backing, so a see-through picture does not turn black as a JPEG
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
  // A page the same shape as the picture, one A4 side wide
  const landscape = canvas.width >= canvas.height;
  const width = landscape ? A4_LONG : A4_SHORT;
  const height = (width * canvas.height) / canvas.width;
  return {
    kind: "image",
    bytes: dataUrlBytes(dataUrl),
    width,
    height,
    preview: { src: dataUrl, width: canvas.width, height: canvas.height },
    extraPages: false,
  };
}

// ----------------------------------------------------------------------- drawing

/** A page's worth of the design, ready to be put on new pages of a document. */
async function embedDesign(doc: PDFDocument, design: OwnDesign) {
  if (design.kind === "pdf") {
    const [page] = await doc.embedPdf(design.bytes, [0]);
    return (target: ReturnType<PDFDocument["addPage"]>) => target.drawPage(page, { x: 0, y: 0, width: design.width, height: design.height });
  }
  const image = await doc.embedJpg(design.bytes);
  return (target: ReturnType<PDFDocument["addPage"]>) => target.drawImage(image, { x: 0, y: 0, width: design.width, height: design.height });
}

/** The vertical offset from the middle of a line of text to its baseline, as a share of the font size. */
const BASELINE_SHARE = 0.3;

/** Writes one name onto a new page: the design first, then the name, as large as fits its width. */
type EmbeddedSignature = { image: Awaited<ReturnType<PDFDocument["embedPng"]>>; place: OwnSignature };

/** Puts each signature image into the document once, so every page can reuse it. */
async function embedSignatures(doc: PDFDocument, signatures: OwnSignature[]): Promise<EmbeddedSignature[]> {
  return Promise.all(signatures.map(async (place) => ({ image: await doc.embedPng(dataUrlBytes(place.dataUrl)), place })));
}

function writePage(
  doc: PDFDocument,
  fonts: Fonts,
  drawDesign: Awaited<ReturnType<typeof embedDesign>>,
  design: OwnDesign,
  name: string,
  place: NamePlace,
  signatures: EmbeddedSignature[],
) {
  const page = doc.addPage([design.width, design.height]);
  drawDesign(page);

  const wanted = { script: fonts.script, display: fonts.display, bold: fonts.bold, title: fonts.title }[place.font];
  const shown = place.font === "display" ? name.toUpperCase() : name;
  const font = pick(fonts, wanted, shown);

  let size = place.size;
  const room = place.w * design.width;
  while (size > 10 && font.widthOfTextAtSize(shown, size) > room) size -= 2;

  const x = place.x * design.width - font.widthOfTextAtSize(shown, size) / 2;
  const baselineFromTop = place.y * design.height + size * BASELINE_SHARE;
  page.drawText(shown, { x, y: design.height - baselineFromTop, size, font, color: hex(place.color) });

  // Signatures, centred where the organiser put them
  for (const { image, place: at } of signatures) {
    const width = at.w * design.width;
    const height = (width * image.height) / image.width;
    page.drawImage(image, { x: at.x * design.width - width / 2, y: design.height - (at.y * design.height + height / 2), width, height });
  }
}

// ------------------------------------------------------------------ sharing

/** The largest uploaded certificate (PDF or photo) that can be shared by link, in bytes. */
export const MAX_SHARE_BYTES = 3.5 * 1024 * 1024;

/** An uploaded certificate with its name and signature spots, in a form that is stored for a shared link. */
export type OwnShare = {
  own: true;
  kind: OwnDesign["kind"];
  /** The PDF or JPEG, as base64. */
  file: string;
  width: number;
  height: number;
  place: NamePlace;
  signatures: OwnSignature[];
};

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
}

/** Packs an uploaded design for sharing. Throws an Error with a safe message when it is too large. */
export function packOwnShare(design: OwnDesign, place: NamePlace, signatures: OwnSignature[]): OwnShare {
  if (design.bytes.length > MAX_SHARE_BYTES) {
    throw new Error("That certificate file is too large to share by link (the limit is 3.5 MB). Export a smaller PDF from Canva, or download the certificates instead.");
  }
  return { own: true, kind: design.kind, file: toBase64(design.bytes), width: design.width, height: design.height, place, signatures };
}

/** Turns a shared design back into something the engine can write names on. */
export function unpackOwnShare(share: OwnShare): OwnDesign {
  const binary = atob(share.file);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  // The picture for the screen is not needed here: the page makes its own preview from the finished PDF
  return { kind: share.kind, bytes, width: share.width, height: share.height, preview: { src: "", width: 0, height: 0 }, extraPages: false };
}

const breathe = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

/** One PDF with a page per name, all sharing one copy of the design. Best for printing. */
export async function buildOwnCombined(
  design: OwnDesign,
  names: string[],
  place: NamePlace,
  onProgress?: (done: number) => void,
  signatures: OwnSignature[] = [],
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle("Certificates");
  const fonts = await embedFonts(doc, names.join(" "));
  const drawDesign = await embedDesign(doc, design);
  const sigs = await embedSignatures(doc, signatures);
  for (let i = 0; i < names.length; i++) {
    writePage(doc, fonts, drawDesign, design, names[i], place, sigs);
    onProgress?.(i + 1);
    if (i % 10 === 9) await breathe();
  }
  return doc.save();
}

/** A separate PDF for each name. */
export async function buildOwnSeparate(
  design: OwnDesign,
  names: string[],
  place: NamePlace,
  onProgress?: (done: number) => void,
  signatures: OwnSignature[] = [],
): Promise<{ name: string; bytes: Uint8Array }[]> {
  const files: { name: string; bytes: Uint8Array }[] = [];
  for (let i = 0; i < names.length; i++) {
    const doc = await PDFDocument.create();
    doc.setTitle(`Certificate for ${names[i]}`);
    const fonts = await embedFonts(doc, names[i]);
    const drawDesign = await embedDesign(doc, design);
    writePage(doc, fonts, drawDesign, design, names[i], place, await embedSignatures(doc, signatures));
    files.push({ name: names[i], bytes: await doc.save() });
    onProgress?.(i + 1);
    await breathe();
  }
  return files;
}

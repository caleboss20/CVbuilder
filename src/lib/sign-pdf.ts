/**
 * Everything the "Sign a letter" tool does with files, kept apart from the screen so each
 * step is easy to read. It all runs in the browser: the letter is never uploaded anywhere.
 */

/** Where the signature sits on a page, as fractions (0 to 1) of the page, measured from the top left. */
export type Placement = { x: number; y: number; width: number };

/** Where a closing such as "Yours faithfully," sits on a page, as fractions of the page. */
export type ClosingSpot = {
  /** Left edge and baseline of the closing line. */
  x: number;
  y: number;
  /** Width of the closing text, and its font height. */
  w: number;
  size: number;
  /** Baseline of the next line below it (usually the typed name), if there is one. */
  below?: number;
};

/** One page of the letter, ready to show on screen. */
export type PreviewPage = { src: string; width: number; height: number; closing?: ClosingSpot };

/** The words letters end with, just above the signature. */
export const CLOSING = /^(yours\s+(faithfully|sincerely|truly|respectfully)|sincerely|respectfully|regards|kind regards|best regards|warm regards|with thanks)\b/i;

const PREVIEW_WIDTH = 900;
const MAX_PAGES = 20;

/** Reads a data URL ("data:image/png;base64,...") into raw bytes. */
function dataUrlToBytes(dataUrl: string): Uint8Array {
  const binary = atob(dataUrl.split(",")[1] ?? "");
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/** Loads an image file in the browser. */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("We could not read that image."));
    };
    img.src = url;
  });
}

/**
 * Accepts a PDF, or a photo or scan of a letter, and returns PDF bytes either way. A photo is
 * placed on a page of its own, so the rest of the tool only ever deals with PDFs.
 */
export async function toPdfBytes(file: File): Promise<Uint8Array> {
  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    return new Uint8Array(await file.arrayBuffer());
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose a PDF, or a photo of your letter. Word files: save as PDF first.");
  }

  const img = await loadImage(file);
  // Re-draw as a JPEG so any image type (PNG, WebP, phone photos) embeds the same way
  const scale = Math.min(1, 1800 / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("This browser cannot read images.");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const { PDFDocument } = await import("pdf-lib");
  const doc = await PDFDocument.create();
  const jpg = await doc.embedJpg(dataUrlToBytes(canvas.toDataURL("image/jpeg", 0.9)));
  // A4 width in points, keeping the photo's own proportions
  const pageWidth = 595;
  const pageHeight = (canvas.height / canvas.width) * pageWidth;
  const page = doc.addPage([pageWidth, pageHeight]);
  page.drawImage(jpg, { x: 0, y: 0, width: pageWidth, height: pageHeight });
  return doc.save();
}

/** Draws each PDF page to an image the student can see and place their signature on. */
export async function renderPages(bytes: Uint8Array): Promise<PreviewPage[]> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
  // pdf.js takes ownership of the array it is given, so it gets its own copy
  const pdf = await pdfjs.getDocument({ data: bytes.slice() }).promise;
  const pages: PreviewPage[] = [];

  for (let n = 1; n <= Math.min(pdf.numPages, MAX_PAGES); n++) {
    const page = await pdf.getPage(n);
    const base = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: PREVIEW_WIDTH / base.width });
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    await page.render({ canvas, viewport, background: "#ffffff" }).promise;

    // Find the closing line, so the signature can start right where it belongs, on whichever
    // side of the page the letter puts it. Photos and scans have no text, so they skip this.
    let closing: ClosingSpot | undefined;
    const text = await page.getTextContent();
    // Every line of text, as a position on the page (fractions measured from the top left)
    const lines = text.items.flatMap((item) => {
      if (!("str" in item) || !item.str.trim()) return [];
      const [vx, vy] = viewport.convertToViewportPoint(item.transform[4], item.transform[5]);
      return [{ str: item.str.trim(), x: vx / viewport.width, y: vy / viewport.height, w: item.width / base.width, size: Math.hypot(item.transform[2], item.transform[3]) / base.height }];
    });
    for (const line of lines) {
      // Keep the lowest match, since a letter can say "Regards" in the body too
      if (CLOSING.test(line.str) && (!closing || line.y > closing.y)) closing = { x: line.x, y: line.y, w: line.w, size: line.size };
    }
    // The line right under it, lined up with it, is normally the typed name
    if (closing) {
      const here = closing;
      const next = lines.filter((l) => l.y > here.y + here.size * 0.5 && Math.abs(l.x - here.x) < 0.15).sort((a, b) => a.y - b.y)[0];
      closing = { ...here, below: next?.y };
    }
    pages.push({ src: canvas.toDataURL("image/jpeg", 0.85), width: canvas.width, height: canvas.height, closing });
  }
  return pages;
}

/**
 * Stamps the signature onto one page of the original PDF and returns the new file. The rest of
 * the document is left exactly as it was, so text stays sharp and selectable.
 */
export async function stampSignature(
  bytes: Uint8Array,
  pageIndex: number,
  signaturePng: string,
  placement: Placement,
): Promise<Uint8Array> {
  const { PDFDocument } = await import("pdf-lib");
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const page = doc.getPage(pageIndex);
  const png = await doc.embedPng(dataUrlToBytes(signaturePng));

  const { width: pageWidth, height: pageHeight } = page.getSize();
  const width = placement.width * pageWidth;
  const height = (png.height / png.width) * width;
  // Screen positions count down from the top, PDF positions count up from the bottom
  page.drawImage(png, {
    x: placement.x * pageWidth,
    y: pageHeight - placement.y * pageHeight - height,
    width,
    height,
  });
  return doc.save();
}

/* ------------------------------------------------------------------------------------------
 * Writing or editing a letter's text, then turning it into a signed PDF
 * ------------------------------------------------------------------------------------------ */

/**
 * Tidies text read from a PDF or Word file. A PDF gives one line per printed line, so lines that
 * were only wrapped are joined back into paragraphs, and short lines (an address, "Dear Sir,")
 * are kept as they are. A blank line is added after each rebuilt paragraph.
 */
export function reflowLetterText(raw: string): string {
  const lines = raw.replace(/\r\n?/g, "\n").split("\n").map((l) => l.trim());
  const out: string[] = [];
  let buffer = "";
  let parts = 0;

  const flush = () => {
    if (!buffer) return;
    out.push(buffer);
    // A paragraph that was rebuilt from several lines gets a blank line after it
    if (parts > 1) out.push("");
    buffer = "";
    parts = 0;
  };

  for (const line of lines) {
    if (!line) {
      flush();
      if (out.at(-1) !== "") out.push("");
      continue;
    }
    buffer = buffer ? `${buffer} ${line}` : line;
    parts += 1;
    // A short line, or one that ends a sentence, ends the paragraph
    if (line.length < 60 || /[.!?:;]$/.test(line)) flush();
  }
  flush();
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

/**
 * The standard PDF fonts can only print Western characters, so anything else becomes a "?".
 * The Ghana cedi sign is common in letters, so it is written as "GHS" instead of disappearing.
 */
function printable(text: string): string {
  return text
    .replace(/\r/g, "")
    .replace(/\t/g, "    ")
    .replace(/GH₵/g, "GHS")
    .replace(/₵/g, "GHS ")
    .replace(/[^\n\u0020-\u007E\u00A0-\u00FF\u2018\u2019\u201C\u201D\u2013\u2014\u2022\u2026\u20AC]/g, "?");
}

/**
 * Lays out a letter as a clean A4 PDF with real, selectable text. The signature goes straight under
 * the closing line ("Yours faithfully,"), in a fixed-size space so the name below is never pushed far
 * away. With no closing line found, it goes at the end. `align` puts it at the left or right margin.
 */
export async function buildLetterPdf(text: string, signaturePng: string, align: "left" | "right"): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);

  const PAGE_W = 595.28;
  const PAGE_H = 841.89;
  const MARGIN = 64;
  const SIZE = 11.5;
  const LEADING = 16.5;
  const textWidth = PAGE_W - MARGIN * 2;
  const ink = rgb(0.07, 0.09, 0.15);

  let page = doc.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN;
  const nextPage = () => {
    page = doc.addPage([PAGE_W, PAGE_H]);
    y = PAGE_H - MARGIN;
  };

  // The signature is fitted inside one fixed frame, whatever size it was made at
  const png = signaturePng ? await doc.embedPng(dataUrlToBytes(signaturePng)) : null;
  const FRAME_W = 150;
  const FRAME_H = 50;
  const scale = png ? Math.min(FRAME_W / png.width, FRAME_H / png.height) : 0;
  const sigW = png ? png.width * scale : 0;
  const sigH = png ? png.height * scale : 0;

  /** Splits one paragraph into lines that fit the page width. */
  const wrap = (paragraph: string): string[] => {
    const words = paragraph.split(" ");
    const lines: string[] = [];
    let line = "";
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (line && font.widthOfTextAtSize(test, SIZE) > textWidth) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    lines.push(line);
    return lines;
  };

  const placeSignature = () => {
    if (!png) return;
    if (y - sigH - 6 < MARGIN) nextPage();
    page.drawImage(png, { x: align === "right" ? PAGE_W - MARGIN - sigW : MARGIN, y: y - sigH - 2, width: sigW, height: sigH });
    y -= sigH + 8;
  };

  let signed = false;
  for (const paragraph of printable(text).split("\n")) {
    if (!paragraph.trim()) {
      y -= LEADING * 0.7;
      continue;
    }
    for (const line of wrap(paragraph)) {
      if (y - SIZE < MARGIN) nextPage();
      page.drawText(line, { x: MARGIN, y: y - SIZE, size: SIZE, font, color: ink });
      y -= LEADING;
    }
    if (!signed && CLOSING.test(paragraph.trim())) {
      placeSignature();
      signed = true;
    }
  }
  // No closing line to sign under: put the signature at the end instead
  if (!signed) {
    y -= 10;
    placeSignature();
  }
  return doc.save();
}

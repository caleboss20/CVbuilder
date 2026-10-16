/**
 * Everything the "Sign a letter" tool does with files, kept apart from the screen so each
 * step is easy to read. It all runs in the browser: the letter is never uploaded anywhere.
 */

/** Where the signature sits on a page, as fractions (0 to 1) of the page, measured from the top left. */
export type Placement = { x: number; y: number; width: number };

/** One page of the letter, ready to show on screen. */
export type PreviewPage = { src: string; width: number; height: number };

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
    pages.push({ src: canvas.toDataURL("image/jpeg", 0.85), width: canvas.width, height: canvas.height });
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

/**
 * Turns an uploaded CV file into plain text, entirely in the student's browser.
 * The file is never sent to a server. PDF and Word readers are large, so each is
 * loaded only when a file of that type is chosen.
 */

import type { TextItem } from "pdfjs-dist/types/src/display/api";

/** Largest file we will try to read. */
const MAX_BYTES = 8 * 1024 * 1024;
/** A CV longer than this is not a CV; stops a huge PDF from freezing the tab. */
const MAX_PDF_PAGES = 8;

/** Thrown for problems the student can fix, with a message safe to show them. */
export class CvFileError extends Error {}

export async function readCvFile(file: File): Promise<string> {
  if (file.size > MAX_BYTES) throw new CvFileError("That file is larger than 8 MB. Try a smaller copy of your CV.");

  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) return readPdf(file);
  if (name.endsWith(".docx")) return readDocx(file);
  if (name.endsWith(".txt") || name.endsWith(".md")) return file.text();
  if (name.endsWith(".doc")) {
    throw new CvFileError("Old .doc files can't be read. Open it in Word, choose Save As, and pick .docx or PDF.");
  }
  throw new CvFileError("Upload a PDF or Word (.docx) file, or paste your CV text instead.");
}

async function readDocx(file: File): Promise<string> {
  try {
    const mammoth = await import("mammoth");
    const { value } = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    return value;
  } catch {
    throw new CvFileError("We couldn't open that Word file. Try saving it again as .docx, or paste the text instead.");
  }
}

/** The two fields of a PDF text fragment we use: its text and where it sits on the page. */
type PdfTextItem = Pick<TextItem, "str" | "transform">;

async function readPdf(file: File): Promise<string> {
  try {
    const pdfjs = await import("pdfjs-dist");
    // The worker does the heavy parsing off the main thread. `new URL` makes the bundler ship it.
    pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

    const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
    const pages: string[] = [];

    for (let n = 1; n <= Math.min(pdf.numPages, MAX_PDF_PAGES); n++) {
      const page = await pdf.getPage(n);
      const content = await page.getTextContent();
      const items = content.items.filter((i): i is TextItem => "str" in i && i.str.trim() !== "");
      pages.push(itemsToLines(items));
    }
    return pages.join("\n");
  } catch {
    throw new CvFileError("We couldn't read that PDF. If it is a scanned picture, upload the Word version or paste the text.");
  }
}

/**
 * A PDF stores text as loose fragments with coordinates. Fragments on the same
 * horizontal line (similar y) are joined left to right, and lines are read top to
 * bottom, which rebuilds the lines the student sees.
 */
function itemsToLines(items: PdfTextItem[]): string {
  const rows: { y: number; parts: { x: number; text: string }[] }[] = [];
  for (const item of items) {
    const x = item.transform[4];
    const y = item.transform[5];
    const row = rows.find((r) => Math.abs(r.y - y) < 3);
    if (row) row.parts.push({ x, text: item.str });
    else rows.push({ y, parts: [{ x, text: item.str }] });
  }
  return rows
    .sort((a, b) => b.y - a.y) // PDF y grows upwards, so bigger y is higher on the page
    .map((r) => r.parts.sort((a, b) => a.x - b.x).map((p) => p.text).join(" "))
    .join("\n");
}

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
type PdfTextItem = Pick<TextItem, "str" | "transform" | "width">;

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
 * A PDF stores text as loose fragments with coordinates, not as lines. We rebuild
 * the lines a person sees. If the page has two columns (a side column plus a main
 * column), each column is read on its own, top to bottom, so the two do not get
 * mixed up line by line.
 */
function itemsToLines(items: PdfTextItem[]): string {
  const gutter = findGutter(items);
  if (gutter === null) return columnToLines(items);

  const left = items.filter((i) => centreX(i) < gutter);
  const right = items.filter((i) => centreX(i) >= gutter);
  // Read first the column that holds the top of the page (usually the one with the name)
  const top = (list: PdfTextItem[]) => Math.max(...list.map((i) => i.transform[5]));
  const [first, second] = top(left) >= top(right) ? [left, right] : [right, left];
  return `${columnToLines(first)}\n${columnToLines(second)}`;
}

const centreX = (i: PdfTextItem) => i.transform[4] + i.width / 2;

/**
 * Finds the empty vertical strip between two columns, if there is one, and returns
 * its middle x. A single-column page has text across its whole width, so there is
 * no strip. A couple of items may cross it (a name centred across the page).
 */
function findGutter(items: PdfTextItem[]): number | null {
  if (items.length < 20) return null;
  const minX = Math.min(...items.map((i) => i.transform[4]));
  const maxX = Math.max(...items.map((i) => i.transform[4] + i.width));
  const span = maxX - minX;
  if (span < 200) return null;

  let best: { start: number; end: number } | null = null;
  let runStart: number | null = null;
  // Only look in the middle of the page, where a gutter can be
  for (let x = minX + span * 0.2; x <= maxX - span * 0.2; x += 2) {
    const crossing = items.filter((i) => i.transform[4] < x && i.transform[4] + i.width > x).length;
    if (crossing <= 2) {
      runStart ??= x;
      if (!best || x - runStart > best.end - best.start) best = { start: runStart, end: x };
    } else {
      runStart = null;
    }
  }
  if (!best || best.end - best.start < 10) return null;

  const middle = (best.start + best.end) / 2;
  const leftCount = items.filter((i) => centreX(i) < middle).length;
  // Both sides must hold a real share of the text, or it is just a ragged edge
  if (leftCount < items.length * 0.2 || items.length - leftCount < items.length * 0.2) return null;
  return middle;
}

/**
 * Fragments on the same horizontal line (similar y) are joined left to right, and
 * lines are read top to bottom. A space is added between fragments only when there
 * is a visible gap, so a word the PDF split in two ("con" "fi" "dent") stays whole.
 */
function columnToLines(items: PdfTextItem[]): string {
  const rows: { y: number; parts: PdfTextItem[] }[] = [];
  for (const item of items) {
    const y = item.transform[5];
    const row = rows.find((r) => Math.abs(r.y - y) < 3);
    if (row) row.parts.push(item);
    else rows.push({ y, parts: [item] });
  }
  return rows
    .sort((a, b) => b.y - a.y) // PDF y grows upwards, so bigger y is higher on the page
    .map((row) => {
      const parts = row.parts.sort((a, b) => a.transform[4] - b.transform[4]);
      let line = "";
      let end = -Infinity;
      for (const p of parts) {
        const gap = p.transform[4] - end;
        line += (line && gap > 1.5 ? " " : "") + p.str;
        end = p.transform[4] + p.width;
      }
      return line;
    })
    .join("\n");
}

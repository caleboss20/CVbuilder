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

/** Lines that open a letter, which is how we find where the body begins. */
const SALUTATION = /^(dear\b|to whom\b|sir\s*\/\s*madam|good (morning|afternoon|evening)\b)/i;
/** A heading someone has marked themselves, such as "RE: Request for support" or "Subject: ...". */
const EXPLICIT_TITLE = /^(re|ref|subject)\s*:/i;

/** True for a short line that reads like a heading rather than a sentence. */
function looksLikeTitle(line: string): boolean {
  const text = line.trim();
  const words = text.split(/\s+/).length;
  return text.length > 0 && text.length <= 90 && words <= 14 && !/[.,;:]$/.test(text);
}

/**
 * Finds the line that is the letter's heading, such as "My request for financial assistance", and
 * returns its index, or -1 if there is none. A heading is the short line standing on its own between
 * "Dear Sir/Madam," and the first paragraph, or a line the student began with "RE:" or "Subject:".
 * `limit` stops the search at the closing, so the sign-off is never mistaken for a heading.
 */
export function findTitleLine(lines: string[], limit: number): number {
  for (let i = 0; i < limit; i++) if (EXPLICIT_TITLE.test(lines[i].trim())) return i;

  const salutation = lines.findIndex((l) => SALUTATION.test(l.trim()));
  if (salutation < 0) return -1;
  for (let i = salutation + 1; i < Math.min(limit, salutation + 5); i++) {
    if (!lines[i].trim()) continue;
    // It must stand alone: nothing but a blank line (or the greeting) above, and a blank line below
    const aloneAbove = i === salutation + 1 || !lines[i - 1].trim();
    const aloneBelow = i + 1 >= lines.length || !lines[i + 1].trim();
    return aloneAbove && aloneBelow && looksLikeTitle(lines[i]) ? i : -1;
  }
  return -1;
}

/**
 * Finds the sign-off: the closing line ("Yours faithfully,") and the lines that belong with it (the
 * typed name, and a role or contact line if there are some). Returns the index of the closing line
 * and the indexes of the lines in the block, or null if the letter has no closing.
 */
export function findSignoff(lines: string[]): { closing: number; block: number[] } | null {
  let closing = -1;
  lines.forEach((l, i) => {
    if (CLOSING.test(l.trim())) closing = i;
  });
  if (closing < 0) return null;

  const block = [closing];
  let blanks = 0;
  for (let i = closing + 1; i < lines.length && block.length < 5; i++) {
    if (!lines[i].trim()) {
      // Two blank lines in a row end the block
      if (++blanks > 1) break;
      continue;
    }
    blanks = 0;
    block.push(i);
  }
  return { closing, block };
}

/** A date written out ("16 October 2026", "October 16, 2026") or with numbers ("16/10/2026"). */
const DATE_LINE = /^(\d{1,2}(st|nd|rd|th)?\s+)?(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(\d{1,2}(st|nd|rd|th)?,?\s+)?\d{4}$|^\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}$/i;

/**
 * Finds the top of a formal letter: the sender's address (the first paragraph, before "Dear…") and the
 * date, if it is on a line of its own before "Dear…". These are the parts that go together at the top
 * right of a formal letter. Returns null if the letter does not start that way.
 */
export function findTopBlock(lines: string[]): { block: number[]; date: number } | null {
  const salutation = lines.findIndex((l) => SALUTATION.test(l.trim()));
  if (salutation <= 0) return null;

  let i = 0;
  while (i < salutation && !lines[i].trim()) i++;
  const first: number[] = [];
  while (i < salutation && lines[i].trim() && first.length < 7) first.push(i++);

  // The first paragraph is only the sender's address if it reads like one. A single name line, such as
  // the person being written to, stays where it is, because many letters have no addresses at all.
  const looksLikeAddress =
    first.length >= 3 || first.some((n) => /\d|@|\b(box|street|road|avenue|lane|close|estate|hall|hostel|p\.?\s?o\.?)\b/i.test(lines[n]));
  const block = looksLikeAddress ? first : [];

  // A line that is only a date goes at the top right too, wherever it sits above "Dear…"
  const date = lines.findIndex((l, n) => n >= i && n < salutation && DATE_LINE.test(l.trim()));
  const dateOutside = date >= 0 && !block.includes(date) ? date : -1;

  return block.length || dateOutside >= 0 ? { block, date: dateOutside } : null;
}

/**
 * How the text is laid out. "letter" formats a formal letter (heading, sender block, sign-off). "plain" is
 * ordinary text with its line breaks kept. "code" uses a fixed-width font and keeps every space, so
 * indentation in code (SQL, Python, Java) comes out exactly as typed.
 */
export type LetterMode = "letter" | "plain" | "code";

/**
 * Guesses how pasted text should be laid out. Code (SQL, Python, Java and so on) is spotted by its
 * indentation, its keywords and its brackets and semicolons. A letter is spotted by "Dear…" or a closing
 * such as "Yours faithfully". Anything else is plain text. The student can always change the guess.
 */
export function detectTextMode(text: string): LetterMode {
  const lines = text.replace(/\r/g, "").split("\n").filter((l) => l.trim());
  if (lines.length === 0) return "plain";

  const share = (test: (line: string) => boolean) => lines.filter(test).length / lines.length;
  const count = (test: RegExp) => lines.filter((l) => test.test(l)).length;

  const indented = share((l) => /^( {2,}|\t)\S/.test(l));
  const punctuated = share((l) => /[;{}]\s*$/.test(l.trim()));
  const sql = count(/^\s*(select|insert\s+into|update|delete\s+from|create\s+(table|database|view|index)|alter\s+table|drop\s+table|group\s+by|order\s+by|where|join|values)\b/i);
  const keywords = count(/^\s*(def |class |function |import |from \S+ import |#include|public |private |static |for ?\(|while ?\(|if ?\(|const |let |var |return\b)/);

  const looksLikeCode = lines.length >= 3 && (indented >= 0.25 || punctuated >= 0.3 || sql >= 2 || keywords >= 3);
  if (looksLikeCode) return "code";

  const hasLetterParts = lines.some((l) => SALUTATION.test(l.trim()) || CLOSING.test(l.trim()));
  return hasLetterParts ? "letter" : "plain";
}

/** How a title looks: where it sits, and whether it is underlined, bold or in capitals. */
export type TitleStyle = { align: "left" | "center" | "right"; underline: boolean; bold: boolean; caps: boolean; size: number };

/** Everything that shapes the PDF besides the text itself. */
export type BuildOptions = {
  /** The signature as a PNG data URL, or "" for none. */
  signature: string;
  /** Which side the sign-off (and, in a letter, the sender's address) sits on. */
  align: "left" | "right";
  mode: LetterMode;
  /** A title the student typed separately. Empty for none. */
  title: string;
  titleStyle: TitleStyle;
};

/** A tappable area of the preview: where one line of the typed text appears on a page, as fractions of the page. */
export type LetterRegion = { page: number; line: number; x: number; y: number; w: number; h: number };

/** The finished PDF, and where each line of the text sits on its pages. */
export type BuiltLetter = { bytes: Uint8Array; regions: LetterRegion[] };

/**
 * Lays out a letter as a clean A4 PDF with real, selectable text.
 *  - The heading (for example "My request for financial assistance") is made bold, underlined and
 *    centred, in capitals.
 *  - Choosing right moves the top of the letter (the sender's address and the date) to the top right, as in
 *    a formal letter. The recipient, heading and body stay on the left.
 *  - The whole sign-off moves together to the chosen side: the closing line ("Yours faithfully,"), the
 *    signature and the typed name. The signature gets a fixed-size space directly under the closing line.
 *  - With no closing line found, the signature goes at the end.
 */
export async function buildLetterPdf(text: string, options: BuildOptions): Promise<BuiltLetter> {
  const { signature: signaturePng, align, mode, title, titleStyle } = options;
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const mono = await doc.embedFont(StandardFonts.Courier);

  const PAGE_W = 595.28;
  const PAGE_H = 841.89;
  // Code gets smaller type and wider margins, so more of each line fits on the page
  const code = mode === "code";
  const MARGIN = code ? 48 : 64;
  const SIZE = code ? 9.5 : 11.5;
  const LEADING = code ? 13.5 : 16.5;
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
  const SIG_SPACE = sigH + 8;

  // Where each line of the text ended up on the page, so tapping the preview can jump back to it
  const boxes = new Map<string, { page: number; line: number; x0: number; x1: number; top: number; bottom: number }>();
  const mark = (line: number, x: number, width: number, top: number, height: number) => {
    const pageIndex = doc.getPageCount() - 1;
    const key = `${pageIndex}:${line}`;
    const box = boxes.get(key);
    const x1 = x + width;
    const bottom = top - height;
    if (box) {
      box.x0 = Math.min(box.x0, x);
      box.x1 = Math.max(box.x1, x1);
      box.top = Math.max(box.top, top);
      box.bottom = Math.min(box.bottom, bottom);
    } else {
      boxes.set(key, { page: pageIndex, line, x0: x, x1, top, bottom });
    }
  };

  type Font = typeof font;
  /** Splits one paragraph into lines that fit the page width. */
  const wrap = (paragraph: string, f: Font, size: number): string[] => {
    const lines: string[] = [];
    let line = "";
    for (const word of paragraph.split(" ")) {
      const test = line ? `${line} ${word}` : word;
      if (line && f.widthOfTextAtSize(test, size) > textWidth) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    lines.push(line);
    return lines;
  };

  /**
   * Breaks a code line that is too wide for the page. Spaces are never collapsed, and the lines that
   * continue it are indented a little further than the original, so it is clear they belong together.
   */
  const wrapCode = (line: string): string[] => {
    const max = Math.max(10, Math.floor(textWidth / mono.widthOfTextAtSize("M", SIZE)));
    if (line.length <= max) return [line];
    const indent = line.match(/^ */)?.[0] ?? "";
    const continuation = indent.length + 2 < max / 2 ? `${indent}  ` : "";
    const rows = [line.slice(0, max)];
    let rest = line.slice(max);
    const room = max - continuation.length;
    while (rest.length > room) {
      rows.push(continuation + rest.slice(0, room));
      rest = rest.slice(room);
    }
    if (rest) rows.push(continuation + rest);
    return rows;
  };

  const lines = printable(text).split("\n");
  const isLetter = mode === "letter";
  const signoff = isLetter ? findSignoff(lines) : null;
  const titleIndex = isLetter && !title.trim() ? findTitleLine(lines, signoff ? signoff.closing : lines.length) : -1;
  const inSignoff = new Set(signoff?.block ?? []);
  // With right alignment the sender's address and the date form a block at the top right
  const top = isLetter && align === "right" ? findTopBlock(lines) : null;
  const inTop = new Set(top ? [...top.block, ...(top.date >= 0 ? [top.date] : [])] : []);

  /** Draws the sender's address, then the date under it, lined up with each other at the right margin. */
  const drawTop = ({ block, date }: { block: number[]; date: number }) => {
    const rows = block.map((n) => lines[n].trim());
    const dateRow = date >= 0 ? lines[date].trim() : "";
    const widest = Math.max(...[...rows, dateRow].map((r) => font.widthOfTextAtSize(r, SIZE)));
    const x = PAGE_W - MARGIN - widest;
    rows.forEach((row, n) => {
      mark(block[n], x, font.widthOfTextAtSize(row, SIZE), y, LEADING);
      page.drawText(row, { x, y: y - SIZE, size: SIZE, font, color: ink });
      y -= LEADING;
    });
    if (dateRow) {
      // A small gap after an address, but none when the date is the only thing at the top
      if (rows.length) y -= LEADING * 0.5;
      mark(date, x, font.widthOfTextAtSize(dateRow, SIZE), y, LEADING);
      page.drawText(dateRow, { x, y: y - SIZE, size: SIZE, font, color: ink });
      y -= LEADING;
    }
  };

  /** Draws the sign-off as one block: closing line, signature, then the name lines under it. */
  const drawSignoff = (block: number[]) => {
    const rows = block.map((i) => lines[i].trim());
    const widest = Math.max(...rows.map((r) => font.widthOfTextAtSize(r, SIZE)), png ? sigW : 0);
    // A block on the right keeps its lines lined up with each other, with the block's right edge at the margin
    const x = align === "right" ? PAGE_W - MARGIN - widest : MARGIN;
    const need = rows.length * LEADING + (png ? SIG_SPACE : 0);
    if (y - need < MARGIN) nextPage();

    rows.forEach((row, n) => {
      mark(block[n], x, font.widthOfTextAtSize(row, SIZE), y, LEADING);
      page.drawText(row, { x, y: y - SIZE, size: SIZE, font, color: ink });
      y -= LEADING;
      // The signature goes straight under the closing line, before the name
      if (n === 0 && png) {
        // Tapping the signature selects the closing line it belongs to
        mark(block[0], x, sigW, y, sigH);
        page.drawImage(png, { x, y: y - sigH + 4, width: sigW, height: sigH });
        y -= SIG_SPACE;
      }
    });
  };

  /**
   * Draws a title in the student's chosen style: left, centre or right, with or without underline,
   * bold and capitals. `lineIndex` is the line of text it came from, or -1 for the separate title box.
   */
  const drawTitle = (heading: string, lineIndex: number, size: number) => {
    const face = titleStyle.bold ? bold : font;
    const rows = wrap(titleStyle.caps ? heading.trim().toUpperCase() : heading.trim(), face, size);
    y -= 4;
    for (const row of rows) {
      if (y - size < MARGIN) nextPage();
      const w = face.widthOfTextAtSize(row, size);
      const x = titleStyle.align === "center" ? (PAGE_W - w) / 2 : titleStyle.align === "right" ? PAGE_W - MARGIN - w : MARGIN;
      mark(lineIndex, x, w, y, LEADING + 1);
      page.drawText(row, { x, y: y - size, size, font: face, color: ink });
      if (titleStyle.underline) {
        page.drawLine({ start: { x, y: y - size - 2 }, end: { x: x + w, y: y - size - 2 }, thickness: 0.8, color: ink });
      }
      // Each row of a title takes room for its own size, so a large title never touches the text below
      y -= Math.max(LEADING + 1, size * 1.3 + 4);
    }
    y -= 4 + size * 0.4;
  };

  // A title typed in its own box. In a letter it goes under "Dear…", elsewhere at the very top.
  const boxTitle = title.trim();
  const titleSize = titleStyle.size;
  const salutationIndex = isLetter ? lines.findIndex((l) => SALUTATION.test(l.trim())) : -1;
  if (boxTitle && salutationIndex < 0) drawTitle(boxTitle, -1, titleSize);

  let signoffDrawn = false;
  let topDrawn = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (inTop.has(i)) {
      // The top block is drawn once, when its first line is reached
      if (!topDrawn && top) {
        drawTop(top);
        topDrawn = true;
      }
      continue;
    }
    if (inSignoff.has(i)) {
      // The sign-off is drawn once, as a block, when its first line is reached
      if (!signoffDrawn && signoff) {
        drawSignoff(signoff.block);
        signoffDrawn = true;
      }
      continue;
    }
    if (!line.trim()) {
      y -= code ? LEADING : LEADING * 0.7;
      continue;
    }
    if (i === titleIndex) {
      drawTitle(line, i, titleSize);
      continue;
    }
    const rowFont = code ? mono : font;
    for (const row of code ? wrapCode(line) : wrap(line, font, SIZE)) {
      if (y - SIZE < MARGIN) nextPage();
      mark(i, MARGIN, rowFont.widthOfTextAtSize(row, SIZE), y, LEADING);
      page.drawText(row, { x: MARGIN, y: y - SIZE, size: SIZE, font: rowFont, color: ink });
      y -= LEADING;
    }
    if (boxTitle && i === salutationIndex) drawTitle(boxTitle, -1, titleSize);
  }

  // No closing line to sign under: put the signature at the end instead
  if (!signoff && png) {
    y -= 10;
    if (y - SIG_SPACE < MARGIN) nextPage();
    page.drawImage(png, { x: align === "right" ? PAGE_W - MARGIN - sigW : MARGIN, y: y - sigH, width: sigW, height: sigH });
  }
  // Turn the boxes into fractions of the page, with a little breathing room, for the preview to use
  const regions: LetterRegion[] = [...boxes.values()].map((b) => ({
    page: b.page,
    line: b.line,
    x: Math.max(0, (b.x0 - 4) / PAGE_W),
    y: Math.max(0, (PAGE_H - b.top - 2) / PAGE_H),
    w: Math.min(1, (b.x1 - b.x0 + 8) / PAGE_W),
    h: (b.top - b.bottom + 4) / PAGE_H,
  }));
  return { bytes: await doc.save(), regions };
}
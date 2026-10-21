/**
 * Puts a small "scan to verify" QR code in the corner of a finished certificate PDF. The code opens
 * /verify, which asks the database whether this person really was issued this certificate.
 * Only certificates from a shared link get one, because those are the only ones the server knows about.
 */

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { dataUrlBytes } from "./certificates";

/** Size of the code and its gap from the page edge, in PDF points. */
const SIZE = 46;
const MARGIN = 14;

/** Returns the same PDF with a QR code (pointing at `url`) on the bottom-right of its first page. */
export async function stampVerifyQr(bytes: Uint8Array, url: string): Promise<Uint8Array> {
  const { toDataURL } = await import("qrcode");
  const png = dataUrlBytes(await toDataURL(url, { width: 360, margin: 1, errorCorrectionLevel: "M" }));

  const doc = await PDFDocument.load(bytes);
  const image = await doc.embedPng(png);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const page = doc.getPage(0);
  const { width } = page.getSize();
  const x = width - MARGIN - SIZE;

  // A white backing so the code scans on any design, then the code and a tiny caption
  page.drawRectangle({ x: x - 3, y: MARGIN - 3, width: SIZE + 6, height: SIZE + 13, color: rgb(1, 1, 1), opacity: 0.92 });
  page.drawImage(image, { x, y: MARGIN + 8, width: SIZE, height: SIZE });
  const caption = "Scan to verify";
  page.drawText(caption, { x: x + (SIZE - font.widthOfTextAtSize(caption, 5.5)) / 2, y: MARGIN, size: 5.5, font, color: rgb(0.3, 0.3, 0.3) });
  return doc.save();
}

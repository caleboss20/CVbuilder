/**
 * Reads an organiser's logo from a file and shrinks it. Certificates only need a small picture, and
 * a big one would make every PDF in a batch heavy (the logo is stored in each file), so it is scaled
 * to fit 420 by 280 pixels and kept as a PNG, which keeps transparent backgrounds.
 */

const MAX_FILE_BYTES = 8 * 1024 * 1024;
const MAX_WIDTH = 420;
const MAX_HEIGHT = 280;

export type Logo = { dataUrl: string; width: number; height: number };

/** Returns the logo as a PNG data URL with its size, or throws an Error with a message that is safe to show. */
export async function readLogo(file: File): Promise<Logo> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose a picture, such as a PNG or JPG.");
  if (file.size > MAX_FILE_BYTES) throw new Error("That picture is too large. Please use one under 8 MB.");

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("We could not read that picture. Try a PNG or JPG.");
  }

  const scale = Math.min(1, MAX_WIDTH / bitmap.width, MAX_HEIGHT / bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Your browser could not process the picture.");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return { dataUrl: canvas.toDataURL("image/png"), width: canvas.width, height: canvas.height };
}

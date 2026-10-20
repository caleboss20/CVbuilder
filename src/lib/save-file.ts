/** Starts a browser download of some bytes (or a ready-made Blob) under the given file name. */
export function saveFile(data: Uint8Array | Blob, fileName: string, type: string) {
  const blob = data instanceof Blob ? data : new Blob([data.slice().buffer], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  // Give the browser a moment to start the download before the address is released
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

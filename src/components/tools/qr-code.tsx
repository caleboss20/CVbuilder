"use client";

import { useEffect, useState } from "react";
import { saveFile } from "@/lib/save-file";

/**
 * A QR code for a link, drawn on the device (the library loads only when one is shown). People scan
 * it from a projector or a printed sheet, so the link never has to be typed or sent one by one.
 */
export function QrCode({ url, label }: { url: string; label: string }) {
  const [src, setSrc] = useState("");

  useEffect(() => {
    let cancelled = false;
    import("qrcode").then(({ toDataURL }) =>
      toDataURL(url, { width: 640, margin: 2, errorCorrectionLevel: "M" }).then((data) => {
        if (!cancelled) setSrc(data);
      }),
    );
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (!src) return <div className="h-40 w-40 animate-pulse rounded-md bg-fg/10" />;
  return (
    <div className="space-y-2">
      {/* eslint-disable-next-line @next/next/no-img-element -- a locally drawn code */}
      <img src={src} alt={`QR code to ${label}`} className="h-40 w-40 rounded-md bg-white p-1" />
      <button
        type="button"
        onClick={() => fetch(src).then((r) => r.blob()).then((blob) => saveFile(blob, "certificate-qr.png", "image/png"))}
        className="inline-flex h-9 items-center rounded-md px-3 text-sm font-medium text-fg ring-1 ring-fg/20 hover:bg-fg/5"
      >
        Download QR (PNG)
      </button>
    </div>
  );
}

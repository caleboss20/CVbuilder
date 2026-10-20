"use client";

import { useState } from "react";
import { CertificateMaker } from "./certificate-maker";
import { OwnCertificateMaker } from "./own-certificate-maker";

/**
 * The certificate page's two ways to work: pick one of our designs, or upload a certificate the
 * organiser already has. Both stay on the page (the one not in use is only hidden), so switching
 * between them never loses what was typed.
 */
export function CertificatesTool() {
  const [mode, setMode] = useState<"design" | "own">("design");

  const tab = (id: typeof mode, label: string, hint: string) => (
    <button
      type="button"
      role="tab"
      aria-selected={mode === id}
      onClick={() => setMode(id)}
      className={`flex-1 rounded-lg px-4 py-3 text-left transition-colors ${mode === id ? "bg-brand-600/15 ring-1 ring-brand-400/60" : "ring-1 ring-fg/12 hover:bg-fg/5"}`}
    >
      <span className="block text-[15px] font-medium text-fg">{label}</span>
      <span className="mt-0.5 block text-xs text-fg/55">{hint}</span>
    </button>
  );

  return (
    <div>
      <div role="tablist" aria-label="How to make your certificates" className="mx-auto mb-8 flex max-w-2xl flex-col gap-3 sm:flex-row">
        {tab("design", "Pick a design", "Choose from 23 ready-made designs")}
        {tab("own", "Use my own certificate", "Upload a Canva PDF or a photo, then add the names")}
      </div>
      <div hidden={mode !== "design"}>
        <CertificateMaker />
      </div>
      <div hidden={mode !== "own"}>
        <OwnCertificateMaker />
      </div>
    </div>
  );
}

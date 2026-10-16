"use client";

import { useEffect, useRef, useState } from "react";
import { CvFileError, readCvFile } from "@/lib/read-cv-file";
import { buildLetterPdf, reflowLetterText, renderPages, type PreviewPage } from "@/lib/sign-pdf";
import { trackEvent } from "@/lib/track";

const PLACEHOLDER = `Dear Sir/Madam,

I am writing to ask for support with my tuition fees this semester...

Yours faithfully,
AMA BOATENG`;

/**
 * Write a letter from nothing, or bring one in from a PDF or Word file, edit the words, and add a
 * signature. There are no job, internship or scholarship questions: it is just the student's own
 * text. The preview is the real PDF, so what they see is what they download.
 */
export function OwnLetterEditor({ signature }: { signature: string }) {
  const [text, setText] = useState("");
  const [align, setAlign] = useState<"left" | "right">("left");
  const [pages, setPages] = useState<PreviewPage[]>([]);
  const [bytes, setBytes] = useState<Uint8Array | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("letter");
  const run = useRef(0);

  // Rebuild the preview a moment after the student stops typing
  useEffect(() => {
    if (!text.trim()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- an empty letter has no preview
      setPages([]);
      setBytes(null);
      return;
    }
    const id = ++run.current;
    const timer = setTimeout(async () => {
      try {
        const pdf = await buildLetterPdf(text, signature, align);
        const rendered = await renderPages(pdf);
        // A newer edit may have started while this one was building: ignore the stale result
        if (id !== run.current) return;
        setBytes(pdf);
        setPages(rendered);
        setError("");
      } catch {
        if (id === run.current) setError("We could not build the preview. Try removing unusual symbols from the text.");
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [text, signature, align]);

  async function openFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const raw = await readCvFile(file, "letter");
      const tidy = reflowLetterText(raw);
      if (!tidy) throw new CvFileError("We found no text in that file. If it is a scan or a photo, use “Keep my file as it is” instead.");
      setText(tidy);
      setFileName(file.name.replace(/\.[^.]+$/, ""));
    } catch (e) {
      setError(e instanceof CvFileError ? e.message : "We could not open that file.");
    } finally {
      setBusy(false);
    }
  }

  function download() {
    if (!bytes) return;
    const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: "application/pdf" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}${signature ? "_signed" : ""}.pdf`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    trackEvent("letter_signed");
  }

  return (
    <div className="space-y-5">
      <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-fg/25 bg-fg/[0.03] px-4 py-6 text-center text-sm text-fg/65 hover:text-fg">
        <span className="font-medium text-fg">Upload a PDF or Word file to edit</span>
        <span className="text-xs text-fg/50">Or skip this and type or paste your letter below. It stays on your device.</span>
        <input
          type="file"
          accept=".pdf,.docx,.txt,application/pdf"
          className="sr-only"
          onChange={(e) => {
            void openFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </label>
      {busy && <p className="text-sm text-fg/60">Opening your letter…</p>}

      <div>
        <label htmlFor="own-letter" className="mb-1.5 block text-sm font-medium text-fg/80">
          Your letter
        </label>
        <textarea
          id="own-letter"
          rows={14}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={PLACEHOLDER}
          className="w-full resize-y rounded-lg border border-fg/12 bg-fg/[0.03] px-3.5 py-3 text-[15px] leading-relaxed text-fg placeholder:text-fg/30 focus:border-brand-400/70 focus:outline-none"
        />
        <p className="mt-1.5 text-xs text-fg/45">
          Write it all here, including “Dear…” and the closing. Your signature is placed right under “Yours faithfully” or “Yours sincerely”.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="text-fg/60">Signature on the</span>
        <div role="radiogroup" aria-label="Signature side" className="flex gap-1 rounded-lg bg-fg/5 p-1">
          {(["left", "right"] as const).map((side) => (
            <button
              key={side}
              type="button"
              role="radio"
              aria-checked={align === side}
              onClick={() => setAlign(side)}
              className={`rounded-md px-3 py-1.5 capitalize transition-colors ${align === side ? "bg-fg/10 text-fg ring-1 ring-fg/15" : "text-fg/55 hover:text-fg"}`}
            >
              {side}
            </button>
          ))}
        </div>
        {!signature && <span className="text-xs text-fg/45">Add your signature in step 1 to see it here.</span>}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {pages.length > 0 && (
        <div className="space-y-3" aria-label="Preview of your letter">
          {pages.map((p, i) => (
            <div key={i} className="mx-auto max-w-[640px] overflow-hidden rounded-lg bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element -- a local page preview, nothing to optimise */}
              <img src={p.src} alt={`Page ${i + 1} of your letter`} className="block w-full" draggable={false} />
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={download}
        disabled={!bytes}
        className="flex w-full items-center justify-center rounded-md bg-brand-600 py-3 text-[15px] font-medium text-white ring-1 ring-brand-300/60 shadow-[0_0_22px_rgb(124_128_255/0.5)] hover:bg-brand-500 disabled:opacity-40 disabled:shadow-none sm:w-auto sm:px-8"
      >
        Download letter as PDF
      </button>
      <p className="text-xs text-fg/45">The signs “₵” and some other symbols can’t be printed, so the cedi sign is written as GHS.</p>
    </div>
  );
}

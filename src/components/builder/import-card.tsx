"use client";

import { useEffect, useRef, useState } from "react";
import { hasEnoughText } from "@/lib/cv-check";
import { importCv, type ImportResult } from "@/lib/cv-import";
import type { CvTemplateName } from "@/lib/cv-examples";
import { CvFileError, readCvFile } from "@/lib/read-cv-file";

/**
 * "Upload my CV": for students who already have a CV and just want to tidy it up
 * or add to it. The file is read in the browser (never uploaded), turned into the
 * builder's fields, and the student carries on in the normal editor with the live
 * preview.
 */
export function ImportCard({
  template,
  highlight,
  onImport,
}: {
  /** Template chosen on the homepage, kept for the imported CV. */
  template?: CvTemplateName | null;
  /** True when the student arrived from an "Import my CV" button. */
  highlight?: boolean;
  onImport: (result: ImportResult) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasted, setPasted] = useState("");
  const ref = useRef<HTMLElement>(null);

  // Coming from the homepage button, bring the card into view
  useEffect(() => {
    if (highlight) ref.current?.scrollIntoView({ block: "center" });
  }, [highlight]);

  function finish(text: string) {
    if (!hasEnoughText(text)) {
      throw new CvFileError("We could not find enough text. If your file is a scan or a picture, paste your CV text instead.");
    }
    onImport(importCv(text, template ?? "ats"));
  }

  async function fromFile(file: File | undefined) {
    if (!file) return;
    setError("");
    setBusy(true);
    try {
      finish(await readCvFile(file));
    } catch (e) {
      setError(e instanceof CvFileError ? e.message : "Something went wrong reading that file. Try pasting your CV text instead.");
    } finally {
      setBusy(false);
    }
  }

  function fromPaste() {
    setError("");
    try {
      finish(pasted);
    } catch (e) {
      setError(e instanceof CvFileError ? e.message : "We could not read that text.");
    }
  }

  return (
    <section
      ref={ref}
      aria-labelledby="import-cv"
      className={`rounded-2xl border p-5 sm:p-6 ${
        highlight
          ? "border-brand-400/60 bg-brand-500/[0.08] shadow-[0_0_50px_-20px_rgb(124_128_255/0.7)]"
          : "border-fg/10 bg-fg/[0.03]"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="import-cv" className="text-lg font-medium text-fg">
          I already have a CV
        </h2>
        <span className="text-xs text-fg/50">PDF or Word</span>
      </div>
      <p className="mt-1.5 text-sm text-fg/60">
        Upload it and we’ll fill the builder for you. Then change anything, add sections, pick a new template and download.
      </p>

      <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-md bg-brand-600 py-3 text-[15px] font-medium text-white ring-1 ring-brand-300/60 shadow-[0_0_22px_rgb(124_128_255/0.5)] transition-colors hover:bg-brand-500">
        {busy ? "Reading your CV…" : "Upload my CV"}
        <input
          type="file"
          accept=".pdf,.docx,.txt"
          disabled={busy}
          className="sr-only"
          onChange={(e) => {
            void fromFile(e.target.files?.[0]);
            e.target.value = ""; // lets the same file be chosen again
          }}
        />
      </label>

      <button type="button" onClick={() => setPasteOpen((v) => !v)} className="mt-2 py-2 text-sm text-brand-300 hover:text-fg">
        {pasteOpen ? "Hide pasted text" : "Or paste your CV text"}
      </button>

      {pasteOpen && (
        <div className="mt-2">
          <label htmlFor="import-paste" className="sr-only">
            Paste your CV text
          </label>
          <textarea
            id="import-paste"
            rows={7}
            value={pasted}
            onChange={(e) => setPasted(e.target.value)}
            placeholder="Paste your whole CV here, with headings like Experience and Education."
            className="w-full resize-y rounded-lg border border-fg/12 bg-ink-950/60 px-3.5 py-3 text-sm leading-relaxed text-fg placeholder:text-fg/35 focus:border-brand-400/70 focus:outline-none"
          />
          <button
            type="button"
            onClick={fromPaste}
            disabled={pasted.trim().length < 40}
            className="mt-2 w-full rounded-md px-4 py-2.5 text-sm font-medium text-fg ring-1 ring-fg/20 hover:bg-fg/5 disabled:opacity-40"
          >
            Use this text
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-3 rounded-lg border border-red-400/30 bg-red-400/10 p-3 text-sm text-fg/85">
          {error}
        </p>
      )}
      <p className="mt-3 text-xs text-fg/45">Read in your browser. Your file is never uploaded.</p>
    </section>
  );
}

/** Shown in the editor after an import: what we found, and the lines we could not place. */
export function ImportBanner({ info, onDismiss }: { info: ImportResult; onDismiss: () => void }) {
  const { found, leftover } = info;
  const parts = [
    found.jobs && `${found.jobs} ${found.jobs === 1 ? "role" : "roles"}`,
    found.schools && `${found.schools} ${found.schools === 1 ? "school" : "schools"}`,
    found.skills && `${found.skills} skills`,
    found.projects && `${found.projects} ${found.projects === 1 ? "project" : "projects"}`,
  ].filter(Boolean);

  return (
    <div className="mb-5 rounded-xl border border-brand-400/30 bg-brand-500/[0.08] p-4 text-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-fg/80">
          <span className="font-medium text-fg">We imported your CV.</span>{" "}
          {parts.length > 0 ? `We found ${parts.join(", ")}.` : "We could not place much automatically."} Check each step
          and fix anything that looks off. The preview updates as you type.
        </p>
        <button type="button" onClick={onDismiss} className="shrink-0 text-xs text-fg/55 hover:text-fg">
          Dismiss
        </button>
      </div>

      {leftover.length > 0 && (
        <details className="mt-3">
          <summary className="cursor-pointer text-fg/70 hover:text-fg">
            {leftover.length} {leftover.length === 1 ? "line" : "lines"} we could not place
          </summary>
          <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto border-l-2 border-fg/15 pl-3 text-xs text-fg/60">
            {leftover.map((l, i) => (
              <li key={`${i}-${l}`}>{l}</li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-fg/50">Copy anything you still want into the right step.</p>
        </details>
      )}
    </div>
  );
}

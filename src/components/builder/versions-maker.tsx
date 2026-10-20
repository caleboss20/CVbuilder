"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { CvPageFrame } from "@/components/cv/cv-page-frame";
import { CvTemplateView } from "@/components/cv/cv-templates";
import { HideEmptySections } from "@/components/cv/hide-empty-sections";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { BUILDER_STORAGE_KEY, blankCv, cvStrength, toDoc, uid, type BuilderCv } from "@/lib/builder";
import {
  MAX_VERSIONS,
  deriveCv,
  loadVersions,
  mixedVersions,
  newVersion,
  saveVersions,
  templatePool,
  versionFileName,
  type CvVersion,
} from "@/lib/cv-versions";
import { accentSwatches, templates } from "@/lib/templates";
import { FILL_FROM_SCORE, PrintCopy, cvStyle } from "./print-copy";
import { useDownloadGate } from "./use-download-gate";

const inputClass =
  "w-full rounded-lg border border-fg/12 bg-fg/[0.03] px-3 py-2 text-sm text-fg placeholder:text-fg/30 focus:border-brand-400/70 focus:outline-none";

/** Waits for the browser to draw a few frames, so the print copy is laid out before the print dialog opens. */
const frames = (count: number) =>
  new Promise<void>((resolve) => {
    const step = (left: number) => (left <= 0 ? resolve() : requestAnimationFrame(() => step(left - 1)));
    step(count);
  });

/**
 * Make the same CV in several looks, one for each company. Each version is a template, a colour and a
 * role line laid over the saved CV, so changing the CV in the builder changes every version. Each one
 * downloads as its own PDF with real text, named after the version.
 */
export function VersionsMaker() {
  const [status, setStatus] = useState<"loading" | "none" | "ready">("loading");
  const [base, setBase] = useState<BuilderCv | null>(null);
  const [versions, setVersions] = useState<CvVersion[]>([]);
  // The version being printed right now, and the ones still waiting their turn
  const [printing, setPrinting] = useState<CvVersion | null>(null);
  const queue = useRef<CvVersion[]>([]);
  const [busy, setBusy] = useState(false);

  // Load the saved CV and any versions made earlier, after the page is on screen
  useEffect(() => {
    let stored: BuilderCv | null = null;
    try {
      const raw = localStorage.getItem(BUILDER_STORAGE_KEY);
      if (raw) stored = { ...blankCv(), ...JSON.parse(raw) };
    } catch {
      // Corrupt or blocked storage: treated as no CV
    }
    if (!stored || !stored.name.trim()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- nothing saved to make versions of
      setStatus("none");
      return;
    }
    // A CV saved before payments existed has no id yet; give it one so a payment can be tied to it
    if (!stored.cvId) {
      stored.cvId = typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `${uid()}${uid()}${uid()}`;
      try {
        localStorage.setItem(BUILDER_STORAGE_KEY, JSON.stringify(stored));
      } catch {}
    }
    setBase(stored);
    setVersions(loadVersions() ?? mixedVersions(stored, 3));
    setStatus("ready");
  }, []);

  useEffect(() => {
    if (status === "ready") saveVersions(versions);
  }, [status, versions]);

  const change = (id: string, patch: Partial<CvVersion>) => setVersions((list) => list.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  const pool = useMemo(() => (base ? templatePool(base) : []), [base]);

  /** Prints each queued version in turn, naming each PDF after its version. */
  async function printQueue() {
    if (!base) return;
    setBusy(true);
    const used = new Set<string>();
    for (const version of queue.current) {
      setPrinting(version);
      await frames(3);
      const previous = document.title;
      // The browser uses the page title as the PDF's file name
      document.title = versionFileName(base, version, used);
      window.print();
      document.title = previous;
    }
    setPrinting(null);
    setBusy(false);
  }

  // Downloads go through the same payment gate as the builder: one payment covers every version of this CV
  const gate = useDownloadGate({ cvId: base?.cvId, onPdf: () => void printQueue(), onWord: () => void printQueue() });
  const download = (list: CvVersion[]) => {
    queue.current = list;
    void gate.request("pdf");
  };

  if (status === "loading") return <div className="grid min-h-screen place-items-center text-sm text-fg/50">Loading your CV…</div>;

  if (status === "none" || !base) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-2xl font-medium text-fg">Build your CV first</h1>
        <p className="text-sm text-fg/60">Versions are your CV in different looks. Once you have a CV with your name on it, come back here to make one for each company.</p>
        <Link href="/builder" className="inline-flex h-11 items-center justify-center rounded-md bg-brand-600 px-6 text-[15px] font-medium text-white ring-1 ring-brand-300/60">
          Go to the CV builder
        </Link>
      </div>
    );
  }

  const full = versions.length >= MAX_VERSIONS;

  return (
    <>
      <div className="min-h-screen print:hidden">
        <header className="sticky top-0 z-30 border-b border-fg/10 bg-ink-950/90 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
            <Logo />
            <Link href="/builder" className="ml-auto text-sm text-fg/70 hover:text-fg">
              ← Back to my CV
            </Link>
            <ThemeToggle />
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6">
          <h1 className="text-3xl font-medium tracking-tight text-fg sm:text-4xl">Your CV, one look for each company</h1>
          <p className="mt-3 max-w-2xl text-fg/65">
            Applying to several places? Give each its own design and a role line that matches the job. Your details stay the same everywhere:
            change them in the builder and every version updates.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={() => download(versions)}
              className="inline-flex h-11 items-center justify-center rounded-md bg-brand-600 px-5 text-[15px] font-medium text-white ring-1 ring-brand-300/60 shadow-[0_0_18px_rgb(124_128_255/0.45)] hover:bg-brand-500 disabled:opacity-50"
            >
              {busy ? "Making your PDFs…" : `Download all ${versions.length} PDFs`}
            </button>
            <button
              type="button"
              disabled={full}
              onClick={() => setVersions((list) => [...list, newVersion(pool.find((id) => !list.some((v) => v.template === id)) ?? pool[0], `Version ${list.length + 1}`)])}
              className="inline-flex h-11 items-center justify-center rounded-md px-4 text-sm font-medium text-fg ring-1 ring-fg/20 hover:bg-fg/5 disabled:opacity-40"
            >
              + Add a version {full && `(up to ${MAX_VERSIONS})`}
            </button>
            <button
              type="button"
              onClick={() => setVersions((list) => list.map((v, i) => ({ ...v, template: pool[i % pool.length] })))}
              className="text-sm font-medium text-brand-300 hover:text-fg"
            >
              Give each a different template
            </button>
            <label className="text-sm text-fg/70">
              <span className="sr-only">Use one template for all</span>
              <select
                value=""
                onChange={(e) => e.target.value && setVersions((list) => list.map((v) => ({ ...v, template: e.target.value as CvVersion["template"] })))}
                className="rounded-md border border-fg/15 bg-ink-900 px-2.5 py-2 text-sm text-fg"
              >
                <option value="">Use one template for all…</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p className="mt-3 max-w-2xl text-sm text-fg/50">
            Your browser asks you to save each PDF in turn, named after its version. On a phone, download one at a time. Photo templates show a photo only if you
            added one in the builder.
          </p>

          {/* grid-cols-1 (not the default auto column) lets a card shrink below the full-size CV inside it */}
          <ul className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {versions.map((v, i) => (
              <li key={v.id} className="min-w-0">
                <VersionCard
                  base={base}
                  version={v}
                  index={i}
                  busy={busy}
                  canRemove={versions.length > 1}
                  onChange={(patch) => change(v.id, patch)}
                  onRemove={() => setVersions((list) => list.filter((x) => x.id !== v.id))}
                  onDownload={() => download([v])}
                />
              </li>
            ))}
          </ul>
        </main>
        {gate.dialog}
      </div>

      {/* Full-size copy of the version being saved, seen only by the printer */}
      {printing && <PrintCopy cv={deriveCv(base, printing)} onFit={() => {}} />}
    </>
  );
}

/** One version: a live picture of it, its name, role line, template and colour, and a download button. */
function VersionCard({
  base,
  version,
  index,
  busy,
  canRemove,
  onChange,
  onRemove,
  onDownload,
}: {
  base: BuilderCv;
  version: CvVersion;
  index: number;
  busy: boolean;
  canRemove: boolean;
  onChange: (patch: Partial<CvVersion>) => void;
  onRemove: () => void;
  onDownload: () => void;
}) {
  const cv = useMemo(() => deriveCv(base, version), [base, version]);
  const doc = useMemo(() => toDoc(cv), [cv]);
  const score = useMemo(() => cvStrength(cv).score, [cv]);

  return (
    <div className="rounded-xl border border-fg/10 bg-fg/[0.03] p-4">
      <div style={cvStyle(cv, score)} className="overflow-hidden rounded-md bg-white ring-1 ring-fg/10">
        <CvPageFrame lazy fill={score >= FILL_FROM_SCORE}>
          <HideEmptySections type={cv.cvType}>
            <CvTemplateView template={version.template} doc={doc} role={cv.role || "Your role"} photo={cv.photo} />
          </HideEmptySections>
        </CvPageFrame>
      </div>

      <div className="mt-4 space-y-3">
        <label className="block text-sm font-medium text-fg/80">
          Name this version
          <input className={`${inputClass} mt-1.5`} value={version.label} onChange={(e) => onChange({ label: e.target.value })} placeholder={`MTN Ghana, Data Analyst Intern`} />
        </label>
        <label className="block text-sm font-medium text-fg/80">
          Role line under your name
          <input className={`${inputClass} mt-1.5`} value={version.role} onChange={(e) => onChange({ role: e.target.value })} placeholder={base.role || "Your role"} />
        </label>
        <label className="block text-sm font-medium text-fg/80">
          Template
          <select className={`${inputClass} mt-1.5 bg-ink-900`} value={version.template} onChange={(e) => onChange({ template: e.target.value as CvVersion["template"] })}>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
                {t.tags.includes("ats") ? " · ATS-safe" : ""}
                {t.tags.includes("photo") ? " · photo" : ""}
              </option>
            ))}
          </select>
        </label>
        <div>
          <p className="text-sm font-medium text-fg/80">Colour</p>
          <ul className="mt-1.5 flex flex-wrap gap-2">
            {accentSwatches.map((s) => (
              <li key={s.name}>
                <button
                  type="button"
                  aria-label={s.name}
                  aria-pressed={version.accent === s.color}
                  onClick={() => onChange({ accent: s.color })}
                  style={s.color ? { backgroundColor: s.color } : undefined}
                  className={`size-6 rounded-full ring-offset-2 ring-offset-ink-950 ${s.color ? "" : "bg-linear-to-br from-fg/30 to-fg/10"} ${version.accent === s.color ? "ring-2 ring-fg" : "ring-1 ring-fg/25"}`}
                />
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center justify-between gap-3 pt-1">
          <button
            type="button"
            disabled={busy}
            onClick={onDownload}
            className="inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium text-fg ring-1 ring-fg/20 hover:bg-fg/5 disabled:opacity-50"
          >
            Download PDF
          </button>
          {canRemove && (
            <button type="button" onClick={onRemove} className="text-sm text-fg/50 hover:text-red-400" aria-label={`Remove version ${index + 1}`}>
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { Field, TextArea } from "@/components/builder/fields";
import { SignaturePad } from "@/components/builder/signature-pad";
import { FREE_BATCH, MAX_NAMES, SAMPLE_NAMES, fileNameFor, parseNames } from "@/lib/certificate-names";
import {
  COLORS,
  DESIGNS,
  KINDS,
  buildCombinedPdf,
  buildSeparatePdfs,
  defaultSettings,
  previewCertificate,
  type CertDesign,
  type CertKind,
  type CertSettings,
} from "@/lib/certificates";
import type { PreviewPage } from "@/lib/sign-pdf";
import { whatsappLink } from "@/lib/site";

/** A name to show in the preview before the organiser has pasted a list. */
const PLACEHOLDER_NAME = "Akosua Mensah";

/** Starts a browser download of some bytes. */
function save(data: Uint8Array | Blob, fileName: string, type: string) {
  const blob = data instanceof Blob ? data : new Blob([data.slice().buffer], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

const section = "rounded-xl border border-fg/10 bg-fg/[0.03] p-5 sm:p-6";
const heading = "text-base font-medium text-fg";
const primaryButton =
  "inline-flex h-12 w-full items-center justify-center rounded-md bg-brand-600 px-5 text-[15px] font-medium text-white ring-1 ring-brand-300/60 shadow-[0_0_22px_rgb(124_128_255/0.5)] hover:bg-brand-500 disabled:opacity-50 disabled:shadow-none";
const secondaryButton =
  "inline-flex h-12 w-full items-center justify-center rounded-md px-5 text-[15px] font-medium text-fg ring-1 ring-fg/20 hover:bg-fg/5 disabled:opacity-50";

/**
 * Makes certificates for a whole list of people at once: paste the names, choose a design, fill in
 * the event, and download a ZIP of separate PDFs or one PDF to print. Everything is made on the
 * organiser's own device, so the list of names is never uploaded.
 */
export function CertificateMaker() {
  const [settings, setSettings] = useState<CertSettings>(defaultSettings);
  const [namesText, setNamesText] = useState("");
  const [previewAt, setPreviewAt] = useState(0);
  const [preview, setPreview] = useState<PreviewPage | null>(null);
  const [thumbs, setThumbs] = useState<Partial<Record<CertDesign, string>>>({});
  const [progress, setProgress] = useState<{ done: number; total: number; what: string } | null>(null);
  const [error, setError] = useState("");

  const parsed = useMemo(() => parseNames(namesText), [namesText]);
  // The free version makes up to FREE_BATCH certificates at a time; the rest wait for the paid plan
  const names = parsed.names.slice(0, FREE_BATCH);
  const leftOut = Math.max(parsed.names.length - FREE_BATCH, 0);
  const biggerBatch = whatsappLink(`Hi CV11, I need to make ${parsed.names.length} certificates at once. How can I get a bigger batch?`);
  const set = (patch: Partial<CertSettings>) => setSettings((s) => ({ ...s, ...patch }));

  // Today's date as the default, filled in after the page loads so the prerendered page never depends on the clock
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time default from the browser's clock
    setSettings((s) => (s.date ? s : { ...s, date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) }));
  }, []);

  // Keep the preview index inside the list when names change
  const index = Math.min(previewAt, Math.max(names.length - 1, 0));
  const previewName = names[index] ?? PLACEHOLDER_NAME;

  // Live preview of the chosen certificate, a moment after the last change
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      previewCertificate(settings, previewName)
        .then((page) => {
          if (!cancelled) {
            setPreview(page);
            setError("");
          }
        })
        .catch(() => !cancelled && setError("The preview could not be drawn. Please refresh the page."));
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [settings, previewName]);

  // Small pictures of every design in its own colours, drawn once one after another
  useEffect(() => {
    let cancelled = false;
    (async () => {
      for (const design of DESIGNS) {
        try {
          const page = await previewCertificate({ ...defaultSettings(), design: design.id, color: design.color, date: "12 March 2026", event: "your event" }, PLACEHOLDER_NAME);
          if (cancelled) return;
          setThumbs((t) => ({ ...t, [design.id]: page.src }));
        } catch {
          return;
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function pickKind(kind: CertKind) {
    const k = KINDS[kind];
    set({ kind, subtitle: k.subtitle, intro: k.intro, body: k.body });
  }

  function pickDesign(id: CertDesign) {
    set({ design: id, color: DESIGNS.find((d) => d.id === id)?.color ?? settings.color });
  }

  const ready = names.length > 0 && !progress;
  const base = (settings.event.trim() || "Certificates").replace(/[^\p{L}\p{N}]+/gu, "_").replace(/^_+|_+$/g, "") || "Certificates";

  async function downloadZip() {
    setError("");
    // A single certificate is just a PDF named after the person, not a ZIP holding one file
    if (names.length === 1) {
      try {
        save(await buildCombinedPdf(settings, names), `${fileNameFor(names[0], new Set())}.pdf`, "application/pdf");
      } catch {
        setError("Something went wrong while making the PDF. Please try again.");
      }
      return;
    }
    setProgress({ done: 0, total: names.length, what: "Making certificates" });
    try {
      const files = await buildSeparatePdfs(settings, names, (done) => setProgress({ done, total: names.length, what: "Making certificates" }));
      const { zipSync } = await import("fflate");
      const used = new Set<string>();
      const entries: Record<string, Uint8Array> = {};
      for (const file of files) entries[`${fileNameFor(file.name, used)}.pdf`] = file.bytes;
      // PDFs are already compressed, so storing them uncompressed is faster
      save(zipSync(entries, { level: 0 }), `${base}.zip`, "application/zip");
    } catch {
      setError("Something went wrong while making the files. Please try again, or try fewer names.");
    }
    setProgress(null);
  }

  async function downloadOnePdf() {
    setError("");
    setProgress({ done: 0, total: names.length, what: "Making the PDF" });
    try {
      const bytes = await buildCombinedPdf(settings, names, (done) => setProgress({ done, total: names.length, what: "Making the PDF" }));
      save(bytes, `${base}.pdf`, "application/pdf");
    } catch {
      setError("Something went wrong while making the PDF. Please try again, or try fewer names.");
    }
    setProgress(null);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="space-y-5">
        {/* 1. Design */}
        <section className={section}>
          <h2 className={heading}>1. Choose a template</h2>
          <p className="mt-1 text-sm text-fg/60">{DESIGNS.length} designs. Tap one, then change its colour below.</p>
          <ul className="mt-4 grid max-h-[26rem] grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3">
            {DESIGNS.map((d) => (
              <li key={d.id}>
                <button
                  type="button"
                  onClick={() => pickDesign(d.id)}
                  aria-pressed={settings.design === d.id}
                  className={`block w-full overflow-hidden rounded-lg border text-left ${settings.design === d.id ? "border-brand-400 ring-2 ring-brand-400/40" : "border-fg/12 hover:border-fg/30"}`}
                >
                  <span className="block aspect-[4/3] w-full bg-fg/[0.06]">
                    {thumbs[d.id] ? (
                      // eslint-disable-next-line @next/next/no-img-element -- a locally made picture, not a file to optimise
                      <img src={thumbs[d.id]} alt="" className="size-full object-contain" />
                    ) : (
                      <span className="block size-full animate-pulse bg-fg/10" />
                    )}
                  </span>
                  <span className="block px-2 py-1.5 text-xs font-medium text-fg/80">{d.label}</span>
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-sm font-medium text-fg/80">Colour</p>
          <ul className="mt-2 flex flex-wrap gap-2.5">
            {COLORS.map((c) => (
              <li key={c.hex}>
                <button
                  type="button"
                  aria-label={c.name}
                  aria-pressed={settings.color === c.hex}
                  onClick={() => set({ color: c.hex })}
                  style={{ backgroundColor: c.hex }}
                  className={`size-9 rounded-full ring-offset-2 ring-offset-ink-950 ${settings.color === c.hex ? "ring-2 ring-fg" : "ring-1 ring-fg/25"}`}
                />
              </li>
            ))}
          </ul>
        </section>

        {/* 2. The names */}
        <section className={section}>
          <h2 className={heading}>2. Add the names</h2>
          <p className="mt-1 text-sm text-fg/60">Paste a list, one name per line. A column copied from Excel, Google Sheets or a WhatsApp list works.</p>
          <div className="mt-4">
            <TextArea
              label="Names"
              rows={8}
              value={namesText}
              onChange={setNamesText}
              placeholder={"Akosua Mensah\nKwame Boateng\nAbena Owusu"}
              hint={
                <span>
                  {parsed.names.length > 0 ? <b className="text-fg">{parsed.names.length} names</b> : "No names yet"}
                  {parsed.recased > 0 && ` · fixed capital letters on ${parsed.recased}`}
                  {parsed.duplicates > 0 && ` · removed ${parsed.duplicates} repeated`}
                  {parsed.overLimit > 0 && ` · ${parsed.overLimit} over the limit of ${MAX_NAMES} were left out`}
                </span>
              }
            />
          </div>
          <button type="button" onClick={() => setNamesText(SAMPLE_NAMES.slice(0, FREE_BATCH).join("\n"))} className="mt-3 text-sm font-medium text-brand-300 hover:text-fg">
            Try it with sample Ghanaian names
          </button>
          {leftOut > 0 && (
            <div className="mt-4 rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-fg/80" role="status">
              <p>
                The free version makes up to <b className="text-fg">{FREE_BATCH} certificates</b> at a time. You pasted {parsed.names.length}, so the{" "}
                <b className="text-fg">first {FREE_BATCH}</b> will be made and {leftOut} will be left out.
              </p>
              <p className="mt-1.5 text-fg/65">
                Download these first, then paste the rest. Or{" "}
                {biggerBatch ? (
                  <a href={biggerBatch} target="_blank" rel="noopener noreferrer" className="font-medium text-brand-300 underline underline-offset-2">
                    message us about a bigger batch
                  </a>
                ) : (
                  "ask us about a bigger batch"
                )}
                .
              </p>
            </div>
          )}
        </section>

        {/* 3. What it says */}
        <section className={`${section} space-y-4`}>
          <h2 className={heading}>3. What it says</h2>
          <div>
            <p className="mb-1.5 text-sm font-medium text-fg/80">Kind of certificate</p>
            <ul className="flex flex-wrap gap-2">
              {(Object.keys(KINDS) as CertKind[]).map((k) => (
                <li key={k}>
                  <button
                    type="button"
                    onClick={() => pickKind(k)}
                    aria-pressed={settings.kind === k}
                    className={`rounded-md px-3 py-1.5 text-sm ${settings.kind === k ? "bg-brand-600 text-white" : "text-fg/80 ring-1 ring-fg/15 hover:bg-fg/5"}`}
                  >
                    {KINDS[k].label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <Field label="Event or programme" value={settings.event} onChange={(event) => set({ event })} placeholder="Leadership Workshop 2026" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Date" value={settings.date} onChange={(date) => set({ date })} placeholder="12 March 2026" />
            <Field label="Organised by (optional)" value={settings.issuer} onChange={(issuer) => set({ issuer })} placeholder="KNUST SRC" hint="Use {issuer} in the sentence below to show it." />
          </div>
          <TextArea
            label="Sentence under the name"
            rows={3}
            value={settings.body}
            onChange={(body) => set({ body })}
            hint="{event}, {date} and {issuer} are filled in for you."
          />
          <Field label="Line under CERTIFICATE" value={settings.subtitle} onChange={(subtitle) => set({ subtitle })} placeholder="OF PARTICIPATION" />
        </section>

        {/* 4. Signatures */}
        <section className={`${section} space-y-4`}>
          <h2 className={heading}>4. Who signs</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Signer name" value={settings.signer1.name} onChange={(name) => set({ signer1: { ...settings.signer1, name } })} placeholder="Dr. Ama Boateng" />
            <Field label="Their title" value={settings.signer1.title} onChange={(title) => set({ signer1: { ...settings.signer1, title } })} placeholder="Programme Director" />
            <Field label="Second signer (optional)" value={settings.signer2.name} onChange={(name) => set({ signer2: { ...settings.signer2, name } })} placeholder="Kofi Mensah" />
            <Field label="Their title" value={settings.signer2.title} onChange={(title) => set({ signer2: { ...settings.signer2, title } })} placeholder="President" />
          </div>
          <details className="rounded-lg border border-fg/10 p-4">
            <summary className="cursor-pointer text-sm font-medium text-fg/80">Add the first signer&apos;s signature (optional)</summary>
            <div className="mt-4">
              <SignaturePad value={settings.signature} onChange={(signature) => set({ signature })} />
            </div>
          </details>
        </section>
      </div>

      {/* The preview and the download buttons stay in view while the form scrolls */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="overflow-hidden rounded-xl border border-fg/10 bg-fg/[0.03] p-3">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element -- a locally made picture
            <img src={preview.src} alt={`Preview of the certificate for ${previewName}`} className="mx-auto h-auto max-h-[72vh] w-auto max-w-full rounded-md bg-white object-contain" />
          ) : (
            <div className="aspect-[1.414] w-full animate-pulse rounded-md bg-fg/10" />
          )}
          <div className="mt-3 flex items-center justify-between gap-3 text-sm text-fg/60">
            <span className="truncate">Showing: {previewName}</span>
            {names.length > 1 && (
              <span className="flex shrink-0 gap-2">
                <button type="button" onClick={() => setPreviewAt(Math.max(index - 1, 0))} disabled={index === 0} className="rounded-md px-2.5 py-1 ring-1 ring-fg/15 disabled:opacity-40" aria-label="Previous name">
                  ←
                </button>
                <button type="button" onClick={() => setPreviewAt(Math.min(index + 1, names.length - 1))} disabled={index >= names.length - 1} className="rounded-md px-2.5 py-1 ring-1 ring-fg/15 disabled:opacity-40" aria-label="Next name">
                  →
                </button>
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 space-y-2.5">
          <button type="button" onClick={downloadZip} disabled={!ready} className={primaryButton}>
            {names.length === 0 ? "Add names to download" : names.length === 1 ? "Download the certificate (PDF)" : `Download ${names.length} certificates (ZIP)`}
          </button>
          <button type="button" onClick={downloadOnePdf} disabled={!ready} className={secondaryButton}>
            Download one PDF to print
          </button>
          {progress && (
            <div role="status" className="text-sm text-fg/70">
              {progress.what}: {progress.done} of {progress.total}
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-fg/10">
                <div className="h-full bg-brand-400 transition-all" style={{ width: `${(progress.done / progress.total) * 100}%` }} />
              </div>
            </div>
          )}
          {error && <p className="text-sm text-amber-300" role="alert">{error}</p>}
          <p className="text-xs text-fg/45">The ZIP holds one PDF per person, named after them. Your list never leaves this device.</p>
        </div>
      </div>
    </div>
  );
}

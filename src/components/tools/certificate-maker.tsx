"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SharePanel } from "@/components/tools/share-panel";
import { Field, TextArea } from "@/components/builder/fields";
import { SignaturePad } from "@/components/builder/signature-pad";
import { readLogo } from "@/lib/certificate-logo";
import { FREE_BATCH, MAX_NAMES, SAMPLE_NAMES, fileNameFor, parseNames } from "@/lib/certificate-names";
import {
  COLORS,
  DESIGNS,
  KINDS,
  buildCombinedPdf,
  buildSeparatePdfs,
  defaultLogoPlace,
  defaultSettings,
  previewCertificate,
  type CertDesign,
  type CertKind,
  type CertSettings,
  type LogoPlace,
} from "@/lib/certificates";
import { pageSize } from "@/lib/certificate-design-types";
import { designById } from "@/lib/certificate-designs";
import type { PreviewPage } from "@/lib/sign-pdf";
import { whatsappLink } from "@/lib/site";
import { trackEvent } from "@/lib/track";

/** A name to show in the preview before the organiser has pasted a list. */
const PLACEHOLDER_NAME = "Akosua Mensah";

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

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
  const [logoError, setLogoError] = useState("");
  // The logo's own size in pixels, to keep its shape when it is moved to another design
  const [logoSize, setLogoSize] = useState<{ width: number; height: number } | null>(null);
  // The preview picture, so a dragged logo can be turned into a position on the page
  const previewBox = useRef<HTMLDivElement>(null);

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
      previewCertificate({ ...settings, logo: "" }, previewName)
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
    const patch: Partial<CertSettings> = { design: id, color: DESIGNS.find((d) => d.id === id)?.color ?? settings.color };
    // A tall page and a wide page need different spots, so the logo returns to the new design's usual place
    const turns = pageSize(designById(id)).width !== pageSize(designById(settings.design)).width;
    if (settings.logo && turns && logoSize) patch.logoPlace = defaultLogoPlace(id, logoSize.width / logoSize.height);
    set(patch);
  }

  /** Moves or resizes the logo. Positions are fractions of the page, kept a little inside the edges. */
  function placeLogo(patch: Partial<LogoPlace>) {
    setSettings((s) => {
      if (!s.logoPlace) return s;
      const next = { ...s.logoPlace, ...patch };
      return { ...s, logoPlace: { x: clamp(next.x, 0.02, 0.98), y: clamp(next.y, 0.02, 0.98), w: clamp(next.w, 0.05, 0.6) } };
    });
  }

  /** Starts dragging the logo with a finger or mouse: it follows the pointer until it is let go. */
  function dragLogo(e: React.PointerEvent<HTMLDivElement>) {
    const place = settings.logoPlace;
    const box = previewBox.current?.getBoundingClientRect();
    if (!place || !box) return;
    e.preventDefault();
    const start = { px: e.clientX, py: e.clientY, x: place.x, y: place.y };
    const move = (ev: PointerEvent) => placeLogo({ x: start.x + (ev.clientX - start.px) / box.width, y: start.y + (ev.clientY - start.py) / box.height });
    const stop = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
  }

  /** The arrow keys nudge the logo, for people who do not use a mouse or touch. */
  function nudgeLogo(e: React.KeyboardEvent<HTMLDivElement>) {
    const step = e.shiftKey ? 0.05 : 0.01;
    const place = settings.logoPlace;
    if (!place) return;
    const moves: Record<string, Partial<LogoPlace>> = {
      ArrowLeft: { x: place.x - step },
      ArrowRight: { x: place.x + step },
      ArrowUp: { y: place.y - step },
      ArrowDown: { y: place.y + step },
    };
    const patch = moves[e.key];
    if (!patch) return;
    e.preventDefault();
    placeLogo(patch);
  }

  const ready = names.length > 0 && !progress;
  const base = (settings.event.trim() || "Certificates").replace(/[^\p{L}\p{N}]+/gu, "_").replace(/^_+|_+$/g, "") || "Certificates";

  async function downloadZip() {
    setError("");
    // A single certificate is just a PDF named after the person, not a ZIP holding one file
    if (names.length === 1) {
      try {
        save(await buildCombinedPdf(settings, names), `${fileNameFor(names[0], new Set())}.pdf`, "application/pdf");
        trackEvent("certificates_made", { count: 1, design: settings.design });
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
      trackEvent("certificates_made", { count: names.length, design: settings.design });
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
      trackEvent("certificates_made", { count: names.length, design: settings.design });
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
            <summary className="cursor-pointer text-sm font-medium text-fg/80">
              Add {settings.signer1.name.trim() || "the first signer"}&apos;s signature (optional)
            </summary>
            <div className="mt-4">
              <SignaturePad value={settings.signature} onChange={(signature) => set({ signature })} note="Shown above their name on every certificate in this batch." />
            </div>
          </details>
          {/* Each signer has their own pad, so two people can sign the same certificate */}
          <details className="rounded-lg border border-fg/10 p-4">
            <summary className="cursor-pointer text-sm font-medium text-fg/80">
              Add {settings.signer2.name.trim() || "the second signer"}&apos;s signature (optional)
            </summary>
            <div className="mt-4">
              <SignaturePad value={settings.signature2} onChange={(signature2) => set({ signature2 })} note="Shown above their name on every certificate in this batch." />
            </div>
          </details>
        </section>

        {/* 5. Logo */}
        <section className={`${section} space-y-3`}>
          <h2 className={heading}>5. Your logo (optional)</h2>
          <p className="text-sm text-fg/60">
            Add your school, club or company logo, then drag it on the certificate to put it exactly where you want. A PNG with a see-through
            background looks best.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex h-10 cursor-pointer items-center rounded-md px-4 text-sm font-medium text-fg ring-1 ring-fg/20 hover:bg-fg/5">
              {settings.logo ? "Change logo" : "Choose a logo"}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (!file) return;
                  try {
                    const logo = await readLogo(file);
                    setLogoSize({ width: logo.width, height: logo.height });
                    // A new logo starts in the design's usual spot; one being replaced keeps the place and size it had
                    set({ logo: logo.dataUrl, logoPlace: settings.logoPlace ?? defaultLogoPlace(settings.design, logo.width / logo.height) });
                    setLogoError("");
                  } catch (err) {
                    setLogoError(err instanceof Error ? err.message : "We could not use that picture.");
                  }
                }}
              />
            </label>
            {settings.logo && (
              <button type="button" onClick={() => set({ logo: "", logoPlace: undefined })} className="text-sm text-fg/55 hover:text-fg">
                Remove
              </button>
            )}
          </div>
          {settings.logo && settings.logoPlace && (
            <div className="space-y-2.5">
              <label className="block text-sm font-medium text-fg/80">
                Logo size
                <input
                  type="range"
                  min={5}
                  max={50}
                  value={Math.round(settings.logoPlace.w * 100)}
                  onChange={(e) => placeLogo({ w: Number(e.target.value) / 100 })}
                  className="mt-1.5 block w-full"
                />
              </label>
              <button
                type="button"
                onClick={() => logoSize && set({ logoPlace: defaultLogoPlace(settings.design, logoSize.width / logoSize.height) })}
                className="text-sm font-medium text-brand-300 hover:text-fg"
              >
                Put it back in the usual spot
              </button>
            </div>
          )}
          {logoError && <p className="text-sm text-amber-300" role="alert">{logoError}</p>}
        </section>
      </div>

      {/* The preview and the download buttons stay in view while the form scrolls */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="overflow-hidden rounded-xl border border-fg/10 bg-fg/[0.03] p-3">
          {preview ? (
            <div ref={previewBox} className="relative mx-auto w-fit max-w-full">
              {/* eslint-disable-next-line @next/next/no-img-element -- a locally made picture */}
              <img src={preview.src} alt={`Preview of the certificate for ${previewName}`} className="block h-auto max-h-[72vh] w-auto max-w-full rounded-md bg-white object-contain" />
              {settings.logo && settings.logoPlace && (
                // The logo is drawn here, above the picture, so it moves under the finger at once. The same
                // position and size are used when the PDFs are made.
                <div
                  tabIndex={0}
                  role="group"
                  aria-label="Your logo. Drag it to move it, or use the arrow keys."
                  onPointerDown={dragLogo}
                  onKeyDown={nudgeLogo}
                  style={{ left: `${settings.logoPlace.x * 100}%`, top: `${settings.logoPlace.y * 100}%`, width: `${settings.logoPlace.w * 100}%`, touchAction: "none" }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-sm outline-1 outline-dashed outline-brand-300/80 hover:outline-brand-300 focus-visible:outline-2 focus-visible:outline-brand-400 active:cursor-grabbing"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- the organiser's own picture */}
                  <img src={settings.logo} alt="" draggable={false} className="pointer-events-none block w-full select-none" />
                </div>
              )}
            </div>
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
        <SharePanel title={settings.event} build={() => settings} names={names} />
      </div>
    </div>
  );
}

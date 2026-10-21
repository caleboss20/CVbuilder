"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { TextArea } from "@/components/builder/fields";
import { SignaturePad } from "@/components/builder/signature-pad";
import { SharePanel } from "@/components/tools/share-panel";
import { useVerifyOption, verifyMessage } from "@/components/tools/verify-option";
import { useCertLimit } from "@/components/tools/use-cert-limit";
import { FREE_BATCH, MAX_NAMES, SAMPLE_NAMES, fileNameFor, parseNames } from "@/lib/certificate-names";
import {
  OWN_FONTS,
  buildOwnCombined,
  buildOwnSeparate,
  defaultNamePlace,
  readOwnDesign,
  type NamePlace,
  packOwnShare,
  type OwnDesign,
  type OwnSignature,
} from "@/lib/certificate-own";
import { saveFile } from "@/lib/save-file";
import { siteConfig, whatsappLink } from "@/lib/site";
import { trackEvent } from "@/lib/track";

const PLACEHOLDER_NAME = "Akosua Mensah";
const SWATCHES = ["#111111", "#1f2937", "#14305c", "#7a1f2b", "#b07d1a", "#ffffff"];

const section = "rounded-xl border border-fg/10 bg-fg/[0.03] p-5 sm:p-6";
const heading = "text-base font-medium text-fg";
const primaryButton =
  "inline-flex h-12 w-full items-center justify-center rounded-md bg-brand-600 px-5 text-[15px] font-medium text-white ring-1 ring-brand-300/60 shadow-[0_0_22px_rgb(124_128_255/0.5)] hover:bg-brand-500 disabled:opacity-50 disabled:shadow-none";
const secondaryButton =
  "inline-flex h-12 w-full items-center justify-center rounded-md px-5 text-[15px] font-medium text-fg ring-1 ring-fg/20 hover:bg-fg/5 disabled:opacity-50";

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/** Loads the four name fonts into the page once, so the preview can write names in them. */
function useNameFonts(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    Promise.all(
      OWN_FONTS.map(async (f) => {
        const face = new FontFace(f.family, `url(/fonts/${f.file})`);
        document.fonts.add(await face.load());
      }),
    )
      .catch(() => undefined)
      .finally(() => !cancelled && setReady(true));
    return () => {
      cancelled = true;
    };
  }, []);
  return ready;
}

/** Width of an element, kept up to date as it changes. */
function useWidth(ref: React.RefObject<HTMLElement | null>, watch: unknown): number {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setWidth(el.getBoundingClientRect().width);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, watch]);
  return width;
}

/**
 * Make certificates on a design the organiser already has, such as a Canva PDF or a photo of a
 * certificate with the name left blank. They drag the name to where it belongs, and we write every
 * name onto it. The same free limit as the built-in designs applies. Nothing is uploaded.
 */
export function OwnCertificateMaker() {
  const [design, setDesign] = useState<OwnDesign | null>(null);
  const [place, setPlace] = useState<NamePlace>(defaultNamePlace);
  // Up to two signatures the organiser drew or uploaded, each placed by dragging
  const [sigs, setSigs] = useState<(OwnSignature | null)[]>([null, null]);
  const [namesText, setNamesText] = useState("");
  const [previewAt, setPreviewAt] = useState(0);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fontsReady = useNameFonts();
  const box = useRef<HTMLDivElement>(null);
  const boxWidth = useWidth(box, design);

  const parsed = useMemo(() => parseNames(namesText), [namesText]);
  // Same rule as the built-in designs: a free batch holds the first FREE_BATCH names
  const limit = useCertLimit();
  const names = parsed.names.slice(0, limit);
  const leftOut = Math.max(parsed.names.length - limit, 0);
  const verify = useVerifyOption({ title: "Certificates", issuer: "", names });
  const biggerBatch = whatsappLink(`Hi CV11, I need to make ${parsed.names.length} certificates on my own design. How can I get a bigger batch?`);
  const index = Math.min(previewAt, Math.max(names.length - 1, 0));
  const previewName = names[index] ?? PLACEHOLDER_NAME;

  const font = OWN_FONTS.find((f) => f.id === place.font) ?? OWN_FONTS[0];
  const shown = place.font === "display" ? previewName.toUpperCase() : previewName;

  // The size the name is written at in the preview: as large as the chosen size, shrunk to fit its width,
  // then scaled from PDF points to the pixels on screen
  const previewPx = useMemo(() => {
    if (!design || !boxWidth) return 0;
    const context = document.createElement("canvas").getContext("2d");
    let size = place.size;
    const room = place.w * design.width;
    if (context && fontsReady) {
      context.font = `${size}px ${font.family}`;
      while (size > 10 && ((context.font = `${size}px ${font.family}`), context.measureText(shown).width > room)) size -= 2;
    }
    return size * (boxWidth / design.width);
  }, [design, boxWidth, place.size, place.w, font.family, shown, fontsReady]);

  const move = (patch: Partial<NamePlace>) =>
    setPlace((p) => ({ ...p, ...patch, x: clamp(patch.x ?? p.x, 0.02, 0.98), y: clamp(patch.y ?? p.y, 0.02, 0.98) }));

  /** Starts a drag with a finger or mouse: `apply` is called with the new position until the pointer is let go. */
  function startDrag(e: React.PointerEvent<HTMLDivElement>, from: { x: number; y: number }, apply: (x: number, y: number) => void) {
    const rect = box.current?.getBoundingClientRect();
    if (!rect) return;
    e.preventDefault();
    const start = { px: e.clientX, py: e.clientY, x: from.x, y: from.y };
    const onMove = (ev: PointerEvent) => apply(start.x + (ev.clientX - start.px) / rect.width, start.y + (ev.clientY - start.py) / rect.height);
    const stop = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
  }

  const dragName = (e: React.PointerEvent<HTMLDivElement>) => startDrag(e, place, (x, y) => move({ x, y }));

  /** Sets or removes one signature. A new one starts near the bottom, on the left or the right. */
  function setSignature(index: number, dataUrl: string) {
    setSigs((list) =>
      list.map((s, i) => (i !== index ? s : dataUrl ? { dataUrl, x: s?.x ?? (index === 0 ? 0.3 : 0.7), y: s?.y ?? 0.8, w: s?.w ?? 0.18 } : null)),
    );
  }

  const moveSignature = (index: number, patch: Partial<OwnSignature>) =>
    setSigs((list) =>
      list.map((s, i) => (i === index && s ? { ...s, ...patch, x: clamp(patch.x ?? s.x, 0.02, 0.98), y: clamp(patch.y ?? s.y, 0.02, 0.98) } : s)),
    );

  function nudgeName(e: React.KeyboardEvent<HTMLDivElement>) {
    const step = e.shiftKey ? 0.05 : 0.01;
    const patch: Record<string, Partial<NamePlace>> = {
      ArrowLeft: { x: place.x - step },
      ArrowRight: { x: place.x + step },
      ArrowUp: { y: place.y - step },
      ArrowDown: { y: place.y + step },
    };
    if (!patch[e.key]) return;
    e.preventDefault();
    move(patch[e.key]);
  }

  async function chooseFile(file: File | undefined) {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      setDesign(await readOwnDesign(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "We could not use that file.");
    }
    setLoading(false);
  }

  const ready = Boolean(design) && names.length > 0 && !progress;
  const placedSigs = sigs.filter((s): s is OwnSignature => s !== null);

  async function download(kind: "zip" | "pdf") {
    if (!design) return;
    setError("");
    setProgress({ done: 0, total: names.length });
    const onProgress = (done: number) => setProgress({ done, total: names.length });
    try {
      const stamp = await verify.prepare();
      if (names.length === 1) {
        saveFile(await stamp(await buildOwnCombined(design, names, place, undefined, placedSigs), names), `${fileNameFor(names[0], new Set())}.pdf`, "application/pdf");
      } else if (kind === "pdf") {
        saveFile(await stamp(await buildOwnCombined(design, names, place, onProgress, placedSigs), names), "Certificates.pdf", "application/pdf");
      } else {
        const files = await buildOwnSeparate(design, names, place, onProgress, placedSigs);
        const { zipSync } = await import("fflate");
        const used = new Set<string>();
        const entries: Record<string, Uint8Array> = {};
        for (const file of files) entries[`${fileNameFor(file.name, used)}.pdf`] = await stamp(file.bytes, [file.name]);
        saveFile(zipSync(entries, { level: 0 }), "Certificates.zip", "application/zip");
      }
      trackEvent("certificates_made", { count: names.length, design: "own" });
    } catch (err) {
      setError(verifyMessage(err) ?? "Something went wrong while making the files. Please try again, or try fewer names.");
    }
    setProgress(null);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="space-y-5">
        <section className={`${section} space-y-3`}>
          <h2 className={heading}>1. Upload your certificate</h2>
          <p className="text-sm text-fg/60">
            Upload the certificate you already have, with the name left blank: a PDF from Canva, or a photo or scan. We write every name onto it.
          </p>
          <label className="inline-flex h-11 cursor-pointer items-center rounded-md px-4 text-sm font-medium text-fg ring-1 ring-fg/20 hover:bg-fg/5">
            {loading ? "Reading…" : design ? "Choose a different file" : "Choose a PDF or picture"}
            <input
              type="file"
              accept="application/pdf,image/*"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                void chooseFile(file);
              }}
            />
          </label>
          {design?.extraPages && <p className="text-sm text-amber-300">That PDF has more than one page. Only the first page is used.</p>}
          {error && <p className="text-sm text-amber-300" role="alert">{error}</p>}
          <p className="text-xs text-fg/45">Your design and your names stay on this device. Nothing is uploaded.</p>
        </section>

        <section className={`${section} space-y-4`}>
          <h2 className={heading}>2. Where the name goes</h2>
          {design ? (
            <>
              <p className="text-sm text-fg/60">Drag the name on the preview to the right place. Then choose how it looks.</p>
              <div>
                <p className="mb-1.5 text-sm font-medium text-fg/80">Style</p>
                <ul className="flex flex-wrap gap-2">
                  {OWN_FONTS.map((f) => (
                    <li key={f.id}>
                      <button
                        type="button"
                        aria-pressed={place.font === f.id}
                        onClick={() => move({ font: f.id })}
                        className={`rounded-md px-3 py-1.5 text-sm ${place.font === f.id ? "bg-brand-600 text-white" : "text-fg/80 ring-1 ring-fg/15 hover:bg-fg/5"}`}
                      >
                        {f.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-1.5 text-sm font-medium text-fg/80">Colour</p>
                <ul className="flex flex-wrap items-center gap-2.5">
                  {SWATCHES.map((c) => (
                    <li key={c}>
                      <button
                        type="button"
                        aria-label={c}
                        aria-pressed={place.color === c}
                        onClick={() => move({ color: c })}
                        style={{ backgroundColor: c }}
                        className={`size-8 rounded-full ring-offset-2 ring-offset-ink-950 ${place.color === c ? "ring-2 ring-fg" : "ring-1 ring-fg/25"}`}
                      />
                    </li>
                  ))}
                  <li>
                    <label className="text-sm text-fg/70">
                      <span className="sr-only">Pick any colour</span>
                      <input type="color" value={place.color} onChange={(e) => move({ color: e.target.value })} className="h-8 w-10 cursor-pointer rounded bg-transparent" />
                    </label>
                  </li>
                </ul>
              </div>
              <label className="block text-sm font-medium text-fg/80">
                Size
                <input type="range" min={16} max={140} value={place.size} onChange={(e) => move({ size: Number(e.target.value) })} className="mt-1.5 block w-full" />
              </label>
              <label className="block text-sm font-medium text-fg/80">
                Longest name width
                <input type="range" min={20} max={95} value={Math.round(place.w * 100)} onChange={(e) => move({ w: Number(e.target.value) / 100 })} className="mt-1.5 block w-full" />
                <span className="mt-1 block text-xs font-normal text-fg/45">Long names shrink to fit inside this width.</span>
              </label>
            </>
          ) : (
            <p className="text-sm text-fg/60">Upload your certificate first.</p>
          )}
        </section>

        <section className={`${section} space-y-3`}>
          <h2 className={heading}>3. Signatures (optional)</h2>
          <p className="text-sm text-fg/60">If your certificate has blank signature lines, sign here and drag each signature onto its line on the preview.</p>
          {[0, 1].map((i) => (
            <details key={i} className="rounded-lg border border-fg/10 p-4">
              <summary className="cursor-pointer text-sm font-medium text-fg/80">{i === 0 ? "Add the first signature" : "Add the second signature"}</summary>
              <div className="mt-4 space-y-3">
                <SignaturePad value={sigs[i]?.dataUrl ?? ""} onChange={(data) => setSignature(i, data)} note="Shown on every certificate in this batch. Drag it on the preview." />
                {sigs[i] && (
                  <label className="block text-sm font-medium text-fg/80">
                    Size
                    <input type="range" min={6} max={40} value={Math.round((sigs[i]?.w ?? 0.18) * 100)} onChange={(e) => moveSignature(i, { w: Number(e.target.value) / 100 })} className="mt-1.5 block w-full" />
                  </label>
                )}
              </div>
            </details>
          ))}
        </section>

        <section className={section}>
          <h2 className={heading}>4. Add the names</h2>
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
                The free version makes up to <b className="text-fg">{limit} certificates</b> at a time, on your own design too. You pasted {parsed.names.length}, so the{" "}
                <b className="text-fg">first {limit}</b> will be made and {leftOut} will be left out.
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
                . Prices: {siteConfig.certificates.bigger.map((tier) => `up to ${tier.upTo} for ${tier.price}`).join(", ")}.
              </p>
            </div>
          )}
        </section>
      </div>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="overflow-hidden rounded-xl border border-fg/10 bg-fg/[0.03] p-3">
          {design ? (
            <div ref={box} className="relative mx-auto w-fit max-w-full">
              {/* eslint-disable-next-line @next/next/no-img-element -- the organiser's own picture, drawn on this device */}
              <img src={design.preview.src} alt="Your certificate" className="block h-auto max-h-[72vh] w-auto max-w-full rounded-md bg-white object-contain" draggable={false} />
              {previewPx > 0 && (
                // The name is drawn here, above the picture, so it moves under the finger at once. The PDF uses
                // the same position, font and colour.
                <div
                  tabIndex={0}
                  role="group"
                  aria-label="The name. Drag it to move it, or use the arrow keys."
                  onPointerDown={dragName}
                  onKeyDown={nudgeName}
                  style={{
                    left: `${place.x * 100}%`,
                    top: `${place.y * 100}%`,
                    fontFamily: font.family,
                    fontSize: previewPx,
                    color: place.color,
                    lineHeight: 1,
                    touchAction: "none",
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-grab whitespace-nowrap rounded-sm px-1 outline-1 outline-dashed outline-brand-400 active:cursor-grabbing"
                >
                  {shown}
                </div>
              )}
              {sigs.map((s, i) =>
                s ? (
                  <div
                    key={i}
                    tabIndex={0}
                    role="group"
                    aria-label={`Signature ${i + 1}. Drag it to move it, or use the arrow keys.`}
                    onPointerDown={(e) => startDrag(e, s, (x, y) => moveSignature(i, { x, y }))}
                    onKeyDown={(e) => {
                      const step = e.shiftKey ? 0.05 : 0.01;
                      const keys: Record<string, Partial<OwnSignature>> = { ArrowLeft: { x: s.x - step }, ArrowRight: { x: s.x + step }, ArrowUp: { y: s.y - step }, ArrowDown: { y: s.y + step } };
                      if (!keys[e.key]) return;
                      e.preventDefault();
                      moveSignature(i, keys[e.key]);
                    }}
                    style={{ left: `${s.x * 100}%`, top: `${s.y * 100}%`, width: `${s.w * 100}%`, touchAction: "none" }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-sm outline-1 outline-dashed outline-brand-400 active:cursor-grabbing"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- the organiser's own signature */}
                    <img src={s.dataUrl} alt="" draggable={false} className="pointer-events-none block w-full select-none" />
                  </div>
                ) : null,
              )}
            </div>
          ) : (
            <div className="grid aspect-[1.414] w-full place-items-center rounded-md border border-dashed border-fg/20 text-sm text-fg/45">Your certificate appears here</div>
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
          {verify.node}
          <button type="button" onClick={() => download("zip")} disabled={!ready} className={primaryButton}>
            {!design ? "Upload your certificate first" : names.length === 0 ? "Add names to download" : names.length === 1 ? "Download the certificate (PDF)" : `Download ${names.length} certificates (ZIP)`}
          </button>
          <button type="button" onClick={() => download("pdf")} disabled={!ready || names.length < 2} className={secondaryButton}>
            Download one PDF to print
          </button>
          {progress && (
            <div role="status" className="text-sm text-fg/70">
              Making certificates: {progress.done} of {progress.total}
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-fg/10">
                <div className="h-full bg-brand-400 transition-all" style={{ width: `${(progress.done / progress.total) * 100}%` }} />
              </div>
            </div>
          )}
          <p className="text-xs text-fg/45">The ZIP holds one PDF per person, named after them.</p>
        </div>
        {design && <SharePanel title="Certificates" build={() => packOwnShare(design, place, placedSigs)} names={names} />}
      </div>
    </div>
  );
}

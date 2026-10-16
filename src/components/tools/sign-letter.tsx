"use client";

import { useEffect, useRef, useState } from "react";
import { SIGNATURE_KEY, SignaturePad } from "@/components/builder/signature-pad";
import { renderPages, stampSignature, toPdfBytes, type Placement, type PreviewPage } from "@/lib/sign-pdf";
import { trackEvent } from "@/lib/track";
import { ShareNudge } from "@/components/ui/share-nudge";
import { OwnLetterEditor } from "./own-letter-editor";

const DEFAULT_WIDTH = 0.22;
const MIN_WIDTH = 0.1;
const MAX_WIDTH = 0.6;
/** Letters usually keep a margin of about this much on each side. */
const MARGIN = 0.08;

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/**
 * Where the signature starts on a page. If we found "Yours faithfully," it goes just under it, lined
 * up with it, so it follows letters that sign on the left or on the right. Otherwise it starts in
 * the lower left, where most letters are signed.
 */
function startFor(page: PreviewPage | undefined, width: number, aspect: number): Placement {
  const c = page?.closing;
  if (!page || !c) return { x: MARGIN, y: 0.78, width };
  const height = (aspect * width * page.width) / page.height;
  const gap = c.below === undefined ? Infinity : c.below - c.size - c.y; // free space between the two lines

  // Room between the closing line and the name: sit in the gap, lined up with them
  if (gap >= height) return { x: clamp(c.x, 0, 1 - width), y: clamp(c.y + c.size * 0.2, 0, 0.95), width };

  // Tight layout, with the name right under the closing: put the signature beside the two lines,
  // on the open side (to their left when they sit on the right of the page, otherwise to their right)
  const middle = c.below === undefined ? c.y : (c.y + c.below) / 2;
  const onRight = c.x > 0.5;
  const x = onRight ? c.x - width - 0.03 : c.x + Math.max(c.w, 0.2) + 0.03;
  return { x: clamp(x, 0, 1 - width), y: clamp(middle - height / 2 - c.size * 0.3, 0, 0.95), width };
}

/**
 * For students who already have a letter and only need to sign it. They add their signature,
 * upload the letter (PDF or a photo), drag the signature to the right spot, and download the
 * signed PDF. Nothing is uploaded to a server.
 */
export function SignLetter() {
  const [signature, setSignature] = useState("");
  const [aspect, setAspect] = useState(0.4); // signature height divided by its width
  const [file, setFile] = useState<{ name: string; bytes: Uint8Array } | null>(null);
  const [pages, setPages] = useState<PreviewPage[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [placement, setPlacement] = useState<Placement>({ x: MARGIN, y: 0.78, width: DEFAULT_WIDTH });
  // Whether we found the closing line and placed the signature under it ourselves
  const [found, setFound] = useState(false);
  // "edit": write or change the text, then sign it. "as-is": sign a finished file without changing it.
  const [tab, setTab] = useState<"edit" | "as-is">("edit");
  // Set after a signed letter is downloaded, to offer sharing CV11 with a friend
  const [signed, setSigned] = useState(false);
  const [busy, setBusy] = useState<"" | "reading" | "saving">("");
  const [error, setError] = useState("");
  const pageRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ startX: number; startY: number; from: Placement } | null>(null);

  // Reuse the signature already made for a letter, if there is one
  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from storage
      setSignature(localStorage.getItem(SIGNATURE_KEY) ?? "");
    } catch {}
  }, []);

  function changeSignature(dataUrl: string) {
    setSignature(dataUrl);
    try {
      if (dataUrl) localStorage.setItem(SIGNATURE_KEY, dataUrl);
      else localStorage.removeItem(SIGNATURE_KEY);
    } catch {}
  }

  async function openLetter(chosen: File | undefined) {
    if (!chosen) return;
    setError("");
    setBusy("reading");
    try {
      const bytes = await toPdfBytes(chosen);
      const rendered = await renderPages(bytes);
      if (!rendered.length) throw new Error("That file has no pages.");
      setFile({ name: chosen.name.replace(/\.[^.]+$/, ""), bytes });
      setPages(rendered);
      // Sign on the page that has the closing line ("Yours faithfully"), or else the last page
      const closingPage = rendered.findLastIndex((p) => p.closing);
      const start = closingPage >= 0 ? closingPage : rendered.length - 1;
      setPageIndex(start);
      setPlacement(startFor(rendered[start], placement.width, aspect));
      setFound(closingPage >= 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "We could not open that file. Is it a PDF or a clear photo?");
    } finally {
      setBusy("");
    }
  }

  // The signature's height as a fraction of the page, so it can never be dragged off the edge
  const page = pages[pageIndex];
  const heightFraction = page ? (aspect * placement.width * page.width) / page.height : 0;

  function startDrag(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { startX: e.clientX, startY: e.clientY, from: placement };
  }

  function moveDrag(e: React.PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    const box = pageRef.current?.getBoundingClientRect();
    if (!d || !box) return;
    setPlacement({
      ...d.from,
      x: clamp(d.from.x + (e.clientX - d.startX) / box.width, 0, 1 - d.from.width),
      y: clamp(d.from.y + (e.clientY - d.startY) / box.height, 0, 1 - heightFraction),
    });
  }

  /** Arrow keys nudge the signature, for anyone not using a finger or mouse. */
  function nudge(e: React.KeyboardEvent<HTMLDivElement>) {
    const step = 0.01;
    const move: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    const delta = move[e.key];
    if (!delta) return;
    e.preventDefault();
    setPlacement((p) => ({
      ...p,
      x: clamp(p.x + delta[0], 0, 1 - p.width),
      y: clamp(p.y + delta[1], 0, 1 - heightFraction),
    }));
  }

  function resize(width: number) {
    // Grow or shrink in place, then keep the whole signature on the page
    setPlacement((p) => {
      const h = page ? (aspect * width * page.width) / page.height : 0;
      return { width, x: clamp(p.x, 0, 1 - width), y: clamp(p.y, 0, 1 - h) };
    });
  }

  async function download() {
    if (!file || !signature) return;
    setBusy("saving");
    setError("");
    try {
      const signed = await stampSignature(file.bytes, pageIndex, signature, placement);
      const url = URL.createObjectURL(new Blob([signed as BlobPart], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `${file.name}_signed.pdf`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      trackEvent("letter_signed");
      setSigned(true);
    } catch {
      setError("We could not save the signed letter. If the PDF is locked, print it to a new PDF first and try again.");
    } finally {
      setBusy("");
    }
  }

  const step = "grid size-7 shrink-0 place-items-center rounded-full bg-brand-500/25 text-sm font-semibold text-brand-300";

  return (
    <div className="space-y-10">
      {/* 1. The signature */}
      <section>
        <h2 className="flex items-center gap-3 text-lg font-medium text-fg">
          <span className={step}>1</span> Your signature (only if you need one)
        </h2>
        <div className="mt-4">
          <SignaturePad value={signature} onChange={changeSignature} />
        </div>
      </section>

      {/* 2. The letter */}
      <section>
        <h2 className="flex items-center gap-3 text-lg font-medium text-fg">
          <span className={step}>2</span> Your text
        </h2>

        {/* Two ways in: edit the words (a PDF or Word file, or typed from scratch), or leave a finished file untouched */}
        <div role="radiogroup" aria-label="How to add your letter" className="mt-4 grid grid-cols-2 gap-1 rounded-lg bg-fg/5 p-1 text-sm">
          {(
            [
              ["edit", "Paste, write or edit text"],
              ["as-is", "Keep my file as it is"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={tab === id}
              onClick={() => setTab(id)}
              className={`rounded-md px-3 py-2 transition-colors ${tab === id ? "bg-fg/10 text-fg ring-1 ring-fg/15" : "text-fg/55 hover:text-fg"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "edit" ? (
          <div className="mt-5">
            <OwnLetterEditor signature={signature} />
          </div>
        ) : (
          <>
            <label className="mt-5 flex h-32 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-fg/25 bg-fg/[0.03] px-4 text-center text-sm text-fg/65 hover:text-fg">
              <span className="font-medium text-fg">{file ? "Choose a different letter" : "Choose your letter"}</span>
              <span className="text-xs text-fg/50">A PDF, or a clear photo of the printed letter. It stays on your device.</span>
              <input
                type="file"
                accept="application/pdf,.pdf,image/*"
                className="sr-only"
                onChange={(e) => {
                  void openLetter(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </label>
            {busy === "reading" && <p className="mt-3 text-sm text-fg/60">Opening your letter…</p>}
            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
            <p className="mt-2 text-xs text-fg/45">Use this when your letter is finished and must stay exactly as it is, such as a stamped or scanned copy. Written it in Word? Save as PDF first.</p>
          </>
        )}
      </section>

      {/* 3. Place it and download (only for a file kept as it is; the editor places the signature itself) */}
      {tab === "as-is" && page && file && (
        <section>
          <h2 className="flex items-center gap-3 text-lg font-medium text-fg">
            <span className={step}>3</span> Place your signature
          </h2>
          <p className="mt-2 text-sm text-fg/60">
            {!signature
              ? "Add your signature in step 1, then drag it into place here."
              : found
                ? "We placed it next to your closing line. Drag it if it needs to move, or use Left, Centre and Right."
                : "Drag the signature to where it belongs, then set its size."}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm">
            <label className="flex items-center gap-3 text-fg/70">
              Size
              <input
                type="range"
                min={MIN_WIDTH * 100}
                max={MAX_WIDTH * 100}
                value={Math.round(placement.width * 100)}
                onChange={(e) => resize(Number(e.target.value) / 100)}
                disabled={!signature}
                className="w-36 accent-brand-500"
              />
            </label>
            {pages.length > 1 && (
              <div className="flex items-center gap-2 text-fg/70">
                <button type="button" onClick={() => setPageIndex((i) => i - 1)} disabled={pageIndex === 0} className="rounded-md px-3 py-1.5 ring-1 ring-fg/15 hover:text-fg disabled:opacity-35">
                  ←
                </button>
                <span className="tabular-nums">
                  Page {pageIndex + 1} of {pages.length}
                </span>
                <button type="button" onClick={() => setPageIndex((i) => i + 1)} disabled={pageIndex === pages.length - 1} className="rounded-md px-3 py-1.5 ring-1 ring-fg/15 hover:text-fg disabled:opacity-35">
                  →
                </button>
              </div>
            )}
            {/* Quick sides, for letters that sign on the left, in the middle or on the right */}
            <div role="group" aria-label="Move the signature to a side" className="flex items-center gap-2 text-fg/70">
              {(["Left", "Centre", "Right"] as const).map((label) => (
                <button
                  key={label}
                  type="button"
                  disabled={!signature}
                  onClick={() =>
                    setPlacement((p) => ({
                      ...p,
                      x: label === "Left" ? MARGIN : label === "Right" ? 1 - p.width - MARGIN : (1 - p.width) / 2,
                    }))
                  }
                  className="rounded-md px-3 py-1.5 ring-1 ring-fg/15 hover:text-fg disabled:opacity-35"
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setPlacement((p) => startFor(page, p.width, aspect))}
              className="rounded-md px-3 py-1.5 text-fg/70 ring-1 ring-fg/15 hover:text-fg"
            >
              Reset position
            </button>
          </div>

          {/* The page, with the signature on top. Positions are percentages, so any screen size matches the PDF. */}
          <div className="mt-5 overflow-hidden rounded-lg bg-white">
            <div ref={pageRef} className="relative mx-auto w-full max-w-[640px] select-none" style={{ aspectRatio: `${page.width} / ${page.height}` }}>
              {/* eslint-disable-next-line @next/next/no-img-element -- a local page preview, nothing to optimise */}
              <img src={page.src} alt={`Page ${pageIndex + 1} of your letter`} className="absolute inset-0 size-full" draggable={false} />
              {signature && (
                <div
                  role="button"
                  tabIndex={0}
                  aria-label="Your signature. Drag to move, or use the arrow keys."
                  onPointerDown={startDrag}
                  onPointerMove={moveDrag}
                  onPointerUp={() => (drag.current = null)}
                  onPointerCancel={() => (drag.current = null)}
                  onKeyDown={nudge}
                  style={{ left: `${placement.x * 100}%`, top: `${placement.y * 100}%`, width: `${placement.width * 100}%`, touchAction: "none" }}
                  className="absolute cursor-grab outline-dashed outline-1 outline-offset-2 outline-brand-500 active:cursor-grabbing"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- a small local data URL */}
                  <img
                    src={signature}
                    alt=""
                    draggable={false}
                    onLoad={(e) => setAspect(e.currentTarget.naturalHeight / e.currentTarget.naturalWidth)}
                    className="block w-full"
                  />
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={download}
            disabled={!signature || busy !== ""}
            className="mt-6 flex w-full items-center justify-center rounded-md bg-brand-600 py-3 text-[15px] font-medium text-white ring-1 ring-brand-300/60 shadow-[0_0_22px_rgb(124_128_255/0.5)] hover:bg-brand-500 disabled:opacity-40 disabled:shadow-none sm:w-auto sm:px-8"
          >
            {busy === "saving" ? "Saving…" : "Download signed letter"}
          </button>
          <p className="mt-2 text-xs text-fg/45">The rest of your letter is left exactly as it was.</p>
          {signed && <ShareNudge kind="sign" className="mt-5" />}
        </section>
      )}
    </div>
  );
}

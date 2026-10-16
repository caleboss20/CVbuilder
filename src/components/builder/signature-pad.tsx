"use client";

import { useEffect, useRef, useState } from "react";

type Point = { x: number; y: number };
type Stroke = Point[];

/** The drawing area's height on screen, in CSS pixels. */
const PAD_HEIGHT = 160;
/** The saved image is cropped to the ink and fitted inside this size (in pixels), so it stays small. */
const OUT_MAX_W = 600;
const OUT_MAX_H = 150;
/** Pen colour: a dark ink that reads well on a white letter. */
const INK = "#111827";
const PEN_WIDTH = 2.4;

/** Draws strokes as smooth round-capped lines. A single tap becomes a dot. */
function paint(ctx: CanvasRenderingContext2D, strokes: Stroke[], width: number) {
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = INK;
  for (const s of strokes) {
    if (!s.length) continue;
    ctx.beginPath();
    ctx.moveTo(s[0].x, s[0].y);
    for (const p of s) ctx.lineTo(p.x + 0.01, p.y);
    ctx.stroke();
  }
}

/**
 * Turns the drawn strokes into a PNG cropped tightly to the ink and scaled down to a fixed
 * maximum size. However big or small the student signs, the result has no empty margin, so
 * the letter can place it in one fixed frame.
 */
function exportStrokes(strokes: Stroke[]): string {
  const pts = strokes.flat();
  const pad = PEN_WIDTH * 2;
  const minX = Math.min(...pts.map((p) => p.x)) - pad;
  const minY = Math.min(...pts.map((p) => p.y)) - pad;
  const w = Math.max(...pts.map((p) => p.x)) + pad - minX;
  const h = Math.max(...pts.map((p) => p.y)) + pad - minY;
  const scale = Math.min(OUT_MAX_W / w, OUT_MAX_H / h, 3);

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(w * scale));
  canvas.height = Math.max(1, Math.round(h * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  ctx.scale(scale, scale);
  ctx.translate(-minX, -minY);
  // When a large signature is shrunk, keep the pen from becoming hair-thin
  paint(ctx, strokes, Math.max(PEN_WIDTH, 1.6 / scale));
  return canvas.toDataURL("image/png");
}

/**
 * Turns a photo of a signature on paper into a transparent PNG: paper becomes see-through,
 * the pen becomes dark ink, and the empty border is cropped away. Returns "" if no ink is found.
 */
function exportPhoto(img: HTMLImageElement): string {
  const scale = Math.min(1, 900 / img.width);
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));
  const work = document.createElement("canvas");
  work.width = w;
  work.height = h;
  const ctx = work.getContext("2d", { willReadFrequently: true });
  if (!ctx) return "";
  ctx.drawImage(img, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h);
  const px = data.data;

  let minX = w;
  let minY = h;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const lum = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
      // Light paper fades out; darker pen strokes stay solid
      const alpha = Math.max(0, Math.min(255, ((225 - lum) / 110) * 255));
      px[i] = 17;
      px[i + 1] = 24;
      px[i + 2] = 39;
      px[i + 3] = alpha;
      if (alpha > 60) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return "";
  ctx.putImageData(data, 0, 0);

  // Crop to the ink, then fit inside the same maximum size as a drawn signature
  const cw = maxX - minX + 1;
  const ch = maxY - minY + 1;
  const fit = Math.min(1, OUT_MAX_W / cw, OUT_MAX_H / ch);
  const out = document.createElement("canvas");
  out.width = Math.max(1, Math.round(cw * fit));
  out.height = Math.max(1, Math.round(ch * fit));
  out.getContext("2d")?.drawImage(work, minX, minY, cw, ch, 0, 0, out.width, out.height);
  return out.toDataURL("image/png");
}

const buttonClass =
  "rounded-md px-3 py-1.5 text-sm text-fg/75 ring-1 ring-fg/15 transition-colors hover:text-fg disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:text-fg/75";

/**
 * Lets a student sign their letter. They can draw with a finger or mouse (with undo, redo and
 * clear, so they can pause and carry on), or upload a photo of their signature. Nothing is saved
 * until they press "Use this signature". `onChange` receives a cropped PNG data URL, or "" if removed.
 */
export function SignaturePad({ value, onChange }: { value: string; onChange: (dataUrl: string) => void }) {
  const [mode, setMode] = useState<"draw" | "upload">("draw");
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [undone, setUndone] = useState<Stroke[]>([]);
  const [error, setError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // The stroke being drawn right now. Kept out of state so drawing stays smooth.
  const current = useRef<Stroke | null>(null);

  // Size the canvas for sharp lines on any screen, then redraw everything drawn so far
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = canvas.getBoundingClientRect().width * ratio;
    canvas.height = PAD_HEIGHT * ratio;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(ratio, ratio);
    paint(ctx, strokes, PEN_WIDTH);
  }, [strokes, mode, value]);

  const point = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  function start(e: React.PointerEvent<HTMLCanvasElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    current.current = [point(e)];
    const ctx = e.currentTarget.getContext("2d");
    if (ctx) paint(ctx, [current.current], PEN_WIDTH);
  }

  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    const stroke = current.current;
    const ctx = e.currentTarget.getContext("2d");
    if (!stroke || !ctx) return;
    const next = point(e);
    const last = stroke[stroke.length - 1];
    stroke.push(next);
    ctx.lineWidth = PEN_WIDTH;
    ctx.lineCap = "round";
    ctx.strokeStyle = INK;
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(next.x, next.y);
    ctx.stroke();
  }

  function end() {
    const stroke = current.current;
    current.current = null;
    if (!stroke) return;
    setStrokes((s) => [...s, stroke]);
    // A new stroke after an undo starts a fresh history, as in any drawing tool
    setUndone([]);
  }

  const undo = () => {
    const last = strokes[strokes.length - 1];
    if (!last) return;
    setStrokes(strokes.slice(0, -1));
    setUndone((u) => [...u, last]);
  };

  const redo = () => {
    const back = undone[undone.length - 1];
    if (!back) return;
    setUndone(undone.slice(0, -1));
    setStrokes((s) => [...s, back]);
  };

  const clearAll = () => {
    setStrokes([]);
    setUndone([]);
  };

  const useDrawing = () => {
    if (!strokes.length) return;
    onChange(exportStrokes(strokes));
  };

  function upload(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Please choose a photo or image file.");
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const result = exportPhoto(img);
      if (!result) return setError("We could not find a signature in that photo. Use dark ink on plain white paper.");
      setError("");
      onChange(result);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setError("We could not read that image. Try another one.");
    };
    img.src = url;
  }

  // A signature is in use: show it, with a way to keep editing or take it off
  if (value) {
    return (
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-fg/80">Your signature</legend>
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-fg/12 bg-white p-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- a small local data URL, nothing to optimise */}
          <img src={value} alt="Your signature" className="h-14 w-auto max-w-[60%] object-contain" />
          <div className="ml-auto flex gap-2">
            {strokes.length > 0 && (
              <button type="button" onClick={() => onChange("")} className="rounded-md px-3 py-1.5 text-sm text-slate-700 ring-1 ring-slate-300 hover:bg-slate-100">
                Keep editing
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                clearAll();
                onChange("");
              }}
              className="rounded-md px-3 py-1.5 text-sm text-slate-700 ring-1 ring-slate-300 hover:bg-slate-100"
            >
              Remove
            </button>
          </div>
        </div>
        <p className="mt-1.5 text-xs text-fg/45">Saved on this device and shown above your name on every letter.</p>
      </fieldset>
    );
  }

  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-fg/80">Your signature (optional)</legend>

      <div role="radiogroup" aria-label="How to add your signature" className="mb-2 flex gap-1 rounded-lg bg-fg/5 p-1 text-sm">
        {(
          [
            ["draw", "Draw it"],
            ["upload", "Upload a photo"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={mode === id}
            onClick={() => setMode(id)}
            className={`flex-1 rounded-md px-3 py-1.5 transition-colors ${
              mode === id ? "bg-fg/10 text-fg ring-1 ring-fg/15" : "text-fg/55 hover:text-fg"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "draw" ? (
        <>
          <canvas
            ref={canvasRef}
            onPointerDown={start}
            onPointerMove={move}
            onPointerUp={end}
            onPointerCancel={end}
            style={{ height: PAD_HEIGHT, touchAction: "none" }}
            className="w-full cursor-crosshair rounded-lg border border-dashed border-fg/25 bg-white"
            aria-label="Signature drawing area"
          />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button type="button" onClick={undo} disabled={!strokes.length} className={buttonClass}>
              Undo
            </button>
            <button type="button" onClick={redo} disabled={!undone.length} className={buttonClass}>
              Redo
            </button>
            <button type="button" onClick={clearAll} disabled={!strokes.length} className={buttonClass}>
              Clear
            </button>
            <button
              type="button"
              onClick={useDrawing}
              disabled={!strokes.length}
              className="ml-auto rounded-md bg-brand-600 px-4 py-1.5 text-sm font-medium text-white ring-1 ring-brand-300/60 shadow-[0_0_14px_rgb(124_128_255/0.4)] hover:bg-brand-500 disabled:opacity-40 disabled:shadow-none"
            >
              Use this signature
            </button>
          </div>
          <p className="mt-1.5 text-xs text-fg/45">Sign with your finger or mouse. Take your time: nothing is saved until you press “Use this signature”.</p>
        </>
      ) : (
        <>
          <label className="flex h-[160px] cursor-pointer items-center justify-center rounded-lg border border-dashed border-fg/25 bg-fg/[0.03] px-4 text-center text-sm text-fg/60 hover:text-fg">
            Choose a photo of your signature on white paper
            <input type="file" accept="image/*" className="sr-only" onChange={(e) => upload(e.target.files?.[0])} />
          </label>
          <p className="mt-1.5 text-xs text-fg/45">Sign in dark ink on plain white paper and take a clear photo. We remove the paper and trim the edges.</p>
        </>
      )}
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </fieldset>
  );
}

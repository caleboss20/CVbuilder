"use client";

import { useEffect, useRef, useState } from "react";

/** The saved signature is kept as a small PNG data URL, so it needs no upload or account. */
const MAX_WIDTH = 480;
const PAD_HEIGHT = 140;

/**
 * Lets a student sign their letter: draw with a finger or mouse, or upload a photo of
 * their signature. Calls `onChange` with a PNG data URL, or "" when cleared.
 */
export function SignaturePad({ value, onChange }: { value: string; onChange: (dataUrl: string) => void }) {
  const [mode, setMode] = useState<"draw" | "upload">("draw");
  const [error, setError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const inked = useRef(false);

  // Match the canvas to its on-screen size (and screen sharpness) once it is shown
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    const { width } = canvas.getBoundingClientRect();
    canvas.width = width * ratio;
    canvas.height = PAD_HEIGHT * ratio;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#111827";
  }, [mode]);

  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  function start(e: React.PointerEvent<HTMLCanvasElement>) {
    const ctx = e.currentTarget.getContext("2d");
    if (!ctx) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    const { x, y } = point(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    // A tap leaves a dot, so a single touch still counts as ink
    ctx.lineTo(x + 0.01, y);
    ctx.stroke();
  }

  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const ctx = e.currentTarget.getContext("2d");
    if (!ctx) return;
    const { x, y } = point(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    inked.current = true;
  }

  function end(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    drawing.current = false;
    if (inked.current) onChange(e.currentTarget.toDataURL("image/png"));
  }

  function clear() {
    const canvas = canvasRef.current;
    canvas?.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
    inked.current = false;
    setError("");
    onChange("");
  }

  /** Shrinks a photo of a signature so it stays small enough to save in the browser. */
  function upload(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Please choose a photo or image file.");
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, MAX_WIDTH / img.width);
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext("2d")?.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      setError("");
      onChange(c.toDataURL("image/png"));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setError("We could not read that image. Try another one.");
    };
    img.src = url;
  }

  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-fg/80">Your signature (optional)</legend>

      {value ? (
        <div className="flex items-center gap-4 rounded-lg border border-fg/12 bg-white p-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- a small local data URL, nothing to optimise */}
          <img src={value} alt="Your signature" className="h-16 w-auto max-w-[70%] object-contain" />
          <button type="button" onClick={clear} className="ml-auto rounded-md px-3 py-1.5 text-sm text-slate-700 ring-1 ring-slate-300 hover:bg-slate-100">
            Remove
          </button>
        </div>
      ) : (
        <>
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
          ) : (
            <label className="flex h-[140px] cursor-pointer items-center justify-center rounded-lg border border-dashed border-fg/25 bg-fg/[0.03] px-4 text-center text-sm text-fg/60 hover:text-fg">
              Choose a photo of your signature on white paper
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => upload(e.target.files?.[0])} />
            </label>
          )}
          <p className="mt-1.5 text-xs text-fg/45">
            {mode === "draw" ? "Sign inside the box with your finger or mouse. It saves as you lift." : "Sign on plain white paper in dark ink, then take a clear photo."}
          </p>
        </>
      )}
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
      <p className="mt-1.5 text-xs text-fg/45">Stays on this device. Many scholarships also accept a typed name, so this is optional.</p>
    </fieldset>
  );
}

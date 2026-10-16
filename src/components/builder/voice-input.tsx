"use client";

import { useState } from "react";
import { refineText, type RefineKind } from "@/lib/refine";
import { useSpeech } from "@/lib/speech";
import { SparkleIcon } from "@/components/ui/sparkle-icon";

const prompts: Record<RefineKind, string> = {
  bullets: "Tell us what you did there, in your own words. E.g. “I helped customers and counted stock every evening, maybe 50 customers a day.”",
  summary: "Tell us who you are and what you want. E.g. “I'm a final year nursing student at KNUST and I want a rotation placement.”",
  project: "Describe the project and what it achieved. E.g. “Me and three friends built an app for selling things on campus.”",
};

/**
 * "Say it or type it": the student speaks (or types) naturally, we tidy it into
 * CV lines, they review and add them. Speech works in Chrome, Edge and Android;
 * elsewhere the mic is hidden and typing still works.
 */
export function VoiceInput({ kind, onAdd }: { kind: RefineKind; onAdd: (lines: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState<string[] | null>(null);
  const speech = useSpeech();

  function reset() {
    speech.stop();
    speech.setText("");
    setLines(null);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          if (speech.supported) speech.start();
        }}
        className="group inline-flex items-center gap-2 rounded-full border border-brand-400/40 bg-brand-500/10 py-1.5 pl-1.5 pr-3.5 text-sm font-medium text-fg transition-colors hover:bg-brand-500/20"
      >
        <span className="grid size-7 place-items-center rounded-full bg-brand-600 text-white shadow-[0_0_14px_rgb(124_128_255/0.6)]">
          <MicIcon />
        </span>
        {speech.supported ? "Say it, we’ll write it" : "Describe it, we’ll write it"}
        {/* Speech recognition is the browser's own, and it can mishear accents and names */}
        {speech.supported && (
          <span className="rounded bg-fg/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-fg/60">Beta</span>
        )}
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-brand-400/40 bg-brand-500/[0.07] p-4 shadow-[0_0_40px_-18px_rgb(124_128_255/0.8)]">
      {lines === null ? (
        <>
          <div className="flex items-center gap-3">
            {speech.supported && (
              <button
                type="button"
                onClick={speech.listening ? speech.stop : speech.start}
                aria-pressed={speech.listening}
                aria-label={speech.listening ? "Stop listening" : "Start speaking"}
                className={`relative grid size-11 shrink-0 place-items-center rounded-full text-white transition-colors ${
                  speech.listening ? "bg-red-500" : "bg-brand-600 hover:bg-brand-500"
                }`}
              >
                {speech.listening && <span className="absolute inset-0 animate-ping rounded-full bg-red-500/50" />}
                <MicIcon />
              </button>
            )}
            <p className="text-sm text-fg/70">
              {speech.listening ? (
                <span className="font-medium text-fg">Listening… speak naturally, then tap the mic to stop.</span>
              ) : speech.supported ? (
                "Tap the mic and talk, or type below."
              ) : (
                "Type it the way you’d say it."
              )}
            </p>
          </div>

          <label className="sr-only" htmlFor={`voice-${kind}`}>
            What you did, in your own words
          </label>
          <textarea
            id={`voice-${kind}`}
            rows={4}
            value={speech.text}
            onChange={(e) => speech.setText(e.target.value)}
            placeholder={prompts[kind]}
            className="mt-3 w-full resize-y rounded-lg border border-fg/12 bg-ink-950/60 px-3 py-2.5 text-sm leading-relaxed text-fg placeholder:text-fg/35 focus:border-brand-400/70 focus:outline-none"
          />
          {speech.error && <p className="mt-2 text-xs text-amber-300">{speech.error}</p>}
          {speech.supported && (
            <p className="mt-2 text-xs text-fg/50">
              Voice typing is still in beta and can mishear names, places and accents. Read the text above and fix any
              mistakes before you continue. You can type or edit it yourself at any time.
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                reset();
                setOpen(false);
              }}
              className="rounded-md px-3 py-2 text-sm text-fg/60 hover:text-fg"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!speech.text.trim()}
              onClick={() => {
                speech.stop();
                setLines(refineText(speech.text, kind));
              }}
              className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white ring-1 ring-brand-300/60 shadow-[0_0_18px_rgb(124_128_255/0.45)] hover:bg-brand-500 disabled:opacity-40"
            >
              <SparkleIcon size={14} />
              Turn into CV lines
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="flex items-center gap-2 text-sm font-medium text-fg">
            <SparkleIcon className="text-brand-300" />
            Here’s how it reads on your CV
          </p>
          <ul className="mt-3 space-y-2">
            {lines.map((l, i) => (
              <li key={i} className="flex gap-2">
                {kind === "bullets" && <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-brand-300" />}
                <textarea
                  rows={2}
                  value={l}
                  aria-label={`Line ${i + 1}`}
                  onChange={(e) => setLines(lines.map((x, k) => (k === i ? e.target.value : x)))}
                  className="w-full resize-y rounded-lg border border-fg/12 bg-ink-950/60 px-3 py-2 text-sm leading-relaxed text-fg focus:border-brand-400/70 focus:outline-none"
                />
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-fg/45">You can edit these before adding. Make sure every line is true for you.</p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <button type="button" onClick={() => setLines(null)} className="rounded-md px-3 py-2 text-sm text-fg/60 hover:text-fg">
              ← Try again
            </button>
            <button
              type="button"
              onClick={() => {
                onAdd(lines.map((l) => l.trim()).filter(Boolean));
                reset();
                setOpen(false);
              }}
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
            >
              Add to my CV
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function MicIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="relative">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </svg>
  );
}

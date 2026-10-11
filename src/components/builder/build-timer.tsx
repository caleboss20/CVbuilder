"use client";

import { useEffect, useState, type RefObject } from "react";

/** Idle time after which the clock pauses (no typing, clicking or scrolling). */
const IDLE_MS = 2 * 60 * 1000;
const BEST_KEY = "cv11-best-time";

export function formatDuration(ms: number) {
  const total = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h) return `${h}h ${m}m`;
  return m ? `${m}m ${String(s).padStart(2, "0")}s` : `${s}s`;
}

export function readBest(): number | null {
  try {
    const v = Number(localStorage.getItem(BEST_KEY));
    return v > 0 ? v : null;
  } catch {
    return null;
  }
}

export function saveBest(ms: number) {
  try {
    localStorage.setItem(BEST_KEY, String(ms));
  } catch {}
}

/**
 * Counts active building time into `timeRef`. Pauses when the tab is hidden or
 * after two minutes without activity, so an idle tab never inflates the time.
 * Renders a small, quiet chip for the top bar.
 */
export function BuildTimer({
  timeRef,
  initialMs,
  finished,
  onPersist,
}: {
  timeRef: RefObject<number>;
  /** Time already saved with the CV, shown before the first tick. */
  initialMs: number;
  finished: boolean;
  onPersist: (ms: number) => void;
}) {
  const [shown, setShown] = useState(initialMs);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (finished) return;
    let last = Date.now();
    const mark = () => (last = Date.now());
    const events = ["keydown", "pointerdown", "input", "scroll", "wheel"] as const;
    events.forEach((e) => window.addEventListener(e, mark, { passive: true, capture: true }));

    let sincePersist = 0;
    const tick = setInterval(() => {
      const active = document.visibilityState === "visible" && Date.now() - last < IDLE_MS;
      setPaused(!active);
      if (!active) return;
      timeRef.current += 1000;
      setShown(timeRef.current);
      if (++sincePersist >= 15) {
        sincePersist = 0;
        onPersist(timeRef.current);
      }
    }, 1000);

    return () => {
      clearInterval(tick);
      events.forEach((e) => window.removeEventListener(e, mark, { capture: true }));
      onPersist(timeRef.current);
    };
  }, [finished, timeRef, onPersist]);

  return (
    <span
      title={
        finished
          ? "Total active time spent building this CV"
          : "Active editing time. It pauses when you’re away from the page."
      }
      className="hidden items-center gap-1.5 rounded-md border border-fg/10 px-2.5 py-1.5 font-mono text-xs tabular-nums text-fg/60 md:inline-flex"
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="13" r="8" />
        <path d="M12 9v4l2.5 2.5M9.5 2h5" />
      </svg>
      {finished ? `Completed in ${formatDuration(shown)}` : formatDuration(shown)}
      {!finished && paused && <span className="font-sans text-fg/40">· paused</span>}
    </span>
  );
}

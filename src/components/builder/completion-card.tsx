"use client";

import Link from "next/link";
import { useEffect } from "react";
import { siteConfig } from "@/lib/site";
import { CheckIcon } from "@/components/ui/check-icon";
import { formatDuration } from "./build-timer";

export type Completion = {
  ms: number;
  score: number;
  template: string;
  best: number | null;
  newBest: boolean;
};

/** Summary shown once a CV is downloaded for the first time: time, strength, next steps. */
export function CompletionCard({ data, onClose }: { data: Completion; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const minutes = Math.max(1, Math.round(data.ms / 60000));
  const share = encodeURIComponent(
    `I just built my CV in ${minutes} minute${minutes === 1 ? "" : "s"} with ${siteConfig.name}. It's free for students: ${siteConfig.url}`,
  );

  const stats = [
    { label: "Time taken", value: formatDuration(data.ms) },
    { label: "Strength", value: `${data.score}%` },
    { label: "Template", value: data.template },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="done-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/75 p-3 backdrop-blur-sm sm:items-center sm:p-6"
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-fg/10 bg-ink-900 shadow-[0_30px_80px_-20px_rgb(0_0_0/0.6)]">
        <div className="px-6 pb-6 pt-7 sm:px-7">
          <CheckIcon size={36} />
          <h2 id="done-title" className="mt-4 text-xl font-medium text-fg">
            Your CV is ready
          </h2>
          <p className="mt-1.5 text-sm text-fg/55">
            Your PDF has been prepared. Here’s a summary of this CV.
          </p>

          <dl className="mt-6 grid grid-cols-3 divide-x divide-fg/10 rounded-xl border border-fg/10 bg-fg/[0.03]">
            {stats.map((s) => (
              <div key={s.label} className="px-3 py-3.5">
                <dt className="text-[11px] uppercase tracking-wide text-fg/45">{s.label}</dt>
                <dd className="mt-1 truncate text-[15px] font-semibold tabular-nums text-fg">{s.value}</dd>
              </div>
            ))}
          </dl>

          {data.newBest ? (
            <p className="mt-3 text-xs text-emerald-300">New personal best on this device.</p>
          ) : (
            data.best && <p className="mt-3 text-xs text-fg/45">Your fastest CV so far: {formatDuration(data.best)}</p>
          )}

          <div className="mt-6 space-y-2.5">
            <Link
              href="/cover-letter"
              className="flex w-full items-center justify-center rounded-md bg-brand-600 py-2.5 text-sm font-medium text-white ring-1 ring-brand-300/60 hover:bg-brand-500"
            >
              Write a matching cover letter
            </Link>
            <a
              href={`https://wa.me/?text=${share}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium text-fg ring-1 ring-fg/15 hover:bg-fg/5"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="text-[#25D366]">
                <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.5 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.3.5-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.1.1.7-.1 1.3z" />
              </svg>
              Share on WhatsApp
            </a>
            <button type="button" onClick={onClose} className="w-full py-2 text-sm text-fg/55 hover:text-fg">
              Back to editing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

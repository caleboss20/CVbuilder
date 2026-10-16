"use client";

import { coachBullet, startWith, type CoachTone } from "@/lib/bullet-coach";
import { CheckIcon } from "@/components/ui/check-icon";

const TONE: Record<CoachTone, string> = {
  good: "text-emerald-300",
  tip: "text-fg/60",
  fix: "text-amber-300",
};

/**
 * One line of live advice under a bullet point, with tappable opening words when
 * the bullet starts weakly. Quiet by design: a small dot and one sentence.
 */
export function BulletCoach({ text, onChange }: { text: string; onChange: (next: string) => void }) {
  const coaching = coachBullet(text);
  if (!coaching) return null;

  return (
    <div className="mt-1.5 text-xs" aria-live="polite">
      <p className={`flex items-center gap-1.5 ${TONE[coaching.tone]}`}>
        {coaching.tone === "good" ? (
          <CheckIcon size={13} />
        ) : (
          <span
            className={`size-1.5 shrink-0 rounded-full ${coaching.tone === "fix" ? "bg-amber-400" : "bg-fg/40"}`}
            aria-hidden="true"
          />
        )}
        {coaching.message}
      </p>

      {coaching.verbs && (
        <ul className="mt-1.5 flex flex-wrap gap-1.5" aria-label="Start your bullet with">
          {coaching.verbs.map((verb) => (
            <li key={verb}>
              <button
                type="button"
                onClick={() => onChange(startWith(verb, text))}
                className="rounded-md border border-brand-400/40 bg-brand-500/10 px-2.5 py-1 text-fg/85 transition-colors hover:bg-brand-500/25"
              >
                {verb}…
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

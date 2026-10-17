"use client";

import { useState } from "react";
import { askTranscriptCheck, type TranscriptCheck } from "@/lib/ai-client";
import { AiConsentNotice, hasAiConsent } from "./ai-consent";
import { useAiAccess } from "./use-ai-access";

/**
 * Under the voice box: "Check what we heard". The AI lists words it thinks the microphone got
 * wrong (a school, a place, a tool) and we show "We heard" against "We think you meant".
 * The student decides: use the corrected text, or keep their own. Hidden for anyone not allowed
 * to use the AI yet, and until there is something to check.
 */
export function HeardCheck({
  text,
  onUse,
  context,
}: {
  /** What was heard or typed so far. */
  text: string;
  /** Called with the corrected text when the student accepts it. */
  onUse: (corrected: string) => void;
  /** Facts that help guess the right word, such as the course or role. */
  context?: Record<string, string>;
}) {
  const { allowed, token } = useAiAccess();
  const [busy, setBusy] = useState(false);
  const [askingConsent, setAskingConsent] = useState(false);
  // The text this answer was made for, so editing afterwards hides it
  const [answer, setAnswer] = useState<{ for: string; value: TranscriptCheck } | null>(null);

  if (!allowed || text.trim().split(/\s+/).filter(Boolean).length < 3) return null;

  async function check() {
    if (!hasAiConsent()) return setAskingConsent(true);
    setAskingConsent(false);
    setBusy(true);
    const value = await askTranscriptCheck({ ...context, transcript: text }, token);
    setAnswer({ for: text, value });
    setBusy(false);
  }

  const current = answer && answer.for === text ? answer.value : null;

  return (
    <div className="mt-2 text-xs" aria-live="polite">
      {askingConsent && <AiConsentNotice onAccept={() => void check()} onDecline={() => setAskingConsent(false)} />}

      {!current && !askingConsent && (
        <button type="button" onClick={check} disabled={busy} className="font-medium text-brand-300 hover:text-fg disabled:opacity-50">
          {busy ? "Listening closely…" : "✦ Check what we heard"}
        </button>
      )}

      {current && !current.ok && <p className="text-amber-300">{current.message}</p>}

      {current?.ok && current.changes.length === 0 && <p className="text-emerald-300">Everything sounds right to us.</p>}

      {current?.ok && current.changes.length > 0 && (
        <div className="rounded-lg border border-brand-400/40 bg-brand-500/[0.07] p-3">
          <p className="text-fg/60">Some words may have been misheard:</p>
          <ul className="mt-2 space-y-1.5">
            {current.changes.map((c) => (
              <li key={c.heard} className="flex flex-wrap items-center gap-x-2 text-sm">
                <span className="text-fg/50">We heard</span>
                <span className="rounded bg-fg/10 px-1.5 py-0.5 text-fg line-through decoration-fg/40">{c.heard}</span>
                <span className="text-fg/50">We think you meant</span>
                <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 font-medium text-emerald-300">{c.meant}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex gap-3">
            <button
              type="button"
              onClick={() => {
                onUse(current.corrected);
                setAnswer(null);
              }}
              className="font-medium text-brand-300 hover:text-fg"
            >
              Use corrected text
            </button>
            <button type="button" onClick={() => setAnswer(null)} className="text-fg/50 hover:text-fg">
              Keep what I said
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

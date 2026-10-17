"use client";

import { useState } from "react";
import { askAi, type AiKind, type AiResult } from "@/lib/ai-client";
import { AiConsentNotice, hasAiConsent } from "./ai-consent";
import { useAiAccess } from "./use-ai-access";

/** Which request field carries the student's text, for each kind of suggestion. */
const TEXT_FIELD: Record<AiKind, string> = {
  "improve-bullet": "text",
  "improve-project": "detail",
  "improve-summary": "draft",
};

/**
 * "Improve with AI" under a text box. The student taps it, sees a suggestion with a short reason,
 * and chooses to use it or dismiss it. Nothing is ever replaced without a tap.
 * Hidden for everyone who is not allowed to use the AI yet, and until there are a few words to work with.
 */
export function AiAssist({
  kind,
  text,
  context,
  onUse,
  minWords = 3,
}: {
  kind: AiKind;
  /** What the student has written so far. */
  text: string;
  /** Extra facts for the AI, such as the project name or course. Sent as-is. */
  context?: Record<string, string>;
  /** Called with the suggestion when the student taps "Use this". */
  onUse: (improved: string) => void;
  minWords?: number;
}) {
  const { allowed, token } = useAiAccess();
  const [busy, setBusy] = useState(false);
  // Shown once, before the first request, because the line leaves our server for Google
  const [askingConsent, setAskingConsent] = useState(false);
  // The text this result was made for, so an edit afterwards hides a stale suggestion
  const [result, setResult] = useState<{ for: string; value: AiResult } | null>(null);

  if (!allowed || text.trim().split(/\s+/).filter(Boolean).length < minWords) return null;

  async function ask() {
    if (!hasAiConsent()) return setAskingConsent(true);
    setAskingConsent(false);
    setBusy(true);
    const value = await askAi(kind, { ...context, [TEXT_FIELD[kind]]: text }, token);
    setResult({ for: text, value });
    setBusy(false);
  }

  const current = result && result.for === text ? result.value : null;

  return (
    <div className="mt-1.5 text-xs" aria-live="polite">
      {askingConsent && !current && <AiConsentNotice onAccept={() => void ask()} onDecline={() => setAskingConsent(false)} />}

      {!current && !askingConsent && (
        <button type="button" onClick={ask} disabled={busy} className="font-medium text-brand-300 hover:text-fg disabled:opacity-50">
          {busy ? "Thinking…" : "✦ Improve with AI"}
        </button>
      )}

      {current && !current.ok && <p className="text-amber-300">{current.message}</p>}

      {current?.ok && (
        <div className="rounded-lg border border-brand-400/40 bg-brand-500/[0.07] p-3">
          <p className="text-sm leading-relaxed text-fg">{current.suggestion.improved}</p>
          {current.suggestion.why && <p className="mt-1.5 text-fg/60">{current.suggestion.why}</p>}
          {current.suggestion.remaining !== undefined && (
            <p className="mt-1 text-fg/40">{current.suggestion.remaining} free tries left today</p>
          )}
          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={() => {
                onUse(current.suggestion.improved);
                setResult(null);
              }}
              className="font-medium text-brand-300 hover:text-fg"
            >
              Use this
            </button>
            <button type="button" onClick={() => setResult(null)} className="text-fg/50 hover:text-fg">
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

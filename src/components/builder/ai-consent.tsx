"use client";

const CONSENT_KEY = "cv11-ai-consent-v1";

/** Whether this student has already agreed to their text being sent to Google. Only a convenience, so a blocked store just means asking again. */
export function hasAiConsent(): boolean {
  try {
    return localStorage.getItem(CONSENT_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * The note shown once, before the first AI request, because the text leaves our server for Google.
 * Shared by every AI button so the wording never drifts apart.
 */
export function AiConsentNotice({ onAccept, onDecline }: { onAccept: () => void; onDecline: () => void }) {
  return (
    <div className="rounded-lg border border-fg/15 bg-fg/[0.03] p-3 text-xs text-fg/70">
      <p>
        To do this, we send <b className="text-fg">only the text in this box</b> to Google&apos;s AI. We do not send your name, phone or
        email. Google may use it to improve its products.{" "}
        <a href="/privacy#ai" target="_blank" className="underline">
          Read more
        </a>
      </p>
      <div className="mt-2 flex gap-3">
        <button
          type="button"
          onClick={() => {
            try {
              localStorage.setItem(CONSENT_KEY, "1");
            } catch {}
            onAccept();
          }}
          className="font-medium text-brand-300 hover:text-fg"
        >
          OK, continue
        </button>
        <button type="button" onClick={onDecline} className="text-fg/50 hover:text-fg">
          Not now
        </button>
      </div>
    </div>
  );
}

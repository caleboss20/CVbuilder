"use client";

import { trackEvent } from "@/lib/track";
import { whatsappShareLink, type ShareKind } from "@/lib/site";

/**
 * A gentle "tell a friend" prompt shown after a download, since most students find CV11
 * through classmates on WhatsApp. It is one tap, never blocks anything, and can be closed.
 */
export function ShareNudge({ kind, onDismiss, className = "" }: { kind: ShareKind; onDismiss?: () => void; className?: string }) {
  return (
    <div className={`flex items-center gap-3 rounded-xl border border-fg/10 bg-fg/[0.04] p-3 text-sm ${className}`} role="status">
      <p className="min-w-0 flex-1 text-fg/70">Know a classmate who needs this? Send them the link.</p>
      <a
        href={whatsappShareLink(kind)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent("share_whatsapp", { from: kind })}
        className="flex shrink-0 items-center gap-2 rounded-md px-3 py-2 font-medium text-fg ring-1 ring-fg/15 hover:bg-fg/5"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="text-[#25D366]">
          <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.5 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.3.5-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.1.1.7-.1 1.3z" />
        </svg>
        Share
      </a>
      {onDismiss && (
        <button type="button" onClick={onDismiss} aria-label="Close" className="shrink-0 px-1 text-fg/45 hover:text-fg">
          ✕
        </button>
      )}
    </div>
  );
}

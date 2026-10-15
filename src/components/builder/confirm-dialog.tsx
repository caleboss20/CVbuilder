"use client";

import { useEffect, useRef } from "react";

/**
 * A confirmation pop-up that matches the rest of the app, used instead of the
 * browser's plain alert box. Cancel is focused first, so pressing Enter by
 * accident keeps the student's work. Escape, the backdrop and Cancel all back out.
 */
export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  cancelLabel = "Keep my CV",
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-ink-950/75 p-3 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        // Clicks inside the card must not reach the backdrop, which closes the dialog
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-fg/10 bg-ink-900 p-6 shadow-[0_30px_80px_-20px_rgb(0_0_0/0.6)]"
      >
        <span className="grid size-10 place-items-center rounded-full bg-amber-400/15 text-amber-300" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 9v4M12 17h.01" />
            <path d="M10.3 3.9 2.4 17.5A2 2 0 0 0 4.1 20.5h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
          </svg>
        </span>
        <h2 id="confirm-title" className="mt-4 text-lg font-medium text-fg">
          {title}
        </h2>
        <p id="confirm-message" className="mt-1.5 text-sm leading-relaxed text-fg/60">
          {message}
        </p>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="rounded-md px-4 py-2.5 text-sm font-medium text-fg ring-1 ring-fg/20 hover:bg-fg/5"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-md bg-red-500/90 px-4 py-2.5 text-sm font-medium text-white ring-1 ring-red-300/50 shadow-[0_0_18px_rgb(239_68_68/0.35)] hover:bg-red-500"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

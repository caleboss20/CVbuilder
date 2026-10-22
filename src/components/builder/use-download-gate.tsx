"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useUser } from "@/components/auth/use-user";
import { DOWNLOAD_DAYS, DOWNLOAD_PRICE, fetchCvAccess, paymentsEnabled, rememberResume, savedPartner, startCheckout } from "@/lib/payments";

type Kind = "pdf" | "word";
type DialogState = "checking" | "signup" | "pay" | "ready" | null;

/**
 * The gate in front of the Download buttons. While payments are off it lets every download through.
 * When they are on: not signed in -> sign up first; signed in but not paid -> pay with Paystack;
 * paid (or the owner) -> the download goes ahead. Sign-up and payment both lead back to the builder.
 *
 * Use it like this:
 *   const gate = useDownloadGate({ cvId, onPdf, onWord });
 *   <button onClick={() => gate.request("pdf")}>Download PDF</button>
 *   {gate.dialog}
 */
export function useDownloadGate({ cvId, onPdf, onWord }: { cvId: string | undefined; onPdf: () => void; onWord: () => void }) {
  const { user, session, loading } = useUser();
  const [state, setState] = useState<DialogState>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  // A partner code the student typed, or one kept from a link they opened
  const [partner, setPartner] = useState("");
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of a code kept from a link
    setPartner(savedPartner());
  }, []);

  const run = useCallback((kind: Kind) => (kind === "pdf" ? onPdf() : onWord()), [onPdf, onWord]);

  /** Decides what to show for a download the student asked for, or (with no kind) after coming back. */
  const request = useCallback(
    async (kind?: Kind) => {
      if (!paymentsEnabled) return kind && run(kind);
      if (loading || !cvId) return;
      setError("");
      if (!user) return setState("signup");

      setState("checking");
      const access = await fetchCvAccess(cvId);
      if (!access) {
        setError("We could not check your payment. Please try again.");
        return setState("pay");
      }
      if (access.paid && kind) {
        setState(null);
        return run(kind);
      }
      setState(access.paid ? "ready" : "pay");
    },
    [loading, cvId, user, run],
  );

  async function pay() {
    if (!cvId || !session) return;
    setBusy(true);
    setError("");
    const result = await startCheckout(cvId, session.access_token, partner);
    if ("error" in result) {
      setError(result.error);
      setBusy(false);
      return;
    }
    // On to Paystack. They come back to /pay/return, which unlocks the CV and returns them here.
    window.location.assign(result.url);
  }

  const button = "inline-flex h-11 w-full items-center justify-center rounded-md px-4 text-[15px] font-medium";
  const primary = `${button} bg-brand-600 text-white ring-1 ring-brand-300/60 shadow-[0_0_18px_rgb(124_128_255/0.45)] hover:bg-brand-500 disabled:opacity-50`;
  const secondary = `${button} text-fg ring-1 ring-fg/15 hover:bg-fg/5`;

  const dialog = state && (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 print:hidden" role="dialog" aria-modal="true" aria-label="Download your CV">
      <div className="w-full max-w-sm rounded-xl border border-fg/10 bg-ink-900 p-6 shadow-2xl">
        {state === "checking" && <p className="text-sm text-fg/70">One moment…</p>}

        {state === "signup" && (
          <>
            <h2 className="text-lg font-medium text-fg">Create a free account to download</h2>
            <p className="mt-2 text-sm text-fg/65">
              It takes a minute. Your CV is saved on this phone and will be waiting for you. After you sign up, you can pay {DOWNLOAD_PRICE} and
              download it.
            </p>
            <div className="mt-5 space-y-2">
              <Link href="/signup" onClick={() => rememberResume("/builder?download=1")} className={primary}>
                Create account
              </Link>
              <Link href="/login" onClick={() => rememberResume("/builder?download=1")} className={secondary}>
                I already have an account
              </Link>
            </div>
          </>
        )}

        {state === "pay" && (
          <>
            <h2 className="text-lg font-medium text-fg">Download your CV for {DOWNLOAD_PRICE}</h2>
            <ul className="mt-3 space-y-1.5 text-sm text-fg/70">
              <li>Pay once for this CV, with no subscription.</li>
              <li>PDF and Word, as many times as you like for {DOWNLOAD_DAYS} days.</li>
              <li>Pay with MTN, Telecel or AirtelTigo mobile money, or a card.</li>
            </ul>
            <label className="mt-4 block text-sm text-fg/70">
              Partner code (optional)
              <input
                value={partner}
                onChange={(e) => setPartner(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12))}
                placeholder="Only if someone helped you"
                autoComplete="off"
                className="mt-1.5 block h-10 w-full rounded-md bg-fg/5 px-3 text-[15px] text-fg ring-1 ring-fg/15 placeholder:text-fg/35 focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </label>
            {error && <p className="mt-3 text-sm text-amber-300">{error}</p>}
            <div className="mt-5 space-y-2">
              <button type="button" onClick={pay} disabled={busy} className={primary}>
                {busy ? "Opening payment…" : `Pay ${DOWNLOAD_PRICE}`}
              </button>
              <p className="text-center text-xs text-fg/45">Secured by Paystack. We never see your card or mobile money PIN.</p>
            </div>
          </>
        )}

        {state === "ready" && (
          <>
            <h2 className="text-lg font-medium text-fg">You&apos;re all set</h2>
            <p className="mt-2 text-sm text-fg/65">Your downloads for this CV are open. Choose a format.</p>
            <div className="mt-5 space-y-2">
              <button type="button" className={primary} onClick={() => (setState(null), run("pdf"))}>
                Download PDF
              </button>
              <button type="button" className={secondary} onClick={() => (setState(null), run("word"))}>
                Download Word
              </button>
            </div>
          </>
        )}

        {state !== "checking" && (
          <button type="button" onClick={() => setState(null)} className="mt-4 w-full text-center text-sm text-fg/50 hover:text-fg">
            Not now
          </button>
        )}
      </div>
    </div>
  );

  /** False until we know whether the student is signed in, so a resume does not run too early. */
  return { request, dialog, ready: !loading };
}

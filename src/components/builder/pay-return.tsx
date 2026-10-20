"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "@/components/auth/use-user";
import { confirmCheckout } from "@/lib/payments";
import { siteConfig } from "@/lib/site";

type State = "working" | "paid" | "unconfirmed" | "missing";

/** How many times to ask Paystack before giving up, and how long to wait between asks. */
const TRIES = 4;
const WAIT_MS = 2500;

/**
 * The page Paystack sends the student back to. It asks our server to confirm the payment with
 * Paystack (the browser's word is never enough), then returns them to their CV with downloads open.
 */
export function PayReturn() {
  const router = useRouter();
  const { session, loading } = useUser({ eager: true });
  const [state, setState] = useState<State>("working");

  useEffect(() => {
    if (loading) return;
    const reference = new URLSearchParams(window.location.search).get("reference");
    if (!reference || !session) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- nothing to confirm without both
      setState("missing");
      return;
    }

    let cancelled = false;
    (async () => {
      for (let i = 0; i < TRIES && !cancelled; i++) {
        if (await confirmCheckout(reference, session.access_token)) {
          if (cancelled) return;
          setState("paid");
          setTimeout(() => router.replace("/builder?paid=1"), 1200);
          return;
        }
        await new Promise((r) => setTimeout(r, WAIT_MS));
      }
      if (!cancelled) setState("unconfirmed");
    })();
    return () => {
      cancelled = true;
    };
  }, [loading, session, router]);

  return (
    <div className="mx-auto max-w-md px-6 pb-24 pt-40 text-center">
      {state === "working" && (
        <>
          <h1 className="text-2xl font-medium text-fg">Confirming your payment…</h1>
          <p className="mt-3 text-sm text-fg/60">Please do not close this page. It only takes a few seconds.</p>
        </>
      )}

      {state === "paid" && (
        <>
          <h1 className="text-2xl font-medium text-fg">Payment received</h1>
          <p className="mt-3 text-sm text-fg/60">Taking you back to your CV…</p>
        </>
      )}

      {state === "unconfirmed" && (
        <>
          <h1 className="text-2xl font-medium text-fg">We could not confirm it yet</h1>
          <p className="mt-3 text-sm text-fg/60">
            If money left your account, do not pay again. It usually unlocks within a few minutes. Open your CV and try the download, or message us on
            WhatsApp and we will sort it out.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Link href="/builder?download=1" className="inline-flex h-11 items-center justify-center rounded-md bg-brand-600 text-[15px] font-medium text-white">
              Back to my CV
            </Link>
            {siteConfig.whatsapp && (
              <a href={`https://wa.me/${siteConfig.whatsapp}`} className="inline-flex h-11 items-center justify-center rounded-md text-[15px] text-fg ring-1 ring-fg/15">
                Message us on WhatsApp
              </a>
            )}
          </div>
        </>
      )}

      {state === "missing" && (
        <>
          <h1 className="text-2xl font-medium text-fg">Nothing to confirm</h1>
          <p className="mt-3 text-sm text-fg/60">Please log in and open your CV to download it.</p>
          <Link href="/builder" className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-brand-600 px-6 text-[15px] font-medium text-white">
            Open my CV
          </Link>
        </>
      )}
    </div>
  );
}

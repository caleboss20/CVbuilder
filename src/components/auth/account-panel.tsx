"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authConfigured } from "@/lib/auth-config";
import { DOWNLOAD_DAYS, DOWNLOAD_PRICE, paymentsEnabled, takeResume } from "@/lib/payments";
import { getSupabase } from "@/lib/supabase";
import { useUser } from "./use-user";

/** One paid CV download, as listed under "Your payments". */
type PaidRow = { reference: string; amount_pesewas: number; paid_at: string };

/** What a signed-in student sees: who they are, how downloads work, and a way to sign out. */
export function AccountPanel() {
  const router = useRouter();
  const { user, loading } = useUser({ eager: true });
  const [paid, setPaid] = useState<PaidRow[]>([]);

  // A student who confirmed their email while trying to download lands here: send them back to their CV
  useEffect(() => {
    if (!user) return;
    const back = takeResume();
    if (back) router.replace(back);
  }, [user, router]);

  // The student's own paid downloads, newest first (the database only returns their own rows)
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    void (async () => {
      const { data } = (await getSupabase()?.from("payments").select("reference, amount_pesewas, paid_at").eq("user_id", user.id).eq("status", "paid").order("paid_at", { ascending: false }).limit(20)) ?? {};
      if (!cancelled && data) setPaid(data as PaidRow[]);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!authConfigured) return <p className="text-sm text-fg/70">Accounts are not switched on yet.</p>;
  if (loading) return <p className="text-sm text-fg/55">Loading…</p>;

  if (!user) {
    return (
      <p className="text-sm text-fg/70">
        You are not logged in.{" "}
        <Link href="/login" className="text-brand-300 underline">
          Log in
        </Link>{" "}
        or{" "}
        <Link href="/signup" className="text-brand-300 underline">
          create an account
        </Link>
        .
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <dl className="space-y-4 text-sm">
        <div>
          <dt className="text-xs uppercase tracking-wide text-fg/45">Email</dt>
          <dd className="mt-1 break-all text-fg">{user.email}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-fg/45">Pricing</dt>
          <dd className="mt-1 text-fg">
            {paymentsEnabled ? `Free to build. ${DOWNLOAD_PRICE} to download a CV, then ${DOWNLOAD_DAYS} days of downloads.` : "Free"} ·{" "}
            <Link href="/pricing" className="text-brand-300 hover:text-fg">Details</Link>
          </dd>
        </div>
      </dl>

      {paid.length > 0 && (
        <div>
          <h2 className="text-xs uppercase tracking-wide text-fg/45">Your payments</h2>
          <ul className="mt-2 divide-y divide-fg/10 text-sm">
            {paid.map((p) => (
              <li key={p.reference} className="flex items-center justify-between gap-3 py-3">
                <span className="text-fg">
                  {new Date(p.paid_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} · GH₵ {(p.amount_pesewas / 100).toFixed(2)}
                </span>
                <Link href={`/receipt?ref=${encodeURIComponent(p.reference)}`} className="text-brand-300 hover:text-fg">Receipt</Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="button"
        onClick={() => getSupabase()?.auth.signOut()}
        className="inline-flex h-11 items-center justify-center rounded-md px-5 text-sm font-medium text-fg ring-1 ring-fg/20 hover:bg-fg/5"
      >
        Log out
      </button>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { authConfigured } from "@/lib/auth-config";
import { DOWNLOAD_DAYS, DOWNLOAD_PRICE, paymentsEnabled, takeResume } from "@/lib/payments";
import { getSupabase } from "@/lib/supabase";
import { useUser } from "./use-user";

/** What a signed-in student sees: who they are, how downloads work, and a way to sign out. */
export function AccountPanel() {
  const router = useRouter();
  const { user, loading } = useUser({ eager: true });

  // A student who confirmed their email while trying to download lands here: send them back to their CV
  useEffect(() => {
    if (!user) return;
    const back = takeResume();
    if (back) router.replace(back);
  }, [user, router]);

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

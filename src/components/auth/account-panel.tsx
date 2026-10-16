"use client";

import Link from "next/link";
import { authConfigured } from "@/lib/auth-config";
import { getSupabase } from "@/lib/supabase";
import { useUser } from "./use-user";

/** What a signed-in student sees: who they are, their plan, and a way to sign out. */
export function AccountPanel() {
  const { user, loading } = useUser({ eager: true });

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
          <dt className="text-xs uppercase tracking-wide text-fg/45">Plan</dt>
          <dd className="mt-1 text-fg">
            Free · <Link href="/pricing" className="text-brand-300 hover:text-fg">See Pro</Link>
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

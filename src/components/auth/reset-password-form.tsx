"use client";

import Link from "next/link";
import { useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { useUser } from "./use-user";

/**
 * The page a student lands on from the "reset your password" email. Supabase signs them in
 * with the link, so they only need to type a new password.
 */
export function ResetPasswordForm() {
  const { user, loading } = useUser();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = getSupabase();
    if (!supabase) return;
    if (password.length < 8) return setError("Use a password with at least 8 characters.");
    setBusy(true);
    setError("");
    const { error: err } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (err) setError("We could not change your password. The link may have expired, so ask for a new one.");
    else setDone(true);
  }

  if (done) {
    return (
      <p className="text-sm text-emerald-300" role="status">
        Password changed. <Link href="/account" className="underline">Go to your account</Link>.
      </p>
    );
  }

  if (!loading && !user) {
    return (
      <p className="text-sm text-fg/70">
        This link has expired or was already used. <Link href="/login" className="text-brand-300 underline">Ask for a new one from the log-in page</Link>.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <label className="block text-sm font-medium text-fg/80">
        New password
        <input
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          className="mt-1.5 w-full rounded-lg border border-fg/12 bg-fg/[0.03] px-3.5 py-3 text-[15px] text-fg placeholder:text-fg/35 focus:border-brand-400/70 focus:outline-none"
        />
      </label>
      {error && <p className="text-sm text-red-400" role="alert">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="flex h-12 w-full items-center justify-center rounded-md bg-brand-600 text-[15px] font-medium text-white ring-1 ring-brand-300/60 shadow-[0_0_22px_rgb(124_128_255/0.5)] hover:bg-brand-500 disabled:opacity-50"
      >
        {busy ? "Please wait…" : "Save new password"}
      </button>
    </form>
  );
}

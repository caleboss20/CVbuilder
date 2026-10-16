"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authConfigured, getSupabase } from "@/lib/supabase";
import { useUser } from "./use-user";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-fg/12 bg-fg/[0.03] px-3.5 py-3 text-[15px] text-fg placeholder:text-fg/35 focus:border-brand-400/70 focus:outline-none";

/** Turns Supabase's technical errors into something a student can act on. */
function friendly(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login")) return "That email and password do not match. Check them and try again.";
  if (m.includes("already registered") || m.includes("already been registered")) return "That email already has an account. Try logging in instead.";
  if (m.includes("email not confirmed")) return "Please confirm your email first. We sent you a link.";
  if (m.includes("rate limit") || m.includes("too many")) return "Too many tries. Please wait a few minutes and try again.";
  if (m.includes("password")) return "Your password is too weak. Use at least 8 characters.";
  return "Something went wrong. Please try again.";
}

/**
 * One form for both sign up and log in. Email and password only for now. Students who are
 * already signed in are sent straight to their account.
 */
export function AuthForm({ mode, after = "/account" }: { mode: "login" | "signup"; after?: string }) {
  const router = useRouter();
  const { user, loading } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const signup = mode === "signup";

  useEffect(() => {
    if (user) router.replace(after);
  }, [user, router, after]);

  if (!authConfigured) {
    return (
      <p className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-fg/80">
        Accounts are not switched on yet. You can still build and download your CV without one.
      </p>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = getSupabase();
    if (!supabase) return;
    setError("");
    setNotice("");

    if (password.length < 8) return setError("Use a password with at least 8 characters.");

    setBusy(true);
    try {
      if (signup) {
        const { data, error: err } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: `${window.location.origin}/account` },
        });
        if (err) throw err;
        // With email confirmation on, there is no session until they tap the link we emailed
        if (!data.session) setNotice("Almost done. We sent a link to your email. Tap it to finish creating your account.");
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (err) throw err;
      }
    } catch (err) {
      setError(friendly(err instanceof Error ? err.message : ""));
    } finally {
      setBusy(false);
    }
  }

  async function forgot() {
    const supabase = getSupabase();
    if (!supabase) return;
    setError("");
    setNotice("");
    if (!email.trim()) return setError("Type your email above first, then tap this again.");
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (err) setError(friendly(err.message));
    else setNotice("If that email has an account, we sent a link to reset the password.");
  }

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <label className="block text-sm font-medium text-fg/80">
        Email
        <input
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className={inputClass}
        />
      </label>

      <label className="block text-sm font-medium text-fg/80">
        Password
        <input
          type="password"
          autoComplete={signup ? "new-password" : "current-password"}
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          className={inputClass}
        />
      </label>

      {error && <p className="text-sm text-red-400" role="alert">{error}</p>}
      {notice && <p className="text-sm text-emerald-300" role="status">{notice}</p>}

      <button
        type="submit"
        disabled={busy || loading || !email.trim()}
        className="flex h-12 w-full items-center justify-center rounded-md bg-brand-600 text-[15px] font-medium text-white ring-1 ring-brand-300/60 shadow-[0_0_22px_rgb(124_128_255/0.5)] hover:bg-brand-500 disabled:opacity-50 disabled:shadow-none"
      >
        {busy ? "Please wait…" : signup ? "Create my account" : "Log in"}
      </button>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-fg/60">
        {signup ? (
          <p>
            Already have an account?{" "}
            <Link href="/login" className="text-brand-300 hover:text-fg">
              Log in
            </Link>
          </p>
        ) : (
          <>
            <p>
              New here?{" "}
              <Link href="/signup" className="text-brand-300 hover:text-fg">
                Create an account
              </Link>
            </p>
            <button type="button" onClick={forgot} className="text-brand-300 hover:text-fg">
              Forgot password?
            </button>
          </>
        )}
      </div>
    </form>
  );
}

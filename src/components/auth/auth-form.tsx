"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authConfigured } from "@/lib/auth-config";
import { takeResume } from "@/lib/payments";
import { getSupabase } from "@/lib/supabase";
import { PasswordInput } from "./password-input";
import { useUser } from "./use-user";

/**
 * The form's colours in two palettes: the site's own navy and purple, and a plain black and white
 * one for the admin dashboard, so nothing on that page is blue.
 */
const TONES = {
  site: {
    input: "border-fg/15 bg-fg/[0.03] text-fg placeholder:text-fg/40 focus:border-fg/50",
    label: "text-fg/80",
    // The same blue button as the homepage, so every primary button on the site matches
    submit: "bg-brand-600 text-white ring-1 ring-brand-300/60 shadow-[0_0_22px_rgb(124_128_255/0.5)] hover:bg-brand-500 disabled:shadow-none",
    muted: "text-fg/55",
    link: "text-fg underline-offset-4 hover:underline",
    notice: "text-emerald-300",
  },
  neutral: {
    input: "border-afg/15 bg-afg/[0.03] text-afg placeholder:text-afg/35 focus:border-afg/60",
    label: "text-afg/80",
    submit: "bg-afg text-abg hover:opacity-90",
    muted: "text-afg/55",
    link: "text-afg underline-offset-4 hover:underline",
    notice: "text-aup",
  },
} as const;

/** Turns Supabase's technical errors into something a student can act on. */
function friendly(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login")) return "That email and password do not match. Check them and try again.";
  if (m.includes("already registered") || m.includes("already been registered")) return "That email already has an account. Try logging in instead.";
  if (m.includes("email not confirmed")) return "Please confirm your email first. We sent you a link.";
  if (m.includes("rate limit") || m.includes("too many")) return "Too many tries. Please wait a few minutes and try again.";
  if (m.includes("failed to fetch") || m.includes("network")) return "We could not reach CV11. Check your internet and try again.";
  if (m.includes("password should") || m.includes("weak password")) return "Your password is too weak. Use at least 8 characters.";
  // Show Supabase's own words, so an unexpected problem can be fixed instead of guessed at
  return message ? `Something went wrong: ${message}` : "Something went wrong. Please try again.";
}

/**
 * One form for both sign up and log in. Email and password only for now. Students who are
 * already signed in are sent straight to their account.
 */
export function AuthForm({
  mode,
  after = "/account",
  allowSignup = true,
  neutral = false,
}: {
  mode: "login" | "signup";
  /** Plain black and white colours instead of the site's, used on the admin page. */
  neutral?: boolean;
  /** Where to go once signed in. */
  after?: string;
  /** False on private pages, such as the admin log-in, so they do not invite anyone to create an account. */
  allowSignup?: boolean;
}) {
  const router = useRouter();
  const { user, loading } = useUser({ eager: true });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const signup = mode === "signup";
  const tone = neutral ? TONES.neutral : TONES.site;
  const inputClass = `h-12 w-full rounded-md border px-3.5 text-[15px] focus:outline-none ${tone.input}`;

  useEffect(() => {
    // Someone who was stopped at a Download button goes back to it; everyone else to `after`
    if (user) router.replace((!neutral && takeResume()) || after);
  }, [user, router, after, neutral]);

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
    <form onSubmit={submit} className="space-y-3" noValidate>
      {/* The placeholders say what each box is, as on Vercel; the labels stay for screen readers */}
      <label className="block">
        <span className="sr-only">Email address</span>
        <input
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className="sr-only">Password</span>
        <PasswordInput
          value={password}
          onChange={setPassword}
          autoComplete={signup ? "new-password" : "current-password"}
          placeholder={signup ? "Password (8+ characters)" : "Password"}
          neutral={neutral}
        />
      </label>

      {error && <p className="text-sm text-red-400" role="alert">{error}</p>}
      {notice && <p className={`text-sm ${tone.notice}`} role="status">{notice}</p>}

      <button
        type="submit"
        disabled={busy || loading || !email.trim()}
        className={`flex h-12 w-full items-center justify-center rounded-md text-[15px] font-medium disabled:opacity-50 ${tone.submit}`}
      >
        {busy ? "Please wait…" : signup ? "Create account" : "Log in"}
      </button>

      <div className={`space-y-2 pt-3 text-center text-sm ${tone.muted}`}>
        {signup ? (
          <p>
            Already have an account?{" "}
            <Link href="/login" className={tone.link}>
              Log in
            </Link>
          </p>
        ) : (
          <>
            {allowSignup && (
              <p>
                Don’t have an account?{" "}
                <Link href="/signup" className={tone.link}>
                  Sign Up
                </Link>
              </p>
            )}
            <p>
              <button type="button" onClick={forgot} className={tone.link}>
                Forgot password?
              </button>
            </p>
          </>
        )}
      </div>
    </form>
  );
}

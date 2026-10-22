"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useUser } from "@/components/auth/use-user";
import { authConfigured, loadSupabase } from "@/lib/auth-config";
import { rememberResume } from "@/lib/payments";
import { siteConfig, whatsappLink } from "@/lib/site";

type Me =
  | { status: "none" }
  | { status: "pending"; name: string }
  | { status: "paused"; name: string }
  | { status: "approved"; name: string; code: string; customers: number; earned: number; owed: number; waiting: number; paid_out: number; hold_days: number };

const cedis = (pesewas: number) => `GH₵ ${(pesewas / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const card = "rounded-2xl border border-zinc-200 bg-zinc-50 p-6 sm:p-8";
const field = "mt-1.5 block h-11 w-full rounded-md bg-zinc-100 px-3.5 text-[15px] text-zinc-950 ring-1 ring-zinc-300 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500";
const button = "inline-flex h-11 items-center justify-center rounded-full bg-zinc-950 px-5 text-[15px] font-medium text-white hover:bg-zinc-800 disabled:opacity-50";

/**
 * The affiliate's page: log in, apply, see the application's status, and (once approved) the code, the link to
 * share and the earnings. Used for both /affiliates/join and /affiliates/dashboard.
 */
export function AffiliatePanel({ guestTo }: { guestTo?: string } = {}) {
  const router = useRouter();
  const { user, loading } = useUser({ eager: true });
  const [me, setMe] = useState<Me | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    const supabase = await loadSupabase();
    const { data, error } = (await supabase?.rpc("affiliate_me")) ?? {};
    if (error) setMessage("The affiliate program is not switched on yet. Please check back soon.");
    else if (data) setMe(data as Me);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loads the signed-in person's affiliate record
    if (user) void load();
  }, [user, load]);

  async function apply(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setBusy(true);
    const supabase = await loadSupabase();
    const { error } = (await supabase?.rpc("affiliate_apply", { p_name: name, p_phone: phone, p_note: note })) ?? {};
    setBusy(false);
    if (error) {
      setMessage(error.message.includes("closed") ? "We are not taking new affiliates right now. Please check back soon." : "We could not send your application. Please check the details and try again.");
      return;
    }
    await load();
  }

  // Someone who is not logged in and pressed "Become an affiliate" goes straight to the sign-up screen, and comes
  // back here afterwards to fill in the application
  useEffect(() => {
    if (guestTo && authConfigured && !loading && !user) {
      rememberResume("/affiliates/join");
      router.replace(guestTo);
    }
  }, [guestTo, loading, user, router]);

  // On the join page, someone who has already applied (or is approved) belongs on the dashboard
  useEffect(() => {
    if (guestTo && me && me.status !== "none") router.replace("/affiliates/dashboard");
  }, [guestTo, me, router]);

  const link = me && me.status === "approved" && typeof window !== "undefined" ? `${window.location.origin}/?p=${me.code}` : "";
  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setMessage("Could not copy. Select the link and copy it by hand.");
    }
  }

  if (!authConfigured) return <p className="text-center text-zinc-600">Affiliate sign-up is not available right now.</p>;
  if (loading) return <p className="text-center text-zinc-600">Loading…</p>;

  // Not logged in
  if (!user) {
    return (
      <div className={`${card} text-center`}>
        <h2 className="text-xl font-medium text-zinc-950">Log in to join</h2>
        <p className="mt-2 text-sm text-zinc-600">Affiliates use a free CV11 account, so we know who to pay.</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/affiliates/signup" onClick={() => rememberResume("/affiliates/dashboard")} className={button}>Create a free account</Link>
          <Link href="/affiliates/login" onClick={() => rememberResume("/affiliates/dashboard")} className="inline-flex h-11 items-center justify-center rounded-full px-5 text-[15px] text-zinc-950 ring-1 ring-zinc-300 hover:bg-zinc-100">I already have one</Link>
        </div>
      </div>
    );
  }

  if (!me) return <p className="text-center text-zinc-600">{message || "Loading…"}</p>;

  // Not applied yet
  if (me.status === "none") {
    return (
      <form onSubmit={apply} className={`${card} space-y-4`}>
        <h2 className="text-xl font-medium text-zinc-950">Apply to become an affiliate</h2>
        <label className="block text-sm font-medium text-zinc-600">
          Full name (as registered on your MoMo)
          <input value={name} onChange={(e) => setName(e.target.value)} className={field} required minLength={2} maxLength={100} autoComplete="name" />
        </label>
        <label className="block text-sm font-medium text-zinc-600">
          MoMo phone number
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className={field} required minLength={7} maxLength={20} inputMode="tel" autoComplete="tel" placeholder="024 000 0000" />
        </label>
        <label className="block text-sm font-medium text-zinc-600">
          How will you find customers?
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} maxLength={500} className="mt-1.5 block w-full rounded-md bg-zinc-100 px-3.5 py-2.5 text-[15px] text-zinc-950 ring-1 ring-zinc-300 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500" placeholder="For example: I run a cyber café near campus" />
        </label>
        <label className="flex items-start gap-2 text-sm text-zinc-600">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1" />
          <span>
            I agree to the <Link href="/affiliates/terms" className="text-violet-700 underline">affiliate terms</Link>.
          </span>
        </label>
        <button type="submit" disabled={busy || !agreed} className={button}>{busy ? "Sending…" : "Send my application"}</button>
        {message && <p className="text-sm text-amber-700" role="alert">{message}</p>}
      </form>
    );
  }

  if (me.status === "pending") {
    return (
      <div className={card}>
        <h2 className="text-xl font-medium text-zinc-950">Thank you, {me.name}</h2>
        <p className="mt-2 text-zinc-600">Your application is with us. We review each one by hand, usually within a few days. Come back to this page: your code will appear here once you are approved.</p>
      </div>
    );
  }

  if (me.status === "paused") {
    return (
      <div className={card}>
        <h2 className="text-xl font-medium text-zinc-950">Your affiliate code is paused</h2>
        <p className="mt-2 text-zinc-600">New payments are not earning rewards right now. {whatsappLink() ? "Message us on WhatsApp if you have a question." : "Please contact CV11 if you have a question."}</p>
      </div>
    );
  }

  // Approved
  return (
    <div className="space-y-5">
      <div className={card}>
        <p className="text-sm text-zinc-600">Welcome, {me.name}. Your affiliate code:</p>
        <p className="mt-1 font-mono text-4xl font-semibold tracking-widest text-violet-700">{me.code}</p>
        <p className="mt-4 text-sm text-zinc-600">Tell people to type it in the <b className="text-zinc-950">Affiliate code</b> box when they pay, or share your link:</p>
        <p className="mt-2 break-all rounded-lg bg-zinc-100 p-3 text-sm text-zinc-950">{link}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={copy} className="inline-flex h-10 items-center rounded-full px-5 text-sm text-zinc-950 ring-1 ring-zinc-300 hover:bg-zinc-100">{copied ? "Copied" : "Copy link"}</button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`Make a professional CV on CV11: ${link}`)}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center rounded-full px-5 text-sm text-zinc-950 ring-1 ring-zinc-300 hover:bg-zinc-100"
          >
            Share on WhatsApp
          </a>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          ["Customers", String(me.customers)],
          ["Earned", cedis(me.earned)],
          ["Owed to you now", cedis(me.owed)],
          [`Waiting (${me.hold_days} days)`, cedis(me.waiting)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
            <dt className="text-xs text-zinc-600">{label}</dt>
            <dd className="mt-1 text-xl font-semibold tabular-nums text-zinc-950">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="text-xs text-zinc-600">
        Already paid to you: {cedis(me.paid_out)}. Rewards are sent by mobile money on {siteConfig.affiliates.payoutDay}, once you are owed at least {siteConfig.affiliates.minPayout}.
      </p>
    </div>
  );
}

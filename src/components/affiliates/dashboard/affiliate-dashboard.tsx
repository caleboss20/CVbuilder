"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useUser } from "@/components/auth/use-user";
import { LogoMark, Wordmark } from "@/components/ui/logo";
import { authConfigured, loadSupabase } from "@/lib/auth-config";
import { rememberResume } from "@/lib/payments";
import { siteConfig, whatsappLink } from "@/lib/site";

/** What the database says about the signed-in person (the `affiliate_me` function). */
export type Me =
  | { status: "none" }
  | { status: "pending"; name: string }
  | { status: "paused"; name: string }
  | { status: "approved"; name: string; code: string; customers: number; earned: number; owed: number; waiting: number; paid_out: number; hold_days: number };
type Approved = Extract<Me, { status: "approved" }>;
/** One payout recorded for the affiliate. */
export type Payout = { id: number; amount_pesewas: number; paid_at: string; note: string | null };
/** One CV paid for with the affiliate's code (no customer details are ever shown). */
export type Referral = { paid_at: string; amount: number; reward: number; owed: boolean };
/** What the affiliate_activity function returns: recent referrals and each of the last 30 days' earnings. */
export type Activity = { referrals: Referral[]; daily: { day: string; earned: number }[] };
type Section = "home" | "share" | "payouts" | "profile" | "help";

const cedis = (pesewas: number) => `GH₵ ${(pesewas / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const pill = "inline-flex h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold transition-colors";
const primary = `${pill} bg-[#5b5fe0] text-white hover:bg-[#4a4ed0]`;
const outline = `${pill} bg-white text-zinc-900 ring-1 ring-zinc-300 hover:bg-zinc-50`;

/** One small stroked icon, drawn from a path (24 by 24). */
function Icon({ d, size = 20 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}
const ICONS = {
  home: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
  share: "M18 8a3 3 0 1 0-2.8-4M6 15a3 3 0 1 0 0 .01M18 21a3 3 0 1 0 0-.01M8.6 13.5l6.8 4M15.4 6.5l-6.8 4",
  payouts: "M3 7h18v12H3zM3 7l2-3h14l2 3M16 13h2",
  help: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6M12 17h.01",
  users: "M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM20 20v-1.5a3.5 3.5 0 0 0-2.5-3.3M15.5 4.2a3.5 3.5 0 0 1 0 6.6",
  coins: "M12 3c4.5 0 8 1.3 8 3s-3.5 3-8 3-8-1.3-8-3 3.5-3 8-3zM4 6v6c0 1.7 3.5 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.5 3 8 3s8-1.3 8-3v-6",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2",
  check: "M4.5 12.5l5 5 10-11",
};

const NAV: { id: Section; label: string; icon: string }[] = [
  { id: "home", label: "Dashboard", icon: ICONS.home },
  { id: "share", label: "Share & code", icon: ICONS.share },
  { id: "payouts", label: "Payouts", icon: ICONS.payouts },
  { id: "profile", label: "Profile", icon: ICONS.users },
  { id: "help", label: "Help", icon: ICONS.help },
];

/** A card with a soft edge, as used across the dashboard. */
function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.05)] ring-1 ring-zinc-200 ${className}`}>{children}</div>;
}

/** A tinted figure card for the statistics column: an icon, a label and the amount. */
function Tint({ tone, icon, label, value }: { tone: string; icon: string; label: string; value: string }) {
  return (
    <div className={`flex items-center gap-4 rounded-2xl p-5 ${tone}`}>
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/80 text-zinc-700"><Icon d={icon} /></span>
      <div className="min-w-0">
        <p className="text-sm text-zinc-600">{label}</p>
        <p className="truncate text-2xl font-semibold tracking-tight tabular-nums text-zinc-950">{value}</p>
      </div>
    </div>
  );
}

/** The donut: how all that has been earned splits into paid out, owed now and still waiting. */
function EarningsDonut({ me }: { me: Approved }) {
  const parts = [
    { label: "Paid to you", value: me.paid_out, colour: "#5b5fe0" },
    { label: "Owed now", value: me.owed, colour: "#9a9dff" },
    { label: "Waiting", value: me.waiting, colour: "#d9dbff" },
  ];
  const total = parts.reduce((sum, p) => sum + p.value, 0);
  const r = 52;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div>
      <div className="relative mx-auto size-[190px]">
        <svg viewBox="0 0 140 140" className="size-full -rotate-90" aria-hidden="true">
          <circle cx="70" cy="70" r={r} fill="none" stroke="#f1f1f5" strokeWidth="16" />
          {total > 0 &&
            parts.map((p) => {
              const len = (p.value / total) * circ;
              const el = <circle key={p.label} cx="70" cy="70" r={r} fill="none" stroke={p.colour} strokeWidth="16" strokeDasharray={`${len} ${circ - len}`} strokeDashoffset={-offset} />;
              offset += len;
              return el;
            })}
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="text-xl font-semibold tabular-nums text-zinc-950">{cedis(total)}</p>
            <p className="text-xs text-zinc-500">All earned</p>
          </div>
        </div>
      </div>
      <ul className="mt-5 space-y-3 text-sm">
        {parts.map((p) => (
          <li key={p.label} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-zinc-600">
              <span className="size-2.5 rounded-full" style={{ backgroundColor: p.colour }} />
              {p.label}
            </span>
            <span className="font-semibold tabular-nums text-zinc-950">{cedis(p.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Earnings for each of the last 30 days, as bars. Shows a plain line of text until there is something to draw. */
function EarningsChart({ daily }: { daily: Activity["daily"] }) {
  const max = Math.max(...daily.map((d) => d.earned), 0);
  const total = daily.reduce((sum, d) => sum + d.earned, 0);
  return (
    <section aria-label="Earnings, last 30 days">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-950">Earnings, last 30 days</h2>
        <p className="text-sm font-semibold tabular-nums text-zinc-950">{cedis(total)}</p>
      </div>
      <Card className="mt-4">
        {max === 0 ? (
          <p className="py-8 text-center text-[15px] text-zinc-500">Nothing earned in the last 30 days yet. Share your code to get started.</p>
        ) : (
          <div className="flex h-40 items-end gap-1" role="img" aria-label={`Earnings of ${cedis(total)} over the last 30 days`}>
            {daily.map((d) => (
              <div key={d.day} title={`${d.day}: ${cedis(d.earned)}`} className="flex-1 rounded-t bg-[#9a9dff]" style={{ height: `${Math.max((d.earned / max) * 100, d.earned > 0 ? 4 : 1)}%`, opacity: d.earned > 0 ? 1 : 0.25 }} />
            ))}
          </div>
        )}
      </Card>
    </section>
  );
}

/** The latest CVs paid with the code: the date, what was earned, and whether it is owed yet. */
function Referrals({ referrals }: { referrals: Referral[] }) {
  return (
    <section aria-label="Recent referrals">
      <h2 className="text-xl font-semibold tracking-tight text-zinc-950">Recent referrals</h2>
      <Card className="mt-4">
        {referrals.length === 0 ? (
          <p className="text-[15px] text-zinc-500">No CVs paid with your code yet.</p>
        ) : (
          <ul className="divide-y divide-zinc-200">
            {referrals.slice(0, 8).map((r, i) => (
              <li key={i} className="flex items-center justify-between gap-4 py-3 text-[15px]">
                <span className="text-zinc-700">{new Date(r.paid_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                <span className="font-semibold tabular-nums text-zinc-950">+ {cedis(r.reward)}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${r.owed ? "bg-[#e9f6ec] text-emerald-800" : "bg-[#fdf3e7] text-amber-800"}`}>{r.owed ? "Owed" : "Waiting"}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </section>
  );
}

/** The first steps of an affiliate, ticked off as they happen. */
function SetupGuide({ me }: { me: Approved }) {
  const steps = [
    { done: true, title: "Create your account", line: "Your CV11 account is ready." },
    { done: true, title: "Get approved", line: "Your application was accepted and your code is live." },
    { done: me.customers > 0, title: "Share your code", line: "Send your link or code to someone who needs a CV." },
    { done: me.earned > 0, title: "Earn your first reward", line: `You earn ${siteConfig.affiliates.commission} of every CV paid with your code.` },
  ];
  return (
    <section aria-label="Quick setup guide">
      <h2 className="text-xl font-semibold tracking-tight text-zinc-950">Quick setup guide</h2>
      <ol className="mt-4 grid gap-4 sm:grid-cols-2">
        {steps.map((s, i) => (
          <li key={s.title}>
            <Card className="h-full">
              <span className={`grid size-8 place-items-center rounded-full text-sm font-semibold ${s.done ? "bg-[#5b5fe0] text-white" : "bg-zinc-100 text-zinc-500"}`}>
                {s.done ? <Icon d={ICONS.check} size={16} /> : i + 1}
              </span>
              <h3 className="mt-4 font-semibold text-zinc-950">{s.title}</h3>
              <p className="mt-1 text-sm leading-6 text-zinc-600">{s.line}</p>
            </Card>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** The code, the link and the ready-made message, with copy and WhatsApp buttons. */
function SharePanel({ me, link }: { me: Approved; link: string }) {
  const [copied, setCopied] = useState("");
  const message = `Make a professional CV on CV11, free to start. Use my code ${me.code} when you pay, or open this link: ${link}`;

  async function copy(text: string, what: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      setTimeout(() => setCopied(""), 2000);
    } catch {
      setCopied("");
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card>
        <p className="text-sm text-zinc-600">Your affiliate code</p>
        <p className="mt-1 font-mono text-4xl font-semibold tracking-[0.18em] text-[#5b5fe0]">{me.code}</p>
        <p className="mt-4 text-sm leading-6 text-zinc-600">Tell people to type it in the <b className="text-zinc-950">Affiliate code</b> box when they pay.</p>
        <button type="button" onClick={() => copy(me.code, "code")} className={`${outline} mt-5`}>{copied === "code" ? "Copied" : "Copy code"}</button>
      </Card>
      <Card>
        <p className="text-sm text-zinc-600">Your link</p>
        <p className="mt-2 break-all rounded-xl bg-zinc-50 p-3 text-sm text-zinc-900 ring-1 ring-zinc-200">{link}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={() => copy(link, "link")} className={outline}>{copied === "link" ? "Copied" : "Copy link"}</button>
          <a href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer" className={primary}>Share on WhatsApp</a>
        </div>
      </Card>
      <Card className="lg:col-span-2">
        <p className="text-sm text-zinc-600">A message you can send as it is</p>
        <p className="mt-2 rounded-xl bg-zinc-50 p-4 text-[15px] leading-7 text-zinc-900 ring-1 ring-zinc-200">{message}</p>
        <button type="button" onClick={() => copy(message, "message")} className={`${outline} mt-4`}>{copied === "message" ? "Copied" : "Copy message"}</button>
      </Card>
    </div>
  );
}

/** What is owed, what is waiting and when the money is sent. */
function PayoutsPanel({ me, payouts }: { me: Approved; payouts: Payout[] }) {
  const a = siteConfig.affiliates;
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
      <div className="space-y-5">
        <Card>
          <h3 className="font-semibold text-zinc-950">How you are paid</h3>
          <ul className="mt-3 space-y-2 text-[15px] leading-7 text-zinc-600">
            <li>A reward counts as owed {me.hold_days} days after the payment, so refunds can be sorted out first.</li>
            <li>We send owed rewards by mobile money on {a.payoutDay}, once you are owed at least {a.minPayout}.</li>
            <li>Smaller amounts carry over to the next month.</li>
          </ul>
        </Card>
        <Card>
          <h3 className="font-semibold text-zinc-950">Payout history</h3>
          {payouts.length === 0 ? (
            <p className="mt-3 text-[15px] text-zinc-600">No payouts yet. Each one we send will appear here with a receipt.</p>
          ) : (
            <ul className="mt-3 divide-y divide-zinc-200">
              {payouts.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-4 py-3 text-[15px]">
                  <span className="text-zinc-700">{new Date(p.paid_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                  <span className="font-semibold tabular-nums text-zinc-950">{cedis(p.amount_pesewas)}</span>
                  <Link href={`/receipt?payout=${p.id}`} className="font-medium text-[#4a4ed0] hover:underline">Receipt</Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <div className="grid gap-4 sm:grid-cols-3">
          <Tint tone="bg-[#eef0ff]" icon={ICONS.coins} label="Owed now" value={cedis(me.owed)} />
          <Tint tone="bg-[#fdf3e7]" icon={ICONS.clock} label={`Waiting (${me.hold_days} days)`} value={cedis(me.waiting)} />
          <Tint tone="bg-[#e9f6ec]" icon={ICONS.payouts} label="Paid to you" value={cedis(me.paid_out)} />
        </div>
      </div>
      <Card>
        <h3 className="mb-5 font-semibold text-zinc-950">Earnings</h3>
        <EarningsDonut me={me} />
      </Card>
    </div>
  );
}

/**
 * The affiliate's name and mobile money number, with a form to correct them. These decide where payouts go, so once
 * someone is approved a change waits for the owner to confirm it (the database decides; this form just says so).
 */
function ProfilePanel({ email, onSaved }: { email: string; onSaved: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [waiting, setWaiting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const field = "mt-1.5 block h-12 w-full rounded-full border border-zinc-300 bg-white px-5 text-[15px] text-zinc-950 focus:border-[#5b5fe0] focus:outline-none";

  // Load the saved details (the database returns only this person's own row)
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const supabase = await loadSupabase();
      const { data } = (await supabase?.from("affiliates").select("name, phone, pending_name, pending_phone").maybeSingle()) ?? {};
      if (cancelled || !data) return;
      setName(data.pending_name ?? data.name ?? "");
      setPhone(data.pending_phone ?? data.phone ?? "");
      setWaiting(Boolean(data.pending_name || data.pending_phone));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    const supabase = await loadSupabase();
    const { data, error } = (await supabase?.rpc("affiliate_update_profile", { p_name: name, p_phone: phone })) ?? {};
    setBusy(false);
    if (error) {
      setMessage(error.code === "PGRST202" ? "Saving details is not switched on yet." : "We could not save that. Check the name and number and try again.");
      return;
    }
    setWaiting(data === "requested");
    setMessage(data === "requested" ? "Thank you. We will confirm this change before your next payout. Until then, payouts go to your old details." : "Saved.");
    onSaved();
  }

  return (
    <Card className="max-w-xl">
      <h3 className="font-semibold text-zinc-950">Your payout details</h3>
      <p className="mt-1 text-sm leading-6 text-zinc-600">Rewards are sent by mobile money to this name and number. Make sure they match your wallet exactly.</p>
      <form onSubmit={save} className="mt-5 space-y-4">
        <label className="block text-sm font-medium text-zinc-700">
          Full name (as registered on your mobile money)
          <input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={100} autoComplete="name" className={field} />
        </label>
        <label className="block text-sm font-medium text-zinc-700">
          Mobile money number
          <input value={phone} onChange={(e) => setPhone(e.target.value)} required minLength={7} maxLength={20} inputMode="tel" autoComplete="tel" className={field} />
        </label>
        <p className="text-sm text-zinc-500">Account email: {email}</p>
        {waiting && <p className="rounded-xl bg-[#fdf3e7] px-4 py-3 text-sm text-amber-900">A change is waiting for our confirmation.</p>}
        {message && <p className="text-sm text-zinc-700" role="status">{message}</p>}
        <button type="submit" disabled={busy} className={`${primary} disabled:opacity-50`}>{busy ? "Saving…" : "Save details"}</button>
      </form>
    </Card>
  );
}

/** Where to read more or ask a question. */
function HelpPanel() {
  const chat = whatsappLink("Hi CV11, I have a question about my affiliate account.");
  const items = [
    { title: "Questions and answers", line: "How tracking, payouts and the rules work.", href: "/affiliates#faq", label: "Read the FAQ" },
    { title: "Affiliate terms", line: "The full rules of the program.", href: "/affiliates/terms", label: "Read the terms" },
  ];
  return (
    <div className="grid gap-5 sm:grid-cols-3">
      {items.map((h) => (
        <Card key={h.title}>
          <h3 className="font-semibold text-zinc-950">{h.title}</h3>
          <p className="mt-1 text-sm leading-6 text-zinc-600">{h.line}</p>
          <Link href={h.href} className={`${outline} mt-5`}>{h.label}</Link>
        </Card>
      ))}
      {chat && (
        <Card>
          <h3 className="font-semibold text-zinc-950">Talk to us</h3>
          <p className="mt-1 text-sm leading-6 text-zinc-600">A quick question? Message us on WhatsApp.</p>
          <a href={chat} target="_blank" rel="noreferrer" className={`${outline} mt-5`}>Open WhatsApp</a>
        </Card>
      )}
    </div>
  );
}

/** Shown instead of the figures until the application is approved. */
function NotApproved({ me }: { me: Exclude<Me, Approved> }) {
  if (me.status === "none") {
    return (
      <Card className="max-w-xl">
        <h2 className="text-xl font-semibold text-zinc-950">Apply to become an affiliate</h2>
        <p className="mt-2 text-zinc-600">You have an account. The next step is a short application, and we review each one by hand.</p>
        <Link href="/affiliates/join" className={`${primary} mt-6`}>Apply now →</Link>
      </Card>
    );
  }
  return (
    <Card className="max-w-xl">
      <h2 className="text-xl font-semibold text-zinc-950">{me.status === "pending" ? `Thank you, ${me.name}` : "Your affiliate code is paused"}</h2>
      <p className="mt-2 leading-7 text-zinc-600">
        {me.status === "pending"
          ? "Your application is with us. We review each one by hand, usually within a few days. Your code and figures will appear here once you are approved."
          : "New payments are not earning rewards right now. Message us if you have a question."}
      </p>
    </Card>
  );
}

/**
 * The affiliate dashboard, laid out like a modern app: a pale sidebar on the left (logo, the person's name and
 * balance, four sections), a top bar with the page title and a log-out button, and a white working area. The home
 * page has the welcome, the setup guide and the code on the left, and a statistics column on the right with tinted
 * figure cards and the earnings donut. It has no navbar or footer of the marketing site. Everything it shows comes
 * from `affiliate_me`.
 */
export function AffiliateDashboard() {
  const router = useRouter();
  const { user, loading } = useUser({ eager: true });
  const [me, setMe] = useState<Me | null>(null);
  const [error, setError] = useState("");
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [activity, setActivity] = useState<Activity | null>(null);

  const load = useCallback(async () => {
    const supabase = await loadSupabase();
    const { data, error: err } = (await supabase?.rpc("affiliate_me")) ?? {};
    if (err) setError("The affiliate program is not switched on yet. Please check back soon.");
    else if (data) setMe(data as Me);
    // The payouts recorded for this person (the database returns only their own)
    const { data: rows } = (await supabase?.from("affiliate_payouts").select("id, amount_pesewas, paid_at, note").order("paid_at", { ascending: false }).limit(50)) ?? {};
    if (rows) setPayouts(rows as Payout[]);
    // Recent referrals and the 30-day chart (supabase/affiliate-activity.sql); the dashboard works without it
    const { data: act } = (await supabase?.rpc("affiliate_activity")) ?? {};
    if (act) setActivity(act as Activity);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loads the signed-in person's affiliate record
    if (user) void load();
  }, [user, load]);

  // Someone who is not logged in goes to the log-in screen and comes straight back here
  useEffect(() => {
    if (authConfigured && !loading && !user) {
      rememberResume("/affiliates/dashboard");
      router.replace("/affiliates/login");
    }
  }, [loading, user, router]);

  async function logOut() {
    const supabase = await loadSupabase();
    await supabase?.auth.signOut();
    router.replace("/affiliates");
  }

  if (!authConfigured) return <p className="p-10 text-center text-zinc-600">The affiliate dashboard is not available right now.</p>;
  if (loading || !user) return <div className="min-h-screen bg-white" />;
  return <AffiliateDashboardView me={me} payouts={payouts} activity={activity} error={error} email={user.email ?? ""} onLogOut={logOut} />;
}

/** The dashboard's screen, drawn from the data it is given (so it can be shown with sample figures). */
export function AffiliateDashboardView({ me, payouts = [], activity = null, error = "", email, onLogOut }: { me: Me | null; payouts?: Payout[]; activity?: Activity | null; error?: string; email: string; onLogOut: () => void }) {
  const [section, setSection] = useState<Section>("home");
  const approved = me && me.status === "approved" ? me : null;
  const link = approved && typeof window !== "undefined" ? `${window.location.origin}/?p=${approved.code}` : "";
  const first = me && "name" in me ? me.name.split(" ")[0] : "";
  const current = NAV.find((n) => n.id === section) ?? NAV[0];

  return (
    <div className="min-h-screen bg-white text-zinc-950 lg:grid lg:grid-cols-[272px_1fr]">
      {/* Sidebar (a row of tabs on a phone) */}
      <aside className="border-b border-zinc-200 bg-zinc-50 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-b-0 lg:border-r">
        <Link href="/affiliates" aria-label="CV11 Affiliates home" className="flex items-center gap-2 px-5 py-5 lg:px-6 lg:pb-5 lg:pt-7">
          <LogoMark size={30} />
          <Wordmark className="translate-y-[2px] text-zinc-950" size={22} />
          <span className="translate-y-[2px] text-[15px] font-medium text-zinc-500">Affiliates</span>
        </Link>

        {approved && (
          <div className="hidden px-6 pb-6 lg:block">
            <p className="text-sm text-zinc-500">Hello, <b className="text-zinc-900">{first}</b></p>
            <p className="mt-4 text-xs uppercase tracking-wide text-zinc-500">Earned so far</p>
            <p className="text-3xl font-semibold tracking-tight tabular-nums">{cedis(approved.earned)}</p>
            <div className="mt-6 border-t border-zinc-200" />
          </div>
        )}

        <nav aria-label="Dashboard" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-1 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0 lg:pb-0">
          {NAV.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => setSection(n.id)}
              aria-current={section === n.id ? "page" : undefined}
              className={`relative flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-[15px] transition-colors lg:rounded-none lg:px-6 ${section === n.id ? "bg-zinc-200/70 font-semibold text-zinc-950 lg:bg-transparent lg:text-[#4a4ed0]" : "text-zinc-600 hover:bg-zinc-100"}`}
            >
              {section === n.id && <span aria-hidden="true" className="absolute inset-y-1 right-0 hidden w-1 rounded-l-full bg-[#5b5fe0] lg:block" />}
              <Icon d={n.icon} />
              {n.label}
            </button>
          ))}
        </nav>

        <div className="hidden border-t border-zinc-200 p-6 lg:block">
          <p className="truncate text-xs text-zinc-500">{email}</p>
        </div>
      </aside>

      {/* Main area */}
      <div className="min-w-0">
        <header className="flex items-center justify-between gap-4 border-b border-zinc-200 px-5 py-4 sm:px-8 lg:py-5">
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{current.label}</h1>
            <p className="text-sm text-zinc-500">{section === "home" ? "Everything here" : section === "share" ? "Your code and link" : section === "payouts" ? "What you are owed" : section === "profile" ? "Your payout details" : "Answers and contact"}</p>
          </div>
          <button type="button" onClick={onLogOut} className={`${outline} h-10 px-5`}>Log out</button>
        </header>

        <main className="px-5 py-8 sm:px-8 lg:py-10">
          {error && <p className="text-sm text-amber-700" role="alert">{error}</p>}
          {!me && !error && <p className="text-zinc-500">Loading…</p>}

          {me && !approved && section !== "help" && <NotApproved me={me as Exclude<Me, Approved>} />}

          {approved && section === "home" && (
            <div className="grid gap-10 xl:grid-cols-[1fr_340px]">
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Welcome back, {first}</h2>
                  <p className="mt-1 text-zinc-500">Here is what is happening with your code today.</p>
                </div>
                {activity && <EarningsChart daily={activity.daily} />}
                <SetupGuide me={approved} />
                <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-zinc-500">Your affiliate code</p>
                    <p className="font-mono text-3xl font-semibold tracking-[0.18em] text-[#5b5fe0]">{approved.code}</p>
                  </div>
                  <button type="button" onClick={() => setSection("share")} className={primary}>Share your code →</button>
                </Card>
                {activity && <Referrals referrals={activity.referrals} />}
              </div>

              <aside aria-label="Statistics" className="space-y-4 xl:border-l xl:border-zinc-200 xl:pl-10">
                <h2 className="text-lg font-semibold tracking-tight">Statistics</h2>
                <Tint tone="bg-[#fdf3e7]" icon={ICONS.users} label="Customers" value={String(approved.customers)} />
                <Tint tone="bg-[#eef0ff]" icon={ICONS.coins} label="Owed to you now" value={cedis(approved.owed)} />
                <Tint tone="bg-[#e9f6ec]" icon={ICONS.clock} label={`Waiting (${approved.hold_days} days)`} value={cedis(approved.waiting)} />
                <div className="pt-6">
                  <h2 className="mb-5 text-lg font-semibold tracking-tight">Earnings</h2>
                  <EarningsDonut me={approved} />
                </div>
              </aside>
            </div>
          )}
          {approved && section === "share" && <SharePanel me={approved} link={link} />}
          {approved && section === "payouts" && <PayoutsPanel me={approved} payouts={payouts} />}
          {approved && section === "profile" && <ProfilePanel email={email} onSaved={() => {}} />}
          {section === "help" && <HelpPanel />}
        </main>
      </div>
    </div>
  );
}

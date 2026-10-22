"use client";

import { useState } from "react";
import { getSupabase } from "@/lib/supabase";
import type { AdminAffiliate, AdminOverview } from "@/lib/admin-stats";

const cardClass = "rounded-lg border border-afg/10 bg-acard";
const n = (v: number) => v.toLocaleString("en-GB");
/** Pesewas as cedis, for example 500 becomes "GH₵ 5.00". */
const cedis = (pesewas: number) => `GH₵ ${(pesewas / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const day = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

/** A titled grid of label and number pairs. */
function Stats({ title, items }: { title: string; items: [string, string][] }) {
  return (
    <section className={`${cardClass} p-5`} aria-label={title}>
      <h2 className="text-sm font-medium">{title}</h2>
      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
        {items.map(([label, value]) => (
          <div key={label} className="border-t border-afg/10 pt-3">
            <dt className="text-xs text-afg/45">{label}</dt>
            <dd className="mt-1 text-xl font-semibold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/**
 * Money, certificates, shared events, bigger-batch unlocks and AI use, under the main numbers.
 * `overview` is null until it loads, and `missing` is true when supabase/admin-more.sql has not been run.
 */
export function OverviewPanels({ overview, missing }: { overview: AdminOverview | null; missing: boolean }) {
  if (missing) {
    return (
      <section className={`${cardClass} p-5 text-sm text-afg/60`}>
        To see payments, certificates and shared events here, run <span className="font-mono">supabase/admin-more.sql</span> in the Supabase SQL Editor, then refresh.
      </section>
    );
  }
  if (!overview) return null;
  const { money, certificates: c, ai } = overview;

  return (
    <>
      <Stats
        title={`Money, last ${overview.days} days`}
        items={[
          ["Earned", cedis(money.revenue_period)],
          ["Paid downloads", n(money.paid_period)],
          ["Started but not paid", n(money.pending)],
          ["Earned, all time", cedis(money.revenue_total)],
          ["Paid downloads, all time", n(money.paid_total)],
          ["Downloads open right now", n(money.active_access)],
        ]}
      />
      <p className="px-1 text-xs text-afg/40">Current price: {cedis(money.price_pesewas)} per CV. Amounts are before Paystack&apos;s fee.</p>

      <section className={`${cardClass} p-5`} aria-label="Recent payments">
        <h2 className="text-sm font-medium">Latest payments</h2>
        <ul className="mt-4 divide-y divide-afg/10 text-sm">
          {overview.recent_payments.length === 0 && <li className="py-2 text-afg/40">No payments yet.</li>}
          {overview.recent_payments.map((p, i) => (
            <li key={i} className="flex items-center justify-between gap-3 py-2">
              <span className="min-w-0 truncate">{p.email}</span>
              <span className="shrink-0 tabular-nums text-afg/70">
                {cedis(p.amount)} · {day(p.paid_at)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <Stats
        title="Certificates"
        items={[
          [`Made, last ${overview.days} days`, n(c.made_period)],
          [`Batches, last ${overview.days} days`, n(c.batches_period)],
          ["Made, all time", n(c.made_total)],
          ["Shared links (active)", `${n(c.shared_active)} of ${n(c.shared_events)}`],
          ["Collecting names now", n(c.collecting)],
          ["People on shared links", n(c.shared_people)],
          ["Certificates with a verify QR", n(c.verify_certificates)],
          ["Verify QR batches", n(c.verify_batches)],
          ["Times a QR was scanned", n(c.verify_scans)],
          ["Organisers", n(c.organisers)],
        ]}
      />

      <section className={`${cardClass} p-5`} aria-label="Bigger batches">
        <h2 className="text-sm font-medium">Bigger-batch unlocks</h2>
        <ul className="mt-4 divide-y divide-afg/10 text-sm">
          {overview.grants.length === 0 && <li className="py-2 text-afg/40">Nobody has an unlock right now. Add one in the Supabase table cert_grants after a payment.</li>}
          {overview.grants.map((g, i) => (
            <li key={i} className="flex flex-wrap items-center justify-between gap-x-3 py-2">
              <span className="min-w-0 truncate">{g.email}</span>
              <span className="shrink-0 tabular-nums text-afg/70">
                up to {n(g.max_names)} · until {day(g.expires_at)}
                {g.note ? ` · ${g.note}` : ""}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <Stats
        title={`People and AI, last ${overview.days} days`}
        items={[
          ["New accounts", n(overview.signups_period)],
          ["AI requests", n(ai.used_period ?? 0)],
          ["People who used AI", n(ai.users_period ?? 0)],
          ["AI requests today", n(ai.used_today ?? 0)],
        ]}
      />
    </>
  );
}

/** Affiliates: who has applied, who is approved, and what each is owed. `affiliates` is null until it loads. */
export function AffiliatePanel({ affiliates, missing, onChanged }: { affiliates: AdminAffiliate[] | null; missing: boolean; onChanged: () => void }) {
  const [message, setMessage] = useState("");

  /** Runs one of the owner's database actions, then reloads the list. */
  async function act(fn: string, args: Record<string, unknown>) {
    setMessage("");
    const { error } = (await getSupabase()?.rpc(fn, args)) ?? {};
    if (error) setMessage(error.code === "PGRST202" ? "Run supabase/admin-affiliate-actions.sql and supabase/refunds-and-limits.sql in Supabase first." : `Could not do that: ${error.message}`);
    else onChanged();
  }

  /** A suggested code from the name, for example "Ama Mensah" becomes AMAM1. */
  const suggest = (name: string, phone: string) => (name.replace(/[^a-zA-Z]/g, "").slice(0, 4).toUpperCase() || "AFF") + (phone.replace(/D/g, "").slice(-2) || "1");

  if (missing) {
    return (
      <section className={`${cardClass} p-5 text-sm text-afg/60`}>
        To see affiliates here, run <span className="font-mono">supabase/affiliates.sql</span> in the Supabase SQL Editor, then refresh.
      </section>
    );
  }
  if (!affiliates) return null;
  const owedTotal = affiliates.reduce((sum, p) => sum + p.owed, 0);
  return (
    <section className={`${cardClass} p-5`} aria-label="Affiliates">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-medium">Affiliates</h2>
        <p className="text-xs text-afg/50">Owed now, across everyone: {cedis(owedTotal)}</p>
      </div>
      <ul className="mt-4 divide-y divide-afg/10 text-sm">
        {affiliates.length === 0 && <li className="py-2 text-afg/40">No applications yet. People apply at /affiliates.</li>}
        {affiliates.map((p, i) => (
          <li key={i} className="py-3">
            <div className="flex flex-wrap items-center justify-between gap-x-3">
              <span className="min-w-0 truncate font-medium">
                {p.name} {p.code ? <span className="font-mono text-afg/60">({p.code})</span> : null}
              </span>
              <span className="shrink-0 text-xs uppercase tracking-wide text-afg/50">{p.status}</span>
            </div>
            <p className="mt-0.5 text-xs text-afg/50">
              {p.phone} · {p.email}
            </p>
            {p.id && (
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                {p.status !== "approved" && (
                  <button
                    type="button"
                    className="rounded-md border border-afg/20 px-2.5 py-1 hover:bg-afg/5"
                    onClick={() => {
                      const code = window.prompt(`Code for ${p.name} (capital letters and digits, 3 to 12):`, p.code ?? suggest(p.name, p.phone));
                      if (code) void act("admin_affiliate_set", { p_id: p.id, p_status: "approved", p_code: code });
                    }}
                  >
                    {p.status === "paused" ? "Resume" : "Approve"}
                  </button>
                )}
                {p.status === "approved" && (
                  <button type="button" className="rounded-md border border-afg/20 px-2.5 py-1 hover:bg-afg/5" onClick={() => void act("admin_affiliate_set", { p_id: p.id, p_status: "paused" })}>
                    Pause
                  </button>
                )}
                {p.code && (
                  <button
                    type="button"
                    className="rounded-md border border-afg/20 px-2.5 py-1 hover:bg-afg/5"
                    onClick={() => {
                      const text = window.prompt(`Amount sent to ${p.name} by mobile money (GH₵):`, (p.owed / 100).toFixed(2));
                      const pesewas = Math.round(Number(text) * 100);
                      if (text && pesewas > 0) void act("admin_affiliate_payout", { p_id: p.id, p_amount_pesewas: pesewas, p_note: null });
                    }}
                  >
                    Record payout
                  </button>
                )}
              </div>
            )}
            {p.status === "pending" && p.note && <p className="mt-1 text-xs text-afg/60">&ldquo;{p.note}&rdquo;</p>}
            {p.code && (
              <p className="mt-1 text-xs tabular-nums text-afg/70">
                {n(p.customers)} customers · earned {cedis(p.earned)} · <b>owed {cedis(p.owed)}</b> · waiting {cedis(p.waiting)} · paid {cedis(p.paid_out)}
              </p>
            )}
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="mt-3 rounded-md border border-afg/20 px-2.5 py-1 text-xs hover:bg-afg/5"
        onClick={() => {
          const reference = window.prompt("Reference of the payment you refunded on Paystack (starts with cv11_):");
          if (reference && window.confirm("Mark this payment refunded? Its reward is cancelled and the student's download access from it ends.")) void act("admin_payment_refund", { p_reference: reference });
        }}
      >
        Refund a payment
      </button>
      {message && <p className="mt-3 text-xs text-amber-500" role="alert">{message}</p>}
      <p className="mt-3 text-xs text-afg/40">
        Approve gives the person a code. Record payout after you have sent their money by mobile money; it then shows in their dashboard with a receipt.
      </p>
    </section>
  );
}

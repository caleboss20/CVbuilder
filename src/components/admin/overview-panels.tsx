"use client";

import type { AdminOverview } from "@/lib/admin-stats";

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

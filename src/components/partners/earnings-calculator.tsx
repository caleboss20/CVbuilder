"use client";

import { useState } from "react";
import { siteConfig } from "@/lib/site";

const cedis = (v: number) => `GH₵ ${v.toLocaleString("en-GB")}`;

/** "What could I earn?": move the slider to see a month and a year of rewards. */
export function EarningsCalculator() {
  const [customers, setCustomers] = useState(30);
  const rate = siteConfig.partners.commissionCedis;
  return (
    <div className="rounded-2xl border border-fg/10 bg-fg/[0.03] p-6 sm:p-8">
      <label className="block text-sm font-medium text-fg/80" htmlFor="customers">
        CVs you help with each month: <span className="text-fg">{customers}</span>
      </label>
      <input
        id="customers"
        type="range"
        min={5}
        max={200}
        step={5}
        value={customers}
        onChange={(e) => setCustomers(Number(e.target.value))}
        className="mt-4 block w-full accent-emerald-400"
      />
      <dl className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-fg/5 p-4">
          <dt className="text-xs text-fg/55">Each month</dt>
          <dd className="mt-1 text-2xl font-semibold tabular-nums text-emerald-300">{cedis(customers * rate)}</dd>
        </div>
        <div className="rounded-xl bg-fg/5 p-4">
          <dt className="text-xs text-fg/55">Each year</dt>
          <dd className="mt-1 text-2xl font-semibold tabular-nums text-fg">{cedis(customers * rate * 12)}</dd>
        </div>
      </dl>
      <p className="mt-4 text-xs text-fg/45">
        You earn {siteConfig.partners.commission} for every CV paid for with your code. This is arithmetic, not a promise: what you earn depends on how many people you help.
      </p>
    </div>
  );
}

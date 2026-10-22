"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useUser } from "@/components/auth/use-user";
import { LogoMark, Wordmark } from "@/components/ui/logo";
import { authConfigured, loadSupabase } from "@/lib/auth-config";
import { siteConfig } from "@/lib/site";

/** The facts a receipt shows. Everything comes from the signed-in person's own rows (the database only lets them read these). */
type Data = {
  kind: "payment" | "payout";
  number: string;
  date: string;
  title: string;
  lines: [string, string][];
  amount: number;
};

const cedis = (pesewas: number) => `GH₵ ${(pesewas / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const when = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

/**
 * A printable receipt, for either a CV payment (`?ref=`) or a payout to an affiliate (`?payout=`). It is a plain
 * white page with a "Print or save as PDF" button that is hidden when printing. A person can only open receipts
 * that belong to them: the database refuses to return anyone else's row.
 */
export function Receipt() {
  const { user, loading } = useUser({ eager: true });
  const [data, setData] = useState<Data | null>(null);
  const [state, setState] = useState<"loading" | "missing">("loading");

  useEffect(() => {
    if (loading || !user) return;
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    const payout = params.get("payout");
    (async () => {
      const supabase = await loadSupabase();
      if (!supabase) return setState("missing");

      if (ref) {
        const { data: row } = await supabase
          .from("payments")
          .select("reference, amount_pesewas, paid_at, expires_at, partner_code")
          .eq("reference", ref)
          .eq("user_id", user.id)
          .eq("status", "paid")
          .maybeSingle();
        if (!row) return setState("missing");
        setData({
          kind: "payment",
          number: row.reference,
          date: row.paid_at,
          title: "CV download",
          amount: row.amount_pesewas,
          lines: [
            ["Paid by", user.email ?? ""],
            ["Downloads open until", row.expires_at ? when(row.expires_at) : "-"],
            ...(row.partner_code ? ([["Affiliate code used", row.partner_code]] as [string, string][]) : []),
          ],
        });
      } else if (payout) {
        const { data: row } = await supabase
          .from("affiliate_payouts")
          .select("id, amount_pesewas, paid_at, note, affiliates(name, code)")
          .eq("id", payout)
          .maybeSingle();
        if (!row) return setState("missing");
        // The joined record comes back as one object (or, depending on the client, a one-item list)
        const aff = (Array.isArray(row.affiliates) ? row.affiliates[0] : row.affiliates) as { name: string; code: string } | null;
        setData({
          kind: "payout",
          number: `PAYOUT-${row.id}`,
          date: row.paid_at,
          title: "Affiliate payout",
          amount: row.amount_pesewas,
          lines: [
            ["Paid to", aff?.name ?? ""],
            ["Affiliate code", aff?.code ?? ""],
            ["Method", "Mobile money"],
            ...(row.note ? ([["Note", row.note]] as [string, string][]) : []),
          ],
        });
      } else {
        setState("missing");
      }
    })();
  }, [loading, user]);

  if (!authConfigured) return <p className="p-10 text-center text-zinc-600">Receipts are not available right now.</p>;
  if (loading) return <p className="p-10 text-center text-zinc-500">Loading…</p>;
  if (!user) {
    return (
      <p className="p-10 text-center text-zinc-600">
        Please <Link href="/login" className="text-[#4a4ed0] underline">log in</Link> to see your receipt.
      </p>
    );
  }
  if (!data) return <p className="p-10 text-center text-zinc-500">{state === "missing" ? "We could not find that receipt." : "Loading…"}</p>;

  return (
    <div className="min-h-screen bg-zinc-100 px-4 py-10 text-zinc-950 print:bg-white print:p-0">
      <div className="mx-auto max-w-[640px] rounded-2xl bg-white p-8 shadow-sm ring-1 ring-zinc-200 sm:p-12 print:rounded-none print:shadow-none print:ring-0">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-center gap-2">
            <LogoMark size={30} />
            <Wordmark className="translate-y-[2px] text-zinc-950" size={22} />
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-500">Receipt</p>
            <p className="mt-1 break-all font-mono text-xs text-zinc-500">{data.number}</p>
          </div>
        </div>

        <dl className="mt-10 grid grid-cols-2 gap-6 text-sm">
          <div>
            <dt className="text-zinc-500">Date</dt>
            <dd className="mt-1 font-medium">{when(data.date)}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">For</dt>
            <dd className="mt-1 font-medium">{data.title}</dd>
          </div>
          {data.lines.map(([label, value]) => (
            <div key={label}>
              <dt className="text-zinc-500">{label}</dt>
              <dd className="mt-1 break-words font-medium">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-10 flex items-center justify-between border-t border-zinc-200 pt-6">
          <span className="text-lg font-semibold">{data.kind === "payment" ? "Total paid" : "Total sent"}</span>
          <span className="text-2xl font-semibold tabular-nums">{cedis(data.amount)}</span>
        </div>

        <p className="mt-10 text-xs leading-relaxed text-zinc-500">
          {siteConfig.name} · {siteConfig.url.replace(/^https?:\/\//, "")}. Keep this receipt for your records.
        </p>

        <div className="mt-8 flex flex-wrap gap-3 print:hidden">
          <button type="button" onClick={() => window.print()} className="inline-flex h-11 items-center rounded-full bg-[#5b5fe0] px-6 text-sm font-semibold text-white hover:bg-[#4a4ed0]">
            Print or save as PDF
          </button>
          <button type="button" onClick={() => window.history.back()} className="inline-flex h-11 items-center rounded-full px-6 text-sm font-semibold text-zinc-900 ring-1 ring-zinc-300 hover:bg-zinc-50">
            Back
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { useUser } from "@/components/auth/use-user";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { fetchAdminStats, type AdminError, type AdminStats, type DailyPoint } from "@/lib/admin-stats";
import { authConfigured } from "@/lib/supabase";
import { AreaChart, shortDate } from "./area-chart";

const RANGES = [
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
] as const;

/** The three numbers the main chart can show, each with its own colour. */
const SERIES: { key: "people" | "cvs_started" | "cvs_finished"; label: string; color: string }[] = [
  // Plain black or white for the main number, then amber and green, so nothing is blue
  { key: "people", label: "People", color: "rgb(var(--a-fg-rgb))" },
  { key: "cvs_started", label: "CVs started", color: "#f59e0b" },
  { key: "cvs_finished", label: "CVs finished", color: "#10b981" },
];

const n = (v: number) => v.toLocaleString("en-GB");

/** Up or down compared with the period before. Shows nothing useful when there was no data before. */
function Delta({ now, before }: { now: number; before: number }) {
  if (before === 0) return <span className="text-xs text-afg/35">{now > 0 ? "New" : "No change"}</span>;
  const pct = Math.round(((now - before) / before) * 100);
  if (pct === 0) return <span className="text-xs text-afg/35">No change</span>;
  const up = pct > 0;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-xs font-medium ${up ? "bg-aup/15 text-aup" : "bg-adown/15 text-adown"}`}>
      {up ? "▲" : "▼"} {Math.abs(pct)}%
    </span>
  );
}

const cardClass = "rounded-lg border border-afg/10 bg-acard";

/** A private page for the site owner: how many people use CV11 and what they do. */
export function AdminDashboard() {
  const { user, loading: userLoading } = useUser();
  const [days, setDays] = useState<number>(30);
  const [series, setSeries] = useState<(typeof SERIES)[number]["key"]>("people");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<AdminError | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async (period: number) => {
    setBusy(true);
    const result = await fetchAdminStats(period);
    if ("stats" in result) {
      setStats(result.stats);
      setError(null);
    } else {
      setError(result.error);
    }
    setBusy(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch the numbers once signed in, and again when the period changes
    if (user) void load(days);
  }, [user, days, load]);

  let body: React.ReactNode;
  if (!authConfigured) body = <Notice title="Accounts are not switched on">Add the Supabase values first, then come back.</Notice>;
  else if (userLoading || (user && !stats && !error)) body = <Skeleton />;
  else if (!user || error === "not-signed-in")
    body = (
      <div className={`${cardClass} mx-auto mt-12 max-w-sm p-6`}>
        <h1 className="text-base font-medium">Admin log in</h1>
        <p className="mb-5 mt-1.5 text-sm text-afg/55">Use the email that is on the admin list.</p>
        {/* Stays on this page after logging in, instead of going to the student account page */}
        <AuthForm mode="login" after="/admin" />
      </div>
    );
  else if (error === "not-admin") body = <Notice title="This account is not an admin">You are logged in as {user.email}. Add that email to the admin list in Supabase (see supabase/schema.sql).</Notice>;
  else if (error === "not-set-up") body = <Notice title="The dashboard is not set up yet">Run supabase/schema.sql in the Supabase SQL Editor, then refresh this page.</Notice>;
  else if (error === "failed" && !stats) body = <Notice title="Could not load the numbers">Check your internet and press Refresh.</Notice>;
  else if (stats) body = <Panels stats={stats} series={series} onSeries={setSeries} />;

  return (
    <div className="min-h-screen bg-abg text-afg">
      <header className="sticky top-0 z-20 border-b border-afg/10 bg-abg/90 backdrop-blur">
        <div className="mx-auto flex min-h-14 max-w-6xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2 sm:px-6">
          <Logo />
          <span className="text-afg/25" aria-hidden="true">
            /
          </span>
          <span className="text-sm font-medium">Analytics</span>
          {/* On a phone these drop onto their own line instead of squeezing the title */}
          <div className="flex w-full items-center gap-2 sm:ml-auto sm:w-auto">
            <div role="radiogroup" aria-label="Period" className="flex rounded-md border border-afg/10 p-0.5 text-xs">
              {RANGES.map((r) => (
                <button
                  key={r.days}
                  type="button"
                  role="radio"
                  aria-checked={days === r.days}
                  onClick={() => setDays(r.days)}
                  className={`whitespace-nowrap rounded px-2.5 py-1.5 transition-colors ${days === r.days ? "bg-afg/10 text-afg" : "text-afg/50 hover:text-afg"}`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => load(days)}
              disabled={busy || !user}
              className="rounded-md border border-afg/10 px-2.5 py-1.5 text-xs text-afg/70 hover:text-afg disabled:opacity-40"
            >
              {busy ? "Loading…" : "Refresh"}
            </button>
            <ThemeToggle neutral className="size-8" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-4 px-4 py-6 sm:px-6">{body}</main>
    </div>
  );
}

/** The numbers, once they have loaded. */
export function Panels({ stats, series, onSeries }: { stats: AdminStats; series: (typeof SERIES)[number]["key"]; onSeries: (k: (typeof SERIES)[number]["key"]) => void }) {
  const current = SERIES.find((s) => s.key === series) ?? SERIES[0];
  const points = stats.daily.map((d: DailyPoint) => ({ label: shortDate(d.day), value: d[series] }));
  const finishRate = stats.funnel.started ? Math.round((stats.funnel.finished / stats.funnel.started) * 100) : 0;
  const topTemplate = Math.max(1, ...stats.templates.map((t) => t.count));

  const activity: [string, number][] = [
    ["Active devices", stats.totals.active_devices],
    ["Letters downloaded", stats.totals.letters],
    ["Letters signed", stats.totals.letters_signed],
    ["WhatsApp shares", stats.totals.shares],
    ["Backups saved", stats.totals.backups],
    ["Accounts (all time)", stats.accounts],
  ];

  return (
    <>
      {/* The headline numbers double as the chart's tabs, like Vercel's analytics */}
      <section className={cardClass} aria-label="Overview">
        <div role="tablist" className="grid grid-cols-3 border-b border-afg/10">
          {SERIES.map((s) => (
            <button
              key={s.key}
              type="button"
              role="tab"
              aria-selected={series === s.key}
              onClick={() => onSeries(s.key)}
              className={`border-b-2 px-3 py-4 text-left transition-colors sm:px-5 ${series === s.key ? "border-afg bg-afg/[0.03]" : "border-transparent hover:bg-afg/[0.02]"}`}
            >
              <span className="flex items-center gap-2 text-xs text-afg/55">
                <span className="size-2 rounded-full" style={{ background: s.color }} />
                {s.label}
              </span>
              <span className="mt-2 block text-2xl font-semibold tabular-nums sm:text-3xl">{n(stats.totals[s.key])}</span>
              <span className="mt-1.5 block">
                <Delta now={stats.totals[s.key]} before={stats.previous[s.key]} />
              </span>
            </button>
          ))}
        </div>
        <div className="p-3 sm:p-5">
          <p className="mb-2 text-xs text-afg/45">
            {current.label} per day, last {stats.days} days
          </p>
          <AreaChart id={current.key} points={points} color={current.color} />
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className={`${cardClass} p-5`} aria-label="Templates">
          <h2 className="text-sm font-medium">Templates people finish with</h2>
          <ul className="mt-4 space-y-3">
            {stats.templates.length === 0 && <li className="text-sm text-afg/40">No downloads in this period yet.</li>}
            {stats.templates.map((t) => (
              <li key={t.name} className="relative flex items-center justify-between overflow-hidden rounded-md px-3 py-2 text-sm">
                <span aria-hidden="true" className="absolute inset-y-0 left-0 rounded-md bg-afg/10" style={{ width: `${(t.count / topTemplate) * 100}%` }} />
                <span className="relative truncate">{t.name}</span>
                <span className="relative ml-3 tabular-nums text-afg/70">{n(t.count)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className={`${cardClass} p-5`} aria-label="Finish rate">
          <h2 className="text-sm font-medium">Do people finish their CV?</h2>
          <p className="mt-4 text-4xl font-semibold tabular-nums">{finishRate}%</p>
          <p className="mt-1 text-xs text-afg/45">
            {n(stats.funnel.finished)} of {n(stats.funnel.started)} devices that started a CV downloaded it.
          </p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-afg/10" aria-hidden="true">
            <div className="h-full rounded-full bg-aup" style={{ width: `${finishRate}%` }} />
          </div>
          <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-afg/10 pt-4 text-xs">
            {(
              [
                ["People, all time", stats.all_time.people],
                ["Started, all time", stats.all_time.cvs_started],
                ["Finished, all time", stats.all_time.cvs_finished],
              ] as const
            ).map(([label, value]) => (
              <div key={label}>
                <dt className="text-afg/45">{label}</dt>
                <dd className="mt-1 text-lg font-semibold tabular-nums">{n(value)}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      <section className={`${cardClass} p-5`} aria-label="More activity">
        <h2 className="text-sm font-medium">More activity, last {stats.days} days</h2>
        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
          {activity.map(([label, value]) => (
            <div key={label} className="border-t border-afg/10 pt-3">
              <dt className="text-xs text-afg/45">{label}</dt>
              <dd className="mt-1 text-xl font-semibold tabular-nums">{n(value)}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={`${cardClass} mx-auto mt-16 max-w-md p-6 text-center`}>
      <h1 className="text-base font-medium">{title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-afg/55">{children}</p>
    </div>
  );
}

/** Grey placeholders in the same shape as the real panels, while the numbers load. */
function Skeleton() {
  return (
    <div className="animate-pulse space-y-4" aria-label="Loading">
      <div className={`${cardClass} h-80`} />
      <div className="grid gap-4 md:grid-cols-2">
        <div className={`${cardClass} h-56`} />
        <div className={`${cardClass} h-56`} />
      </div>
    </div>
  );
}

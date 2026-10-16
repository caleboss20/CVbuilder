import { getSupabase } from "@/lib/supabase";

/** One day of the chart. */
export type DailyPoint = { day: string; people: number; cvs_started: number; cvs_finished: number };

/** Everything the admin dashboard shows. It mirrors what the `admin_stats` database function returns. */
export type AdminStats = {
  days: number;
  totals: {
    people: number;
    cvs_started: number;
    cvs_finished: number;
    letters: number;
    letters_signed: number;
    shares: number;
    backups: number;
    active_devices: number;
  };
  /** The same numbers for the period just before, so each can show "up or down by". */
  previous: { people: number; cvs_started: number; cvs_finished: number; letters: number; active_devices: number };
  all_time: { people: number; cvs_started: number; cvs_finished: number };
  accounts: number;
  daily: DailyPoint[];
  templates: { name: string; count: number }[];
  funnel: { started: number; finished: number };
};

/** Why loading failed, so the page can say the right thing. */
export type AdminError = "not-signed-in" | "not-admin" | "not-set-up" | "failed";

/** Loads the numbers. Only people on the admin list get them: the database checks that, not the page. */
export async function fetchAdminStats(days: number): Promise<{ stats: AdminStats } | { error: AdminError; detail?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { error: "not-set-up" };

  const { data: session } = await supabase.auth.getSession();
  if (!session.session) return { error: "not-signed-in" };

  const { data, error } = await supabase.rpc("admin_stats", { days });
  if (error) {
    // 42501 with our own message: the database checked and this account is not on the admin list
    if (error.code === "42501" && error.message === "not allowed") return { error: "not-admin" };
    // The function does not exist until supabase/schema.sql has been run
    if (error.code === "PGRST202" || error.code === "42883") return { error: "not-set-up", detail: error.message };
    // Anything else (for example "permission denied for function"): keep the reason so it can be fixed
    return { error: "failed", detail: `${error.code ?? "error"}: ${error.message}` };
  }
  return { stats: data as AdminStats };
}

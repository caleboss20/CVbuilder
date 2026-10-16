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

/**
 * Loads the numbers. Only people on the admin list get them: the database checks that, not the page.
 *
 * It calls the database directly with the access token of the session the page already has, instead
 * of asking the Supabase client to look the session up again, which is what made some log-ins look
 * like they had not worked.
 */
export async function fetchAdminStats(days: number, accessToken: string | undefined): Promise<{ stats: AdminStats } | { error: AdminError; detail?: string }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return { error: "not-set-up" };
  if (!accessToken) return { error: "not-signed-in" };

  let response: Response;
  try {
    response = await fetch(`${url}/rest/v1/rpc/admin_stats`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ days }),
    });
  } catch {
    return { error: "failed", detail: "Could not reach the server" };
  }

  if (response.ok) return { stats: (await response.json()) as AdminStats };

  const body = (await response.json().catch(() => ({}))) as { code?: string; message?: string };
  const code = body.code ?? String(response.status);
  const message = body.message ?? response.statusText;

  // Our own refusal: the database checked, and this account is not on the admin list
  if (code === "42501" && message === "not allowed") return { error: "not-admin" };
  // The function does not exist until supabase/schema.sql has been run
  if (code === "PGRST202" || code === "42883") return { error: "not-set-up", detail: message };
  // The session itself was refused (expired or invalid)
  if (response.status === 401) return { error: "not-signed-in", detail: `${code}: ${message}` };
  // Anything else: keep the reason so it can be fixed
  return { error: "failed", detail: `${code}: ${message}` };
}

import "server-only";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Calls Supabase from the server with the public anon key, optionally as a signed-in person
 * (their access token). There is deliberately no service-role key anywhere in this project, so
 * everything the server may do is limited by row-level security and by the database functions in
 * supabase/*.sql. Returns null when Supabase is not set up or the network fails.
 */
export async function callSupabase(path: string, opts: { token?: string; method?: string; body?: unknown } = {}): Promise<Response | null> {
  if (!SUPABASE_URL || !ANON_KEY) return null;
  try {
    return await fetch(`${SUPABASE_URL}${path}`, {
      method: opts.method ?? (opts.body === undefined ? "GET" : "POST"),
      headers: { apikey: ANON_KEY, authorization: `Bearer ${opts.token ?? ANON_KEY}`, "content-type": "application/json" },
      body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
      cache: "no-store",
    });
  } catch {
    return null;
  }
}

/** Who a Supabase access token belongs to, or null for a missing, bad or expired token. */
export async function userFromToken(token: string): Promise<{ id: string; email: string } | null> {
  const res = await callSupabase("/auth/v1/user", { token });
  if (!res?.ok) return null;
  const user = (await res.json()) as { id?: string; email?: string };
  return user.id && user.email ? { id: user.id, email: user.email } : null;
}

/** Reads the bearer token from a request, or undefined. */
export function bearerToken(request: Request): string | undefined {
  return request.headers.get("authorization")?.replace(/^Bearer /i, "") || undefined;
}

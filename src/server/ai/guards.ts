import "server-only";

import { AI_ACCESS, LIMITS } from "./config";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** What a guard decided: either let the request through, or the error to send back. */
export type GuardResult = { ok: true; userId: string } | { ok: false; status: number; error: string };

/** Looks up who a Supabase access token belongs to. Returns null for a bad or expired token. */
async function userFromToken(token: string): Promise<string | null> {
  if (!SUPABASE_URL || !ANON_KEY) return null;
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: ANON_KEY, authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return ((await res.json()) as { id?: string }).id ?? null;
}

/** Asks the database (the `is_admin` function) whether this person is the site owner. */
async function isAdmin(token: string): Promise<boolean> {
  if (!SUPABASE_URL || !ANON_KEY) return false;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/is_admin`, {
    method: "POST",
    headers: { apikey: ANON_KEY, authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: "{}",
    cache: "no-store",
  });
  return res.ok && (await res.json()) === true;
}

/**
 * Simple per-person rate limit kept in memory. It resets when the server instance restarts and is
 * not shared between instances, so it is a safety net against runaway clicking, not the real
 * budget. Credits in the database will be the real limit.
 */
const recent = new Map<string, number[]>();
function withinRateLimit(userId: string): boolean {
  const now = Date.now();
  const hits = (recent.get(userId) ?? []).filter((t) => now - t < LIMITS.windowMs);
  if (hits.length >= LIMITS.requestsPerWindow) return false;
  hits.push(now);
  recent.set(userId, hits);
  return true;
}

/** Runs all checks for an AI request, cheapest first: signed in, allowed, not hammering. */
export async function guardRequest(request: Request): Promise<GuardResult> {
  const token = request.headers.get("authorization")?.replace(/^Bearer /i, "");
  if (!token) return { ok: false, status: 401, error: "Please log in to use the AI." };

  const userId = await userFromToken(token);
  if (!userId) return { ok: false, status: 401, error: "Your session has expired. Please log in again." };

  if (AI_ACCESS === "admin" && !(await isAdmin(token))) {
    return { ok: false, status: 403, error: "The AI is not open to everyone yet." };
  }
  if (!withinRateLimit(userId)) return { ok: false, status: 429, error: "Too many requests. Please wait a few minutes." };

  return { ok: true, userId };
}

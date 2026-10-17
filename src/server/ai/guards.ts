import "server-only";

import { AI_ACCESS } from "./config";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** What a guard decided: either let the request through, or the error to send back. */
export type GuardResult =
  | {
      ok: true;
      /** Gives back the credit when the AI fails, so a student is not charged for our error. */
      refund: () => Promise<void>;
      /** How many free AI requests this person has left today. */
      remaining: number;
    }
  | { ok: false; status: number; error: string };

/** Calls a Supabase REST endpoint as the signed-in person. Returns null if the call fails. */
async function asUser(token: string, path: string, init: RequestInit = {}): Promise<Response | null> {
  if (!SUPABASE_URL || !ANON_KEY) return null;
  try {
    return await fetch(`${SUPABASE_URL}${path}`, {
      ...init,
      headers: { apikey: ANON_KEY, authorization: `Bearer ${token}`, "content-type": "application/json" },
      cache: "no-store",
    });
  } catch {
    return null;
  }
}

/** Looks up whether a Supabase access token is valid (not bad, not expired). */
async function tokenIsValid(token: string): Promise<boolean> {
  return (await asUser(token, "/auth/v1/user"))?.ok === true;
}

/** Asks the database (the `is_admin` function) whether this person is the site owner. */
async function isAdmin(token: string): Promise<boolean> {
  const res = await asUser(token, "/rest/v1/rpc/is_admin", { method: "POST", body: "{}" });
  return res?.ok === true && (await res.json()) === true;
}

/**
 * Takes one credit from today's allowance, in the database so the count is exact and shared by
 * every server instance. Settings and counts live in supabase/ai.sql.
 */
async function takeCredit(token: string): Promise<GuardResult> {
  const res = await asUser(token, "/rest/v1/rpc/ai_use_credit", { method: "POST", body: "{}" });
  if (!res?.ok) {
    // Most likely supabase/ai.sql has not been run yet. Fail closed so the AI can never run uncounted.
    console.error("[ai] ai_use_credit failed:", res?.status);
    return { ok: false, status: 503, error: "The AI is not available right now." };
  }

  const credit = (await res.json()) as { allowed: boolean; reason?: string; remaining: number };
  if (!credit.allowed) {
    return credit.reason === "site_limit"
      ? { ok: false, status: 503, error: "The AI is resting for today because so many students used it. Please try again tomorrow." }
      : { ok: false, status: 429, error: "You have used your free AI tries for today. They come back tomorrow." };
  }

  return {
    ok: true,
    remaining: credit.remaining,
    refund: async () => {
      await asUser(token, "/rest/v1/rpc/ai_refund_credit", { method: "POST", body: "{}" });
    },
  };
}

/** Runs all checks for an AI request, cheapest first: signed in, allowed, and has credit left. */
export async function guardRequest(request: Request): Promise<GuardResult> {
  const token = request.headers.get("authorization")?.replace(/^Bearer /i, "");
  if (!token) return { ok: false, status: 401, error: "Please log in to use the AI." };

  if (!(await tokenIsValid(token))) return { ok: false, status: 401, error: "Your session has expired. Please log in again." };

  if (AI_ACCESS === "admin" && !(await isAdmin(token))) {
    return { ok: false, status: 403, error: "The AI is not open to everyone yet." };
  }

  return takeCredit(token);
}

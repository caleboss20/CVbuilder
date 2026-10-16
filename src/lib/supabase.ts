import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { authConfigured } from "@/lib/auth-config";

/**
 * The Supabase address and public key. Both are safe to ship in the browser: the key only lets a
 * visitor do what the database's own rules allow. Sign-in stays switched off, and the pages say so,
 * until both values are set in .env.local (and in Vercel for the live site).
 *
 * This file pulls in the whole Supabase library, so pages that are not about accounts should not
 * import it directly: use `authConfigured` and `loadSupabase()` from "@/lib/auth-config" instead.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

/** The one shared browser client, or null when sign-in is not set up. Only call this in the browser. */
export function getSupabase(): SupabaseClient | null {
  if (!authConfigured) return null;
  client ??= createClient(url as string, key as string);
  return client;
}

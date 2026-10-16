import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Whether sign-in is set up, and a way to load the Supabase library only when it is needed.
 *
 * The Supabase library is large (over 200 KB). Importing it normally would make every page of the
 * site download it, even for students who never log in. So pages that only need to know "is
 * sign-in on?" read `authConfigured`, and anything that must talk to Supabase calls
 * `loadSupabase()`, which fetches the library in the background after the page is already usable.
 */
export const authConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

/** The shared Supabase client, loaded on demand. Null when sign-in is not set up. Browser only. */
export async function loadSupabase(): Promise<SupabaseClient | null> {
  if (!authConfigured) return null;
  const { getSupabase } = await import("@/lib/supabase");
  return getSupabase();
}

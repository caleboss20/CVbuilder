"use client";

import type { Session, User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";

/**
 * The signed-in student, kept up to date as they sign in and out (also in other tabs).
 * `loading` is true until the saved session has been checked, so screens do not flash
 * "Log in" at someone who is already signed in. `session` carries the access token, for the
 * few places that need to call the database as the signed-in person.
 */
export function useUser(): { user: User | null; session: Session | null; loading: boolean } {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sign-in is not set up, nothing to wait for
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  return { user: session?.user ?? null, session, loading };
}

"use client";

import type { Session, User } from "@supabase/supabase-js";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { loadSupabase } from "@/lib/auth-config";

/**
 * Supabase keeps a logged-in student's session in the browser under this name. Seeing it is a cheap
 * way to know someone is probably logged in, without downloading the Supabase library to ask.
 */
function hasSavedSession(): boolean {
  try {
    const project = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL as string).hostname.split(".")[0];
    return localStorage.getItem(`sb-${project}-auth-token`) !== null;
  } catch {
    return false;
  }
}

/**
 * The signed-in student, kept up to date as they sign in and out (also in other tabs).
 * `loading` is true until the saved session has been checked, so screens do not flash
 * "Log in" at someone who is already signed in. `session` carries the access token, for the
 * few places that need to call the database as the signed-in person.
 *
 * Most visitors never log in, so by default the Supabase library (over 200 KB) is only downloaded
 * when a saved log-in exists on the device. Pages that are about accounts pass `eager: true`,
 * because they need the library anyway and must notice a log-in made on that very page.
 */
export function useUser({ eager = false }: { eager?: boolean } = {}): { user: User | null; session: Session | null; loading: boolean } {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  // Checked again on every page change, so a log-in made on /login shows up in the navbar straight away
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    if (!eager && !hasSavedSession()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- nobody is logged in, so there is nothing to load
      setSession(null);
      setLoading(false);
      return;
    }

    loadSupabase().then(async (supabase) => {
      if (cancelled) return;
      if (!supabase) {
        setLoading(false);
        return;
      }
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      setSession(data.session);
      setLoading(false);
      const subscription = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
      unsubscribe = () => subscription.data.subscription.unsubscribe();
    });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [eager, pathname]);

  return { user: session?.user ?? null, session, loading };
}

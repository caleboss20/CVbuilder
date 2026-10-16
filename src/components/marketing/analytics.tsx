"use client";

import { Analytics } from "@vercel/analytics/next";
import { useEffect } from "react";
import { useUser } from "@/components/auth/use-user";
import { recordFirstVisit } from "@/lib/events";
import { OWNER_KEY, shouldSkipCounting } from "@/lib/owner";
import { loadSupabase } from "@/lib/auth-config";

/** Remembers which account we already asked "are you the admin?", so that is only asked once per device. */
const CHECKED_KEY = "cv11-admin-checked";

/**
 * Vercel Analytics plus our own counter, both skipping the owner. Returning null from beforeSend
 * drops a page view before it is sent. It also counts each new device once, which is how we know
 * how many people use the site.
 *
 * The first time the admin is logged in on a device, that device is marked as the owner's for good,
 * so the owner's own visits never need switching off by hand.
 */
export function SiteAnalytics() {
  const { user } = useUser();

  useEffect(() => {
    recordFirstVisit();
  }, []);

  useEffect(() => {
    if (!user || shouldSkipCounting()) return;
    try {
      if (localStorage.getItem(CHECKED_KEY) === user.id) return;
      localStorage.setItem(CHECKED_KEY, user.id);
    } catch {
      return;
    }
    // The database answers this, using the admin list, so it cannot be faked from the browser
    void loadSupabase().then((supabase) =>
      supabase?.rpc("is_admin").then(({ data }) => {
        if (data === true) {
          try {
            localStorage.setItem(OWNER_KEY, "1");
          } catch {}
        }
      }),
    );
  }, [user]);

  return <Analytics beforeSend={(event) => (shouldSkipCounting() ? null : event)} />;
}

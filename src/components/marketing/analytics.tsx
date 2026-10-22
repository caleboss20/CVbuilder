"use client";

import { Analytics } from "@vercel/analytics/next";
import { useEffect } from "react";
import { useUser } from "@/components/auth/use-user";
import { currentDeviceId, recordFirstVisit } from "@/lib/events";
import { OWNER_KEY, isBot, isTestSite, shouldSkipCounting } from "@/lib/owner";
import { loadSupabase } from "@/lib/auth-config";
import { rememberPartner } from "@/lib/payments";

/** Remembers which account we already asked "are you the admin?", so that is only asked once per device. */
const CHECKED_KEY = "cv11-admin-checked-2";

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
    // A partner's link ends in ?p=CODE: keep the code until the student reaches the pay screen
    const code = new URLSearchParams(window.location.search).get("p");
    if (code) rememberPartner(code);
  }, []);

  useEffect(() => {
    if (!user || isTestSite() || isBot()) return;
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
          // Also tell the database, which then deletes this device's earlier visits and ignores its future ones
          const device = currentDeviceId();
          if (device) void supabase.rpc("mark_owner_device", { p_device: device });
        }
      }),
    );
  }, [user]);

  return <Analytics beforeSend={(event) => (shouldSkipCounting() ? null : event)} />;
}

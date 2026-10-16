"use client";

import { Analytics } from "@vercel/analytics/next";
import { useEffect } from "react";
import { recordFirstVisit } from "@/lib/events";
import { isOwnerDevice } from "@/lib/owner";

/**
 * Vercel Analytics, except on devices that opted out at /stop-tracking. Returning null from
 * beforeSend drops the page view before it is sent. It also counts each new device once in our
 * own counter, which is how we know how many people use the site.
 */
export function SiteAnalytics() {
  useEffect(() => {
    recordFirstVisit();
  }, []);

  return <Analytics beforeSend={(event) => (isOwnerDevice() ? null : event)} />;
}

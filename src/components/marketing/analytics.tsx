"use client";

import { Analytics } from "@vercel/analytics/next";
import { isOwnerDevice } from "@/lib/owner";

/**
 * Vercel Analytics, except on devices that opted out at /stop-tracking. Returning null from
 * beforeSend drops the page view before it is sent.
 */
export function SiteAnalytics() {
  return <Analytics beforeSend={(event) => (isOwnerDevice() ? null : event)} />;
}

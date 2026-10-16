/**
 * The owner's own devices opt out of analytics, so building and testing the site never
 * inflates the visitor numbers. The flag lives in the browser, set from /stop-tracking.
 */
export const OWNER_KEY = "cv11-owner";

/** True when this browser has opted out of analytics. Safe to call anywhere in the browser. */
export function isOwnerDevice(): boolean {
  try {
    return localStorage.getItem(OWNER_KEY) === "1";
  } catch {
    return false;
  }
}

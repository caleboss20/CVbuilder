/**
 * Keeps the site owner's own visits out of the statistics, so the numbers only show real students.
 * A visit is skipped when any of these is true:
 *  - it comes from a test copy of the site (your computer, or a Vercel preview), or
 *  - the device is marked as the owner's, which happens automatically the first time the admin
 *    logs in on it, or by hand at /stop-tracking.
 */
export const OWNER_KEY = "cv11-owner";

/** True when this browser has been marked as the owner's. Safe to call anywhere in the browser. */
export function isOwnerDevice(): boolean {
  try {
    return localStorage.getItem(OWNER_KEY) === "1";
  } catch {
    return false;
  }
}

/** True on a test copy of the site (localhost, or a Vercel preview), where nothing should be counted. */
export function isTestSite(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1" || host.endsWith(".localhost")) return true;
  // Vercel tells the site which kind of deployment it is, when that setting is on for the project
  const env = process.env.NEXT_PUBLIC_VERCEL_ENV;
  return env === "preview" || env === "development";
}

/**
 * True for search-engine crawlers, link previews (WhatsApp, Facebook), uptime checkers, headless
 * browsers and other automated visitors, which would otherwise be counted as people.
 */
export function isBot(): boolean {
  if (typeof navigator === "undefined") return false;
  if (navigator.webdriver) return true;
  return /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|pingdom|uptime|preview|facebookexternalhit|whatsapp|telegram|vercel|monitor|curl|wget|python|node-fetch/i.test(navigator.userAgent);
}

/** True when a visit or action should not be counted. */
export function shouldSkipCounting(): boolean {
  return isTestSite() || isOwnerDevice() || isBot();
}

import { shouldSkipCounting } from "@/lib/owner";
import { authConfigured } from "@/lib/auth-config";

/**
 * Our own anonymous counter, so we can read real totals (people, CVs started, CVs finished)
 * without anyone needing an account. Each event is one small row: its name, the template or type,
 * a random id for the device, and the time. It never holds a name, email or any CV content.
 */
const DEVICE_KEY = "cv11-device";

/** A random id kept in this browser, so repeat visits from one device are counted once. */
function deviceId(): { id: string; isNew: boolean } {
  try {
    const saved = localStorage.getItem(DEVICE_KEY);
    if (saved) return { id: saved, isNew: false };
    const id = crypto.randomUUID();
    localStorage.setItem(DEVICE_KEY, id);
    return { id, isNew: true };
  } catch {
    // Private windows can block storage. We simply skip counting rather than guess.
    return { id: "", isNew: false };
  }
}

/** Sends one event to our counter. Quiet on failure, and skipped on the owner's own devices. */
export function recordEvent(name: string, props?: Record<string, string | number>) {
  if (!authConfigured || shouldSkipCounting()) return;
  const { id } = deviceId();
  if (!id) return;
  // One small request straight to the database, so counting never downloads the Supabase library.
  // Fire and forget: counting must never slow down or break the student's page.
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
  void fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/events`, {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify({ name, device: id, props: props ?? {} }),
    // Lets the request finish even if the student leaves the page right after, such as a download
    keepalive: true,
  }).catch(() => undefined);
}

/** The anonymous id of this browser, or "" when storage is blocked. Used to tell the database which device is the owner's. */
export function currentDeviceId(): string {
  return deviceId().id;
}

const COUNTED_KEY = "cv11-first-counted";
/** How long a new visitor must stay before they count as a person, so quick bounces and crawlers do not. */
const STAY_MS = 10_000;

/**
 * Counts a brand-new device once, after it has stayed on the site for a few seconds. This is our
 * "people" number. The owner and robots are never counted, and a device that is already known is not
 * counted again.
 */
export function recordFirstVisit() {
  if (!authConfigured || shouldSkipCounting()) return;
  try {
    if (localStorage.getItem(COUNTED_KEY)) return;
    // A device that existed before this rule is not a new person: remember it and stop
    if (!deviceId().isNew) {
      localStorage.setItem(COUNTED_KEY, "1");
      return;
    }
  } catch {
    return;
  }
  window.setTimeout(() => {
    // The owner flag may have been set while we waited (the admin was recognised), so check again
    if (shouldSkipCounting() || document.visibilityState === "hidden") return;
    try {
      if (localStorage.getItem(COUNTED_KEY)) return;
      localStorage.setItem(COUNTED_KEY, "1");
    } catch {
      return;
    }
    recordEvent("first_visit");
  }, STAY_MS);
}

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

/** Counts a brand-new device once, the first time it opens the site. This is our "people" number. */
export function recordFirstVisit() {
  if (!authConfigured || shouldSkipCounting()) return;
  if (deviceId().isNew) recordEvent("first_visit");
}

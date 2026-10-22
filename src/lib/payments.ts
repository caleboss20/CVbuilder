/**
 * Browser-side helpers for paying to download a CV. The money and the rules are handled on the
 * server and in the database (src/server/pay, supabase/payments.sql); this file only asks them
 * questions and sends the student on their way.
 */

import { loadSupabase } from "@/lib/auth-config";
import { siteConfig } from "@/lib/site";

/**
 * Payments are off until the owner sets NEXT_PUBLIC_PAYMENTS_ENABLED=true (after the Paystack keys
 * and supabase/payments.sql are in place). While off, downloads stay free exactly as before.
 */
export const paymentsEnabled = siteConfig.download.enabled;

/** What the student reads. The real price lives in the database (pay_settings), so keep them in step. */
export const DOWNLOAD_PRICE = siteConfig.download.price;
export const DOWNLOAD_DAYS = siteConfig.download.days;

export type CvAccess = { paid: boolean; expiresAt?: string };

/** Whether the signed-in student has paid for this CV (the owner always has access). Null when it could not be checked. */
export async function fetchCvAccess(cvId: string): Promise<CvAccess | null> {
  const supabase = await loadSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("cv_access", { p_cv_id: cvId });
  if (error || !data) return null;
  const row = data as { paid?: boolean; expires_at?: string };
  return { paid: row.paid === true, expiresAt: row.expires_at };
}

const PARTNER_KEY = "cv11-partner";

/**
 * Keeps an affiliate code seen in a link (?p=KOFI) so it is still there when the student reaches the pay screen.
 * It is saved with the time it was seen, and forgotten after `siteConfig.affiliates.linkDays` days. The most recent
 * link wins, as on every affiliate program. Editing this value in the browser can only pick another real code:
 * the server checks the code, and works out the reward itself.
 */
export function rememberPartner(code: string) {
  const clean = code.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
  if (clean.length < 3) return;
  try {
    localStorage.setItem(PARTNER_KEY, `${clean}|${Date.now()}`);
  } catch {}
}

/** The affiliate code kept from a link, or "" when there is none or it is older than the allowed days. */
export function savedPartner(): string {
  try {
    const [code = "", seen = ""] = (localStorage.getItem(PARTNER_KEY) ?? "").split("|");
    const age = Date.now() - Number(seen);
    // A value without a time (saved before this rule existed) counts as expired
    if (!code || !Number.isFinite(age) || age > siteConfig.affiliates.linkDays * 86_400_000) return "";
    return code;
  } catch {
    return "";
  }
}

/** Asks our server for a Paystack checkout page. Returns its URL, or a message to show the student. */
export async function startCheckout(cvId: string, token: string, partner = ""): Promise<{ url: string } | { error: string }> {
  try {
    const res = await fetch("/api/pay/start", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify({ cvId, partner }),
    });
    const data = (await res.json()) as { url?: string; error?: string };
    return data.url ? { url: data.url } : { error: data.error ?? "Could not start the payment." };
  } catch {
    return { error: "Could not reach CV11. Check your internet." };
  }
}

/** Asks our server to confirm a payment with Paystack once the student is back on our site. */
export async function confirmCheckout(reference: string, token: string): Promise<boolean> {
  try {
    const res = await fetch("/api/pay/verify", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify({ reference }),
    });
    return res.ok && ((await res.json()) as { paid?: boolean }).paid === true;
  } catch {
    return false;
  }
}

/**
 * "Take me back to my download": signing up can mean leaving the site to confirm an email, so the
 * place to return to is remembered in this browser. Only a convenience, so a blocked store just
 * means the student finds their way back themselves.
 */
const RESUME_KEY = "cv11-resume-v1";

export function rememberResume(path: string) {
  try {
    localStorage.setItem(RESUME_KEY, path);
  } catch {}
}

/** The remembered place, once. Clears it so it only ever sends the student back one time. */
export function takeResume(): string | null {
  try {
    const path = localStorage.getItem(RESUME_KEY);
    localStorage.removeItem(RESUME_KEY);
    // Only our own pages, never an address someone else slipped in
    return path && path.startsWith("/") && !path.startsWith("//") ? path : null;
  } catch {
    return null;
  }
}

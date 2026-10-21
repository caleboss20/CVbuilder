/**
 * Shared certificate events: the organiser shares one link and each person finds only their own
 * certificate. The rules (who may see what, the lookup limit, expiry) live in supabase/share.sql;
 * this file is the browser's side of it. Browser only.
 */

import { loadSupabase } from "./auth-config";
import type { CertSettings } from "./certificates";

/** The longest the design may be once logo and signatures are included (the database allows a little more). */
const MAX_SETTINGS_CHARS = 850_000;

export type SharedEvent = { id: string; slug: string; title: string; code: string | null; expires_at: string; cert_recipients: { count: number }[] };

/** What a person gets back when they ask for their certificate. */
export type ClaimResult =
  | { status: "ok"; name: string; title: string; settings: CertSettings }
  | { status: "none" | "many" | "code" | "busy" | "gone" };

/** The public address people open to claim a certificate. */
export const claimUrl = (slug: string) => `${window.location.origin}/claim?e=${encodeURIComponent(slug)}`;

/** Creates a shareable event and returns its slug. Throws an Error with a message that is safe to show. */
export async function createSharedEvent(args: { title: string; settings: CertSettings; code: string; names: string[]; days: number }): Promise<string> {
  const supabase = await loadSupabase();
  if (!supabase) throw new Error("Sharing is not available right now.");
  if (JSON.stringify(args.settings).length > MAX_SETTINGS_CHARS) throw new Error("Your logo or signatures are too large to share. Try a smaller logo.");
  const { data, error } = await supabase.rpc("cert_event_create", {
    p_title: args.title || "Certificates",
    p_settings: args.settings,
    p_code: args.code.trim() || null,
    p_names: args.names,
    p_days: args.days,
  });
  if (error) {
    if (error.message.includes("too many active")) throw new Error("You already have 20 active shared events. Delete one first.");
    throw new Error("We could not create the link. Please try again.");
  }
  return data as string;
}

/** The signed-in organiser's events, newest first. */
export async function listSharedEvents(): Promise<SharedEvent[]> {
  const supabase = await loadSupabase();
  if (!supabase) return [];
  const { data } = await supabase
    .from("cert_events")
    .select("id, slug, title, code, expires_at, cert_recipients(count)")
    .order("created_at", { ascending: false });
  return (data as SharedEvent[] | null) ?? [];
}

export async function deleteSharedEvent(id: string): Promise<boolean> {
  const supabase = await loadSupabase();
  if (!supabase) return false;
  const { error } = await supabase.from("cert_events").delete().eq("id", id);
  return !error;
}

/** The title of an event and whether it needs a code, or null when it is gone. */
export async function eventInfo(slug: string): Promise<{ title: string; needsCode: boolean } | null> {
  const supabase = await loadSupabase();
  if (!supabase) return null;
  const { data } = await supabase.rpc("cert_event_info", { p_slug: slug });
  const info = data as { title?: string; needsCode?: boolean; gone?: boolean } | null;
  return info && !info.gone && info.title ? { title: info.title, needsCode: Boolean(info.needsCode) } : null;
}

/** Asks for one person's certificate by name (and the event code, if there is one). */
export async function claimCertificate(slug: string, name: string, code: string): Promise<ClaimResult> {
  const supabase = await loadSupabase();
  if (!supabase) return { status: "gone" };
  const { data, error } = await supabase.rpc("cert_claim", { p_slug: slug, p_query: name, p_code: code });
  if (error || !data) return { status: "busy" };
  return data as ClaimResult;
}

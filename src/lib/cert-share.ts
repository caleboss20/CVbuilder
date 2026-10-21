/**
 * Shared certificate events: the organiser shares one link and each person finds only their own
 * certificate. The rules (who may see what, the lookup limit, expiry) live in supabase/share.sql;
 * this file is the browser's side of it. Browser only.
 */

import { loadSupabase } from "./auth-config";
import type { OwnShare } from "./certificate-own";
import type { CertSettings } from "./certificates";

/** What is stored for a shared event: a built-in design's settings, or the organiser's own uploaded certificate. */
export type SharedDesign = CertSettings | OwnShare;

/** The longest the design may be once logo and signatures are included (the database allows a little more). */
const MAX_SETTINGS_CHARS = 5_500_000;

export type SharedEvent = { id: string; slug: string; title: string; code: string | null; mode: "list" | "register"; released: boolean; expires_at: string; cert_recipients: { count: number }[] };

/** What a person gets back when they ask for their certificate. */
export type ClaimResult =
  | { status: "ok"; name: string; title: string; settings: SharedDesign; ref: string }
  | { status: "none" | "many" | "code" | "busy" | "gone" | "wait" };

/** The public address people open to claim a certificate. */
export const claimUrl = (slug: string) => `${window.location.origin}/claim?e=${encodeURIComponent(slug)}`;

/** Creates a shareable event and returns its slug. Throws an Error with a message that is safe to show. */
export async function createSharedEvent(args: { title: string; settings: SharedDesign; code: string; names: string[]; days: number }): Promise<string> {
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
    if (error.message.includes("over limit")) throw new Error("That is more people than your plan allows. Ask us about a bigger batch.");
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
    .select("id, slug, title, code, mode, released, expires_at, cert_recipients(count)")
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
export async function eventInfo(slug: string): Promise<{ title: string; needsCode: boolean; registering: boolean } | null> {
  const supabase = await loadSupabase();
  if (!supabase) return null;
  const { data } = await supabase.rpc("cert_event_info", { p_slug: slug });
  const info = data as { title?: string; needsCode?: boolean; registering?: boolean; gone?: boolean } | null;
  return info && !info.gone && info.title ? { title: info.title, needsCode: Boolean(info.needsCode), registering: Boolean(info.registering) } : null;
}

/** Asks for one person's certificate by name (and the event code, if there is one). */
export async function claimCertificate(slug: string, name: string, code: string): Promise<ClaimResult> {
  const supabase = await loadSupabase();
  if (!supabase) return { status: "gone" };
  const { data, error } = await supabase.rpc("cert_claim", { p_slug: slug, p_query: name, p_code: code });
  if (error || !data) return { status: "busy" };
  return data as ClaimResult;
}

/** Creates an event where people add their own names. `cap` is the most names it may hold. */
export async function createRegisterEvent(args: { title: string; settings: SharedDesign; code: string; days: number; cap: number }): Promise<string> {
  const supabase = await loadSupabase();
  if (!supabase) throw new Error("Sharing is not available right now.");
  if (JSON.stringify(args.settings).length > MAX_SETTINGS_CHARS) throw new Error("Your logo or signatures are too large to share. Try a smaller logo.");
  const { data, error } = await supabase.rpc("cert_event_open", {
    p_title: args.title || "Certificates",
    p_settings: args.settings,
    p_code: args.code.trim() || null,
    p_days: args.days,
    p_cap: args.cap,
  });
  if (error) {
    if (error.message.includes("too many active")) throw new Error("You already have 20 active shared events. Delete one first.");
    throw new Error("We could not create the link. Please try again.");
  }
  return data as string;
}

/** What happened when a person tried to add their name. */
export type RegisterStatus = "registered" | "full" | "closed" | "code" | "busy" | "short" | "gone";

export async function registerName(slug: string, name: string, code: string): Promise<RegisterStatus> {
  const supabase = await loadSupabase();
  if (!supabase) return "gone";
  const { data, error } = await supabase.rpc("cert_register", { p_slug: slug, p_name: name, p_code: code });
  return error || !data ? "busy" : (data as RegisterStatus);
}

/** Opens the certificates for download (true) or goes back to collecting names (false). */
export async function setReleased(id: string, released: boolean): Promise<boolean> {
  const supabase = await loadSupabase();
  if (!supabase) return false;
  const { error } = await supabase.rpc("cert_event_release", { p_id: id, p_released: released });
  return !error;
}

/** The address a certificate's QR code opens. `ref` comes from a successful claim. */
export const verifyUrl = (ref: string) => `${window.location.origin}/verify?c=${encodeURIComponent(ref)}`;

export type Verified = { valid: true; name: string; title: string; issuer: string | null; issued: string } | { valid: false };

/** Asks whether a certificate reference belongs to a real, current certificate. */
export async function verifyCertificate(ref: string): Promise<Verified | null> {
  const supabase = await loadSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("cert_verify", { p_ref: ref });
  return error || !data ? null : (data as Verified);
}

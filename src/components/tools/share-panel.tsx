"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { QrCode } from "@/components/tools/qr-code";
import { useUser } from "@/components/auth/use-user";
import { authConfigured } from "@/lib/auth-config";
import { claimUrl, createRegisterEvent, createSharedEvent, deleteSharedEvent, listSharedEvents, setReleased, type SharedEvent } from "@/lib/cert-share";
import { FREE_BATCH } from "@/lib/certificate-names";
import type { CertSettings } from "@/lib/certificates";

const field = "mt-1.5 block h-11 w-full rounded-md bg-fg/5 px-3.5 text-[15px] text-fg ring-1 ring-fg/15 focus:outline-none focus:ring-2 focus:ring-brand-400";
const smallButton = "inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium text-fg ring-1 ring-fg/20 hover:bg-fg/5";

/**
 * "Share one link": instead of sending a file to every person, the organiser shares a single link
 * (or QR) and each person finds only their own certificate by typing their name. Needs a sign-in,
 * because the names are kept on our server (until the link expires or the organiser deletes it).
 */
export function SharePanel({ settings, names }: { settings: CertSettings; names: string[] }) {
  const { user, loading } = useUser();
  // "list": the names above are used. "register": people add their own names, then the organiser releases the certificates.
  const [mode, setMode] = useState<"list" | "register">("list");
  const [code, setCode] = useState("");
  const [days, setDays] = useState(90);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);
  // The link whose QR code is showing
  const [qrFor, setQrFor] = useState("");
  const [events, setEvents] = useState<SharedEvent[]>([]);

  const refresh = useCallback(() => {
    listSharedEvents().then(setEvents);
  }, []);
  useEffect(() => {
    if (user) refresh();
  }, [user, refresh]);

  if (!authConfigured) return null;

  async function create() {
    setError("");
    setBusy(true);
    try {
      const title = settings.event.trim();
      const slug =
        mode === "list"
          ? await createSharedEvent({ title, settings, code, names, days })
          : await createRegisterEvent({ title, settings, code, days, cap: FREE_BATCH });
      setLink(claimUrl(slug));
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    }
    setBusy(false);
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy. Select the link and copy it by hand.");
    }
  }

  return (
    <section className="mt-6 rounded-xl border border-fg/10 bg-fg/[0.03] p-5">
      <h2 className="text-base font-medium text-fg">Or share one link</h2>
      <p className="mt-1 text-sm text-fg/60">
        Send a single link to the group. Each person types their own name and downloads only their own certificate. Nobody can see the list.
      </p>

      {loading ? null : !user ? (
        <p className="mt-3 text-sm text-fg/70">
          <Link href="/login" className="text-brand-300 underline">Log in</Link> or <Link href="/signup" className="text-brand-300 underline">sign up</Link> (free) to make a link.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          <fieldset className="space-y-2 text-sm text-fg/80">
            <legend className="sr-only">How do the names get on the list?</legend>
            <label className="flex items-start gap-2"><input type="radio" name="share-mode" checked={mode === "list"} onChange={() => setMode("list")} className="mt-1" /><span>I have the names (the ones pasted above)</span></label>
            <label className="flex items-start gap-2"><input type="radio" name="share-mode" checked={mode === "register"} onChange={() => setMode("register")} className="mt-1" /><span>Let people add their own names, then I release the certificates (up to {FREE_BATCH})</span></label>
          </fieldset>
          <label className="block text-sm font-medium text-fg/80">
            Event code (optional)
            <input value={code} onChange={(e) => setCode(e.target.value)} className={field} placeholder="e.g. a word you say at the event" maxLength={40} />
          </label>
          <label className="block text-sm font-medium text-fg/80">
            Link works for
            <select value={days} onChange={(e) => setDays(Number(e.target.value))} className={field}>
              <option value={30}>30 days</option>
              <option value={90}>90 days</option>
              <option value={365}>1 year</option>
            </select>
          </label>
          <button type="button" onClick={create} disabled={busy || (mode === "list" && names.length === 0)} className={`${smallButton} h-11 w-full bg-brand-600 text-white ring-brand-300/60 hover:bg-brand-500 disabled:opacity-50`}>
            {mode === "register" ? (busy ? "Making the link…" : "Make a sign-up link") : names.length === 0 ? "Add names first" : busy ? "Making the link…" : `Make a link for ${names.length} ${names.length === 1 ? "person" : "people"}`}
          </button>
          <p className="text-xs text-fg/45">The names are kept on our server so people can find themselves. You can delete the link any time.</p>
          {error && <p className="text-sm text-amber-300" role="alert">{error}</p>}
          {link && (
            <div className="rounded-lg bg-fg/5 p-3">
              <p className="break-all text-sm text-fg">{link}</p>
              <div className="mt-2 flex gap-2">
                <button type="button" onClick={() => copy(link)} className={smallButton}>{copied ? "Copied" : "Copy link"}</button>
                <a href={`https://wa.me/?text=${encodeURIComponent(`Get your certificate here: ${link}${code ? ` (event code: ${code})` : ""}`)}`} target="_blank" rel="noreferrer" className={smallButton}>
                  Share on WhatsApp
                </a>
              </div>
              <div className="mt-3"><QrCode url={link} label="get your certificate" /></div>
            </div>
          )}
          {events.length > 0 && (
            <ul className="space-y-2 border-t border-fg/10 pt-3">
              <li className="text-sm font-medium text-fg/80">Your shared links</li>
              {events.map((ev) => (
                <li key={ev.id} className="flex flex-wrap items-center justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate text-fg/70">
                    {ev.title} · {ev.cert_recipients[0]?.count ?? 0} people{ev.mode === "register" ? (ev.released ? " · released" : " · collecting names") : ""} · until {new Date(ev.expires_at).toLocaleDateString("en-GB")}
                  </span>
                  <span className="flex shrink-0 gap-2">
                    <button type="button" onClick={() => copy(claimUrl(ev.slug))} className={smallButton}>Copy</button>
                    <button type="button" onClick={() => setQrFor(qrFor === ev.id ? "" : ev.id)} className={smallButton}>QR</button>
                    {ev.mode === "register" && (
                      <button type="button" onClick={async () => { if (await setReleased(ev.id, !ev.released)) refresh(); }} className={smallButton}>
                        {ev.released ? "Reopen" : "Release"}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={async () => {
                        if (window.confirm(`Delete "${ev.title}"? Its link will stop working.`) && (await deleteSharedEvent(ev.id))) refresh();
                      }}
                      className={smallButton}
                    >
                      Delete
                    </button>
                  </span>
                  {qrFor === ev.id && <div className="basis-full pt-2"><QrCode url={claimUrl(ev.slug)} label={ev.title} /></div>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}

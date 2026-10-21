"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { claimCertificate, eventInfo, type ClaimResult } from "@/lib/cert-share";
import { buildCombinedPdf, previewCertificate } from "@/lib/certificates";
import { fileNameFor } from "@/lib/certificate-names";
import { saveFile } from "@/lib/save-file";
import type { PreviewPage } from "@/lib/sign-pdf";

const input = "mt-1.5 block h-12 w-full rounded-md bg-fg/5 px-4 text-[15px] text-fg ring-1 ring-fg/15 placeholder:text-fg/35 focus:outline-none focus:ring-2 focus:ring-brand-400";
const button =
  "inline-flex h-12 w-full items-center justify-center rounded-md bg-brand-600 px-5 text-[15px] font-medium text-white ring-1 ring-brand-300/60 hover:bg-brand-500 disabled:opacity-50";

/** What to tell a person for each answer that is not a certificate. */
const MESSAGES: Record<Exclude<ClaimResult["status"], "ok">, string> = {
  none: "We could not find that name. Check the spelling, or type your full name as the organiser wrote it.",
  many: "More than one person matches. Please type your full name.",
  code: "That event code is not right. Ask the organiser for it.",
  busy: "Too many tries just now. Please wait a minute and try again.",
  gone: "This link has expired or was removed. Ask the organiser for a new one.",
};

/**
 * The page a person opens from the organiser's one shared link: they type their own name (and the
 * event code, if there is one) and get only their own certificate. The list of names is never sent
 * to the browser, and the certificate is drawn here on the person's own device.
 */
export function ClaimCertificate() {
  const slug = useSearchParams().get("e") ?? "";
  // undefined while loading, null when the link is no good
  const [info, setInfo] = useState<{ title: string; needsCode: boolean } | null | undefined>(undefined);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [found, setFound] = useState<{ name: string; settings: Extract<ClaimResult, { status: "ok" }>["settings"]; preview: PreviewPage } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (slug ? eventInfo(slug) : Promise.resolve(null)).then((result) => {
      if (!cancelled) setInfo(result);
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setFound(null);
    setBusy(true);
    try {
      const result = await claimCertificate(slug, name, code);
      if (result.status !== "ok") {
        setMessage(MESSAGES[result.status]);
        return;
      }
      setFound({ name: result.name, settings: result.settings, preview: await previewCertificate(result.settings, result.name) });
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function download() {
    if (!found) return;
    saveFile(await buildCombinedPdf(found.settings, [found.name]), `${fileNameFor(found.name, new Set())}.pdf`, "application/pdf");
  }

  if (info === undefined) return <p className="text-center text-fg/60">Loading…</p>;
  if (info === null) return <p className="text-center text-fg/70">{MESSAGES.gone}</p>;

  return (
    <div className="mx-auto max-w-xl">
      <p className="text-center text-sm text-fg/60">{info.title}</p>
      <form onSubmit={submit} className="mt-4 space-y-4 rounded-xl border border-fg/10 bg-fg/[0.03] p-5 sm:p-6">
        <label className="block text-sm font-medium text-fg/80">
          Your full name
          <input value={name} onChange={(e) => setName(e.target.value)} className={input} placeholder="e.g. Akosua Mensah" autoComplete="name" required />
        </label>
        {info.needsCode && (
          <label className="block text-sm font-medium text-fg/80">
            Event code (from the organiser)
            <input value={code} onChange={(e) => setCode(e.target.value)} className={input} autoComplete="off" required />
          </label>
        )}
        <button type="submit" disabled={busy} className={button}>
          {busy ? "Finding…" : "Get my certificate"}
        </button>
        {message && <p className="text-sm text-amber-300" role="alert">{message}</p>}
      </form>

      {found && (
        <div className="mt-6 space-y-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- a locally made picture */}
          <img src={found.preview.src} alt={`Certificate for ${found.name}`} className="block h-auto w-full rounded-md bg-white" />
          <button type="button" onClick={download} className={button}>
            Download my certificate (PDF)
          </button>
        </div>
      )}
    </div>
  );
}

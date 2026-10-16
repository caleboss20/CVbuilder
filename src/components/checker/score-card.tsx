"use client";

import { useEffect, useState } from "react";
import type { CvReport } from "@/lib/cv-check";
import { drawScoreCard } from "@/lib/score-card";
import { siteConfig } from "@/lib/site";

/**
 * "Share my score": builds a picture of the score in the browser, shows it, and offers
 * Share (the phone's share sheet, which includes WhatsApp), Download, or a plain
 * WhatsApp message. The picture carries no name or CV text.
 */
export function ScoreCard({ report }: { report: CvReport }) {
  const [blob, setBlob] = useState<Blob | null>(null);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Free the preview image when it is replaced or the page closes
  useEffect(() => () => (url ? URL.revokeObjectURL(url) : undefined), [url]);

  const host = new URL(siteConfig.url).host;
  const text = `My CV scored ${report.score}/100 on CV11 (${report.band.label}). Check yours free: ${siteConfig.url}/cv-checker`;

  async function make() {
    setBusy(true);
    setError("");
    try {
      const made = await drawScoreCard(report, host);
      setBlob(made);
      setUrl(URL.createObjectURL(made));
    } catch {
      setError("We could not make the picture on this device. You can still share the text below.");
    } finally {
      setBusy(false);
    }
  }

  async function share() {
    if (!blob) return;
    const file = new File([blob], "my-cv-score.png", { type: "image/png" });
    // The share sheet only accepts files on devices that support it (most phones)
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], text });
        return;
      } catch {
        // Cancelled or refused: fall through to a download so the student still gets the picture
      }
    }
    download();
  }

  function download() {
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = "my-cv-score.png";
    a.click();
  }

  return (
    <div className="rounded-2xl border border-fg/10 bg-fg/[0.03] p-5 sm:p-6">
      <p className="font-medium text-fg">Share your score</p>
      <p className="mt-1 text-sm text-fg/60">Make a picture of your score for WhatsApp or your status. It shows no name and no CV details.</p>

      {!url ? (
        <button
          type="button"
          onClick={make}
          disabled={busy}
          className="mt-4 rounded-md px-5 py-2.5 text-sm font-medium text-fg ring-1 ring-fg/20 hover:bg-fg/5 disabled:opacity-50"
        >
          {busy ? "Making it…" : "Make my score card"}
        </button>
      ) : (
        <div className="mt-4 flex flex-col items-start gap-4 sm:flex-row">
          {/* eslint-disable-next-line @next/next/no-img-element -- a temporary in-memory picture, not a site asset */}
          <img src={url} alt={`Score card: ${report.score} out of 100`} className="w-44 rounded-lg ring-1 ring-fg/15" />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={share}
              className="rounded-md bg-brand-600 px-4 py-2.5 text-sm font-medium text-white ring-1 ring-brand-300/60 shadow-[0_0_18px_rgb(124_128_255/0.45)] hover:bg-brand-500"
            >
              Share
            </button>
            <button type="button" onClick={download} className="rounded-md px-4 py-2.5 text-sm font-medium text-fg ring-1 ring-fg/20 hover:bg-fg/5">
              Download
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(text)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md px-4 py-2.5 text-sm font-medium text-fg ring-1 ring-fg/20 hover:bg-fg/5"
            >
              WhatsApp text
            </a>
          </div>
        </div>
      )}
      {error && <p className="mt-3 text-sm text-amber-300">{error}</p>}
    </div>
  );
}

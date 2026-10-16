"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BUILDER_STORAGE_KEY, blankCv, toDoc } from "@/lib/builder";
import { analyseCv, hasEnoughText, type Check, type CvReport } from "@/lib/cv-check";
import { cvToText } from "@/lib/cv-text";
import { industries, OTHER_INDUSTRY } from "@/lib/industries";
import { CHECKER_HANDOFF_KEY } from "@/lib/cv-import";
import { CvFileError, readCvFile } from "@/lib/read-cv-file";
import { CheckIcon } from "@/components/ui/check-icon";
import { ScoreCard } from "./score-card";

/*
 * CV checker page. Everything happens in the browser: the file is read here, scored
 * by analyseCv() and shown. Nothing is uploaded, so there is no account, no wait and
 * no cost, and a student's CV never leaves their phone.
 */

type Source = "upload" | "paste" | "builder";

/** What the student sees in the text field while we hold their CV as plain text. */
const FIELD =
  "w-full rounded-lg border border-fg/12 bg-ink-950/60 px-3.5 py-3 text-sm leading-relaxed text-fg placeholder:text-fg/35 focus:border-brand-400/70 focus:outline-none";

export function CvChecker() {
  const router = useRouter();
  const [source, setSource] = useState<Source>("upload");
  const [cvText, setCvText] = useState("");
  const [fileName, setFileName] = useState("");
  const [advert, setAdvert] = useState("");
  const [industryId, setIndustryId] = useState("");
  const [otherIndustry, setOtherIndustry] = useState("");
  const [cvType, setCvType] = useState<"standard" | "academic">("standard");
  const [report, setReport] = useState<CvReport | null>(null);
  const [error, setError] = useState("");
  const [reading, setReading] = useState(false);
  /** The CV saved by the builder, as text, if there is one worth checking. */
  const [builderText, setBuilderText] = useState("");
  const resultsRef = useRef<HTMLDivElement>(null);

  // Offer the builder CV when this device has one with some content
  useEffect(() => {
    try {
      const raw = localStorage.getItem(BUILDER_STORAGE_KEY);
      if (!raw) return;
      const saved = { ...blankCv(), ...JSON.parse(raw) };
      const text = cvToText(toDoc(saved), saved.role);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read from storage after mount
      if (text.split(/\s+/).length > 40) setBuilderText(text);
    } catch {
      // Blocked or corrupt storage: the builder option just stays hidden
    }
  }, []);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError("");
    setReport(null);
    setReading(true);
    try {
      const text = await readCvFile(file);
      if (!hasEnoughText(text)) {
        throw new CvFileError("We could not find enough text in that file. If it is a scan or a picture, paste your CV text instead.");
      }
      setCvText(text);
      setFileName(file.name);
    } catch (e) {
      setCvText("");
      setFileName("");
      setError(e instanceof CvFileError ? e.message : "Something went wrong reading that file. Try pasting your CV text instead.");
    } finally {
      setReading(false);
    }
  }

  function chooseSource(next: Source) {
    setSource(next);
    setError("");
    setReport(null);
    if (next === "builder") setCvText(builderText);
    else if (source === "builder") setCvText(""); // do not carry the builder text into paste or upload
  }

  function check() {
    if (!hasEnoughText(cvText)) {
      setError("Add your CV first: upload a file, paste the text, or use the CV from the builder.");
      return;
    }
    setError("");
    setReport(analyseCv({ cvText, advert, industryId, otherIndustry, cvType }));
    // On phones the results are below the form, so bring them into view
    requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  /** Hands this CV to the builder, which imports it so the student can fix it with live advice. */
  function improve() {
    try {
      sessionStorage.setItem(CHECKER_HANDOFF_KEY, cvText);
    } catch {
      // Blocked storage: the builder just opens without the CV, and they can upload it there
    }
    router.push("/builder?fromChecker=1");
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-10">
      {/* ---------------- Inputs ---------------- */}
      <section aria-label="Your CV and the job" className="min-w-0 space-y-6">
        <div>
          <p className="mb-2 text-sm font-medium text-fg">1. Your CV</p>
          <div role="tablist" aria-label="How to add your CV" className="flex gap-1 rounded-lg bg-fg/5 p-1">
            {(
              [
                ["upload", "Upload a file"],
                ["paste", "Paste text"],
                ...(builderText ? ([["builder", "From my builder CV"]] as const) : []),
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={source === id}
                onClick={() => chooseSource(id)}
                className={`flex-1 whitespace-nowrap rounded-md px-2 py-1.5 text-sm transition-colors ${
                  source === id ? "bg-fg/10 text-fg ring-1 ring-fg/15" : "text-fg/55 hover:text-fg"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mt-3">
            {source === "upload" && (
              <label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-fg/25 bg-fg/[0.03] px-4 py-8 text-center transition-colors hover:border-brand-400/60">
                <span className="text-sm font-medium text-fg">{reading ? "Reading your file…" : fileName || "Choose a PDF or Word file"}</span>
                <span className="text-xs text-fg/50">
                  {fileName
                    ? "Tap to choose a different file"
                    : "PDF or .docx, up to 8 MB. It stays on your device. One-column CVs are read most accurately."}
                </span>
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  className="sr-only"
                  onChange={(e) => {
                    void onFile(e.target.files?.[0]);
                    e.target.value = ""; // lets the same file be chosen again
                  }}
                />
              </label>
            )}

            {source === "paste" && (
              <>
                <label htmlFor="cv-paste" className="sr-only">
                  Paste your CV text
                </label>
                <textarea
                  id="cv-paste"
                  rows={10}
                  value={cvText}
                  onChange={(e) => {
                    setCvText(e.target.value);
                    setReport(null);
                  }}
                  placeholder="Paste the text of your CV here, including your name, contact details, experience and education."
                  className={FIELD}
                />
              </>
            )}

            {source === "builder" && (
              <p className="rounded-lg border border-fg/10 bg-fg/[0.03] p-4 text-sm text-fg/70">
                We’ll check the CV saved in the builder on this device.{" "}
                <Link href="/builder" className="font-medium text-brand-300 hover:text-fg">
                  Open the builder
                </Link>{" "}
                to change it.
              </p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="job-advert" className="mb-2 block text-sm font-medium text-fg">
            2. The job you want <span className="font-normal text-fg/50">(recommended)</span>
          </label>
          <textarea
            id="job-advert"
            rows={6}
            value={advert}
            onChange={(e) => {
              setAdvert(e.target.value);
              setReport(null);
            }}
            placeholder="Paste the job advert or description. We compare it with your CV to see which keywords you are missing."
            className={FIELD}
          />
        </div>

        <div>
          <label htmlFor="industry" className="mb-2 block text-sm font-medium text-fg">
            3. Your industry <span className="font-normal text-fg/50">(optional)</span>
          </label>
          <select
            id="industry"
            value={industryId}
            onChange={(e) => {
              setIndustryId(e.target.value);
              setReport(null);
            }}
            className={`${FIELD} appearance-none`}
          >
            <option value="">Not sure / skip</option>
            {industries.map((i) => (
              <option key={i.id} value={i.id}>
                {i.label}
              </option>
            ))}
            <option value={OTHER_INDUSTRY}>Other (type your own)</option>
          </select>
          {industryId === OTHER_INDUSTRY && (
            <>
              <label htmlFor="industry-other" className="sr-only">
                Your industry
              </label>
              <input
                id="industry-other"
                value={otherIndustry}
                onChange={(e) => {
                  setOtherIndustry(e.target.value);
                  setReport(null);
                }}
                placeholder="e.g. Telecoms, sales and installation"
                className={`${FIELD} mt-2`}
              />
              <p className="mt-1.5 text-xs text-fg/50">We look for the words you type in your CV, so use the terms your field uses.</p>
            </>
          )}
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-fg">4. Type of CV</p>
          <div role="radiogroup" aria-label="Type of CV" className="grid grid-cols-2 gap-2">
            {(
              [
                ["standard", "Standard", "1 to 2 pages. Jobs, internships, national service."],
                ["academic", "Academic or research", "Longer, with publications. Grants, MPhil, lecturing."],
              ] as const
            ).map(([id, label, hint]) => (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={cvType === id}
                onClick={() => {
                  setCvType(id);
                  setReport(null);
                }}
                className={`rounded-lg border p-3 text-left transition-colors ${
                  cvType === id ? "border-brand-400/70 bg-brand-500/15" : "border-fg/12 bg-fg/[0.03] hover:border-fg/25"
                }`}
              >
                <span className="block text-sm font-medium text-fg">{label}</span>
                <span className="mt-0.5 block text-xs text-fg/55">{hint}</span>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p role="alert" className="rounded-lg border border-red-400/30 bg-red-400/10 p-3 text-sm text-fg/85">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={check}
          disabled={reading}
          className="w-full rounded-md bg-brand-600 py-3 text-[15px] font-medium text-white ring-1 ring-brand-300/60 shadow-[0_0_22px_rgb(124_128_255/0.5)] transition-colors hover:bg-brand-500 disabled:opacity-50"
        >
          Check my CV
        </button>
        <p className="text-center text-xs text-fg/45">Free. No sign-up. Your CV is read in your browser and never uploaded.</p>
      </section>

      {/* ---------------- Results ---------------- */}
      <section ref={resultsRef} aria-label="Your CV score" aria-live="polite" className="min-w-0 scroll-mt-24">
        {report ? <ReportView report={report} onImprove={source === "builder" ? undefined : improve} /> : <EmptyState />}
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function EmptyState() {
  const items = [
    "A score out of 100 for how strong your CV is",
    "How well it matches the job and your industry",
    "Your weakest bullet points, quoted back to you",
    "Clear, practical fixes in order of importance",
  ];
  return (
    <div className="rounded-2xl border border-fg/10 bg-fg/[0.03] p-6 sm:p-8">
      <h2 className="text-lg font-medium text-fg">What you’ll get</h2>
      <ul className="mt-4 space-y-3">
        {items.map((t) => (
          <li key={t} className="flex items-start gap-3 text-sm text-fg/70">
            <CheckIcon size={18} />
            {t}
          </li>
        ))}
      </ul>
      <p className="mt-6 text-sm text-fg/50">
        Add your CV and the job you want on the left, then press <span className="text-fg/80">Check my CV</span>.
      </p>
    </div>
  );
}

const TONE = {
  strong: { ring: "stroke-emerald-400", text: "text-emerald-300" },
  good: { ring: "stroke-brand-400", text: "text-brand-300" },
  weak: { ring: "stroke-amber-400", text: "text-amber-300" },
} as const;

function ReportView({ report, onImprove }: { report: CvReport; onImprove?: () => void }) {
  const tone = TONE[report.band.tone];
  const fixes = report.checks.filter((c) => c.status !== "good");
  const good = report.checks.filter((c) => c.status === "good");

  return (
    <div className="space-y-6">
      {/* Score */}
      <div className="flex items-center gap-5 rounded-2xl border border-fg/10 bg-fg/[0.03] p-5 sm:gap-7 sm:p-7">
        <ScoreRing score={report.score} ringClass={tone.ring} />
        <div className="min-w-0">
          <p className={`text-xl font-medium ${tone.text}`}>{report.band.label}</p>
          <p className="mt-1 text-sm text-fg/60">
            {report.stats.words} words, {report.stats.bullets} bullet points
            {report.stats.bullets > 0 && `, ${report.stats.bulletsWithNumbers} with numbers`}.
          </p>
        </div>
      </div>

      {/* Areas */}
      <ul className="space-y-3 rounded-2xl border border-fg/10 bg-fg/[0.03] p-5 sm:p-6">
        {report.areas.map((a) => (
          <li key={a.area}>
            <div className="flex items-center justify-between text-sm">
              <span className="text-fg/80">{a.area}</span>
              <span className="font-medium tabular-nums text-fg">{a.percent}%</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-fg/10">
              <div
                className={`h-full rounded-full ${a.percent >= 80 ? "bg-emerald-400" : a.percent >= 50 ? "bg-brand-400" : "bg-amber-400"}`}
                style={{ width: `${a.percent}%` }}
              />
            </div>
          </li>
        ))}
      </ul>

      {report.notes.map((n) => (
        <p key={n} className="rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-fg/80">
          {n}
        </p>
      ))}

      {/* What to fix */}
      {fixes.length > 0 && (
        <div>
          <h2 className="text-lg font-medium text-fg">What to improve</h2>
          <ul className="mt-3 space-y-3">
            {fixes.map((c) => (
              <CheckCard key={c.id} check={c} />
            ))}
          </ul>
        </div>
      )}

      {/* What works */}
      {good.length > 0 && (
        <div>
          <h2 className="text-lg font-medium text-fg">What’s working</h2>
          <ul className="mt-3 space-y-2.5">
            {good.map((c) => (
              <li key={c.id} className="flex items-start gap-3 rounded-lg border border-fg/10 bg-fg/[0.03] p-3.5 text-sm">
                <span className="mt-0.5 shrink-0">
                  <CheckIcon size={18} />
                </span>
                <span>
                  <span className="font-medium text-fg">{c.label}.</span> <span className="text-fg/65">{c.advice}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* keyed by score: a new score remounts the card, so an old picture is never shown */}
      <ScoreCard key={report.score} report={report} />

      <div className="rounded-2xl border border-brand-400/30 bg-brand-500/[0.08] p-5 sm:p-6">
        <p className="font-medium text-fg">Ready to fix it?</p>
        <p className="mt-1 text-sm text-fg/65">
          Rebuild your CV in a clean, recruiter-friendly template, then check it again to watch the score go up.
        </p>
        {/* From an upload or pasted text we carry the CV across; from the builder it is already there */}
        {onImprove ? (
          <button
            type="button"
            onClick={onImprove}
            className="mt-4 inline-flex rounded-md bg-brand-600 px-5 py-2.5 text-sm font-medium text-white ring-1 ring-brand-300/60 shadow-[0_0_18px_rgb(124_128_255/0.45)] hover:bg-brand-500"
          >
            Fix it in the builder
          </button>
        ) : (
          <Link
            href="/builder"
            className="mt-4 inline-flex rounded-md bg-brand-600 px-5 py-2.5 text-sm font-medium text-white ring-1 ring-brand-300/60 shadow-[0_0_18px_rgb(124_128_255/0.45)] hover:bg-brand-500"
          >
            Improve it in the builder
          </Link>
        )}
      </div>
    </div>
  );
}

/** Circular score, drawn as an SVG ring: the coloured arc is `score` percent of the circle. */
function ScoreRing({ score, ringClass }: { score: number; ringClass: string }) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="relative size-28 shrink-0 sm:size-32">
      <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden="true">
        <circle cx="50" cy="50" r={radius} fill="none" strokeWidth="8" className="stroke-fg/10" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          className={`${ringClass} transition-all duration-700`}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - score / 100)}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <p className="text-3xl font-semibold tabular-nums text-fg" aria-label={`Score ${score} out of 100`}>
          {score}
          <span className="text-sm font-normal text-fg/45">/100</span>
        </p>
      </div>
    </div>
  );
}

/** One thing to improve: what is wrong, how to fix it, and the exact examples from the CV. */
function CheckCard({ check }: { check: Check }) {
  const isWords = check.id === "keywords" || check.id === "industry";
  return (
    <li className="rounded-xl border border-fg/10 bg-fg/[0.03] p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-fg/45">{check.area}</p>
          <p className="mt-0.5 font-medium text-fg">{check.label}</p>
        </div>
        <span
          className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-medium tabular-nums ${
            check.status === "fix" ? "bg-amber-400/15 text-amber-300" : "bg-brand-500/15 text-brand-300"
          }`}
        >
          {check.points} / {check.max}
        </span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-fg/70">{check.advice}</p>

      {check.examples && check.examples.length > 0 &&
        (isWords ? (
          <ul className="mt-3 flex flex-wrap gap-2">
            {check.examples.map((w) => (
              <li key={w} className="rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-sm text-fg">
                {w}
              </li>
            ))}
          </ul>
        ) : (
          <ul className="mt-3 space-y-2">
            {check.examples.map((e) => (
              <li key={e} className="border-l-2 border-fg/20 pl-3 text-sm italic text-fg/60">
                “{e}”
              </li>
            ))}
          </ul>
        ))}
    </li>
  );
}

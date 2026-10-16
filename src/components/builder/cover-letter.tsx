"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BUILDER_STORAGE_KEY, blankCv, type BuilderCv } from "@/lib/builder";
import { draftLetter, kindConfig, letterKinds, type LetterInput } from "@/lib/cover-letter";
import { CvPageFrame } from "@/components/cv/cv-page-frame";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SparkleIcon } from "@/components/ui/sparkle-icon";
import { Field } from "./fields";
import { VoiceInput } from "./voice-input";

const LETTER_KEY = "cv11-letter-v1";

/**
 * Print rules for the letter. An off-screen full-size copy (#letter-print) is the
 * only thing the printer sees.
 *
 * We hide everything else with `visibility` rather than "display: none on the
 * body's other children". That older approach turns the PDF blank whenever the
 * copy is not a direct child of <body> (framework wrappers, some mobile print
 * engines), because hiding an ancestor hides the copy too. The visible UI is also
 * hidden with Tailwind's `print:hidden` so it takes up no space on the page.
 */
const printCss = `
#letter-print { position: fixed; left: -10000px; top: 0; visibility: hidden; pointer-events: none; }
@media print {
  @page { size: A4; margin: 0; }
  html, body { background: #fff !important; margin: 0 !important; padding: 0 !important; }
  body * { visibility: hidden !important; }
  #letter-print, #letter-print * { visibility: visible !important; }
  #letter-print { position: absolute; left: 0; top: 0; width: 794px; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
  #letter-print p { break-inside: avoid; }
}
`;

type Saved = LetterInput & { body: string };

export function CoverLetterBuilder() {
  const [cv, setCv] = useState<BuilderCv | null>(null);
  const [input, setInput] = useState<LetterInput>({ kind: "job", company: "", role: "", manager: "", why: "", results: "", need: "" });
  const [body, setBody] = useState("");
  const [date, setDate] = useState("");

  // Load the CV from the builder, plus any letter already started
  useEffect(() => {
    let loaded: BuilderCv | null = null;
    let letter: Saved | null = null;
    try {
      const raw = localStorage.getItem(BUILDER_STORAGE_KEY);
      if (raw) loaded = { ...blankCv(), ...JSON.parse(raw) };
      const l = localStorage.getItem(LETTER_KEY);
      if (l) letter = JSON.parse(l);
    } catch {}
    /* eslint-disable react-hooks/set-state-in-effect -- one-time hydration from storage */
    setCv(loaded ?? blankCv());
    if (letter) {
      setInput({
        kind: letter.kind,
        company: letter.company,
        role: letter.role,
        manager: letter.manager,
        why: letter.why,
        // Letters saved before these two fields existed simply have none
        results: letter.results ?? "",
        need: letter.need ?? "",
      });
      setBody(letter.body);
    }
    // A link such as /cover-letter?kind=service opens the letter already set to that category
    const asked = new URLSearchParams(window.location.search).get("kind");
    const match = letterKinds.find((k) => k.id === asked);
    if (match) setInput((i) => ({ ...i, kind: match.id }));
    setDate(new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }));
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (!cv) return;
    try {
      localStorage.setItem(LETTER_KEY, JSON.stringify({ ...input, body }));
    } catch {}
  }, [cv, input, body]);

  const cfg = kindConfig(input.kind);
  const set = (patch: Partial<LetterInput>) => setInput((i) => ({ ...i, ...patch }));
  const hasCv = !!cv && (cv.name.trim() || cv.experience.some((j) => j.title.trim()));

  function write() {
    if (!cv) return;
    setBody(draftLetter(cv, input).join("\n\n"));
  }

  function download() {
    const prev = document.title;
    document.title = `${(cv?.name || "My").trim().replace(/\s+/g, "_")}_Letter`;
    window.print();
    document.title = prev;
  }

  if (!cv) return <div className="grid min-h-screen place-items-center text-sm text-fg/50">Loading…</div>;

  return (
    <>
      <div className="min-h-screen print:hidden">
        <header className="sticky top-0 z-30 border-b border-fg/10 bg-ink-950/90 backdrop-blur-xl">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <Logo />
            <span className="hidden text-sm text-fg/50 sm:inline">Cover letter</span>
            <div className="ml-auto flex items-center gap-2">
              <ThemeToggle className="hidden sm:grid" />
              <Link href="/builder" className="rounded-md px-3 py-2 text-sm text-fg/70 ring-1 ring-fg/15 hover:text-fg">
                ← My CV
              </Link>
              <button
                type="button"
                onClick={download}
                disabled={!body.trim()}
                className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white ring-1 ring-brand-300/60 shadow-[0_0_18px_rgb(124_128_255/0.45)] hover:bg-brand-500 disabled:opacity-40"
              >
                <span className="hidden sm:inline">Download </span>PDF
              </button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          <section aria-label="Write your letter" className="min-w-0">
            <div className="mx-auto max-w-2xl space-y-5 px-4 pb-20 pt-8 sm:px-6">
              <div>
                <h1 className="text-2xl font-medium text-fg sm:text-3xl">Your letter</h1>
                <p className="mt-1.5 text-sm text-fg/55">
                  Choose the letter you need and add a few details. We’ll write a first draft from your CV that matches its design, and you can change every word.
                </p>
                {!hasCv && (
                  <p className="mt-3 rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-fg/80">
                    Your CV looks empty. <Link href="/builder" className="font-medium text-brand-300 underline">Fill in your CV first</Link> so the letter can use your experience.
                  </p>
                )}
              </div>

              <div role="radiogroup" aria-label="Which letter do you need?" className="flex flex-wrap gap-2">
                {letterKinds.map((k) => (
                  <button
                    key={k.id}
                    type="button"
                    role="radio"
                    aria-checked={input.kind === k.id}
                    onClick={() => set({ kind: k.id })}
                    className={`rounded-md px-3.5 py-2 text-sm transition-colors ${
                      input.kind === k.id ? "bg-brand-500/15 text-fg ring-1 ring-brand-400/50" : "text-fg/60 ring-1 ring-fg/12 hover:text-fg"
                    }`}
                  >
                    {k.label}
                  </button>
                ))}
              </div>

              {/* Say what the choice does, so nobody has to guess */}
              <p className="-mt-2 text-sm text-fg/55">
                <span className="text-fg/75">What this changes: </span>
                {cfg.changes}
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={cfg.company.label} value={input.company} onChange={(company) => set({ company })} placeholder={cfg.company.placeholder} />
                <Field label={cfg.role.label} value={input.role} onChange={(role) => set({ role })} placeholder={cfg.role.placeholder} />
                <Field
                  label={cfg.manager.label}
                  value={input.manager}
                  onChange={(manager) => set({ manager })}
                  placeholder={cfg.manager.placeholder}
                  hint={cfg.manager.hint}
                />
              </div>

              {cfg.extras?.map((x) => (
                <Field
                  key={x.key}
                  label={x.label}
                  value={input[x.key]}
                  onChange={(v) => set({ [x.key]: v })}
                  placeholder={x.placeholder}
                  hint={x.hint}
                />
              ))}

              <div>
                <p className="mb-1.5 text-sm font-medium text-fg/80">{cfg.why.label}</p>
                {input.why ? (
                  <div className="rounded-lg border border-fg/12 bg-fg/[0.03] p-3 text-sm text-fg/80">
                    {input.why}
                    <button type="button" onClick={() => set({ why: "" })} className="ml-2 text-xs text-brand-300 hover:text-fg">
                      Change
                    </button>
                  </div>
                ) : (
                  <VoiceInput kind="summary" onAdd={([why]) => why && set({ why })} />
                )}
              </div>

              <button
                type="button"
                onClick={write}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-brand-600 py-3 text-[15px] font-medium text-white ring-1 ring-brand-300/60 shadow-[0_0_22px_rgb(124_128_255/0.5)] hover:bg-brand-500"
              >
                <SparkleIcon size={14} />
                {body ? "Write it again" : "Write my cover letter"}
              </button>

              {body && (
                <div>
                  <label htmlFor="letter-body" className="mb-1.5 block text-sm font-medium text-fg/80">
                    Edit your letter
                  </label>
                  <textarea
                    id="letter-body"
                    rows={16}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="w-full resize-y rounded-lg border border-fg/12 bg-fg/[0.03] px-3.5 py-3 text-[15px] leading-relaxed text-fg focus:border-brand-400/70 focus:outline-none"
                  />
                  <p className="mt-1.5 text-xs text-fg/45">Read it out loud once. Make sure every sentence is true and sounds like you.</p>
                </div>
              )}
            </div>
          </section>

          <aside aria-label="Letter preview" className="min-w-0 border-fg/10 bg-fg/[0.025] lg:border-l">
            <div className="sticky top-16 px-4 pb-20 pt-6 sm:px-8">
              <p className="mb-3 text-xs text-fg/45">Live preview · A4 · matches your CV colour</p>
              <div className="mx-auto max-w-[640px] overflow-hidden rounded-md bg-white shadow-[0_20px_60px_-20px_rgb(0_0_0/0.6)] ring-1 ring-fg/10">
                <CvPageFrame>
                  <LetterPage cv={cv} input={input} body={body} date={date} />
                </CvPageFrame>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <div id="letter-print" aria-hidden="true">
        <style>{printCss}</style>
        <div className="flex min-h-[1121px] w-[794px] flex-col bg-white">
          <LetterPage cv={cv} input={input} body={body} date={date} />
        </div>
      </div>
    </>
  );
}

/** The letter itself, styled with the CV's accent colour as a letterhead. */
function LetterPage({ cv, input, body, date }: { cv: BuilderCv; input: LetterInput; body: string; date: string }) {
  const cfg = kindConfig(input.kind);
  const accent = cv.accent ?? "#1e3a5f";
  const contact = useMemo(() => [cv.location, cv.phone, cv.email, ...cv.links].map((s) => s.trim()).filter(Boolean), [cv]);
  const paragraphs = body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const name = cv.name.trim() || "Your Name";

  return (
    <div className="flex-1 bg-white px-16 py-14 text-[14px] leading-[1.75] text-slate-700">
      <header className="border-b-[3px] pb-5" style={{ borderColor: accent }}>
        <p className="text-[30px] font-bold leading-tight" style={{ color: accent }}>
          {name}
        </p>
        {cv.role.trim() && <p className="text-[16px] text-slate-600">{cv.role}</p>}
        {contact.length > 0 && <p className="mt-2 text-[12.5px] text-slate-600">{contact.join("  •  ")}</p>}
      </header>

      <div className="mt-8 space-y-1 text-[13.5px]">
        <p>{date}</p>
        <p className="pt-3 font-semibold text-slate-900">{input.manager.trim() || `The ${cfg.recipient}`}</p>
        <p>{input.company.trim() || cfg.company.label.replace(/ \(optional\)/, "")}</p>
      </div>

      <p className="mt-6 font-semibold text-slate-900">
        RE: {cfg.subject(input.role.trim().toUpperCase())}
      </p>
      <p className="mt-5">Dear {input.manager.trim() || cfg.recipient},</p>

      {paragraphs.length ? (
        <div className="mt-4 space-y-4 text-justify">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      ) : (
        <div className="mt-5 space-y-2.5" aria-hidden="true">
          {[100, 96, 88, 100, 72, 0, 100, 92, 84].map((w, i) =>
            w ? <span key={i} className="block h-2.5 rounded bg-slate-200" style={{ width: `${w}%` }} /> : <span key={i} className="block h-2" />,
          )}
        </div>
      )}

      <p className="mt-8">{input.manager.trim() ? "Yours sincerely," : "Yours faithfully,"}</p>
      <p className="mt-10 font-semibold text-slate-900">{name}</p>
    </div>
  );
}

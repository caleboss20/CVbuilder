"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { cvExamples, type CvTemplateName } from "@/lib/cv-examples";
import { exampleForCourse } from "@/lib/course-match";
import { courseGroups, groupOf } from "@/lib/course-groups";
import { templates } from "@/lib/templates";
import { CvPageFrame } from "@/components/cv/cv-page-frame";
import { CvTemplateView } from "@/components/cv/cv-templates";
import { CvIcon } from "@/components/cv/cv-icon";
import { Logo } from "@/components/ui/logo";
import { SparkleIcon } from "@/components/ui/sparkle-icon";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import type { ImportResult } from "@/lib/cv-import";
import { ImportCard } from "./import-card";
import { PortalGlow } from "./portal-glow";
import { SkyBackground } from "./sky-background";

const perks = [
  { label: "No account needed", d: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M4 21a8 8 0 0 1 16 0" },
  { label: "Saved on your device", d: "M5 12l5 5L20 7" },
  { label: "Free PDF, no watermark", d: "M7 3h7l5 5v13H7zM14 3v5h5" },
];

type StartMode = "template" | "blank" | "upload";

/** The three ways to start. Short, concrete and equal, so the choice takes a second. */
const startOptions: { id: StartMode; title: string; hint: string; icon: string }[] = [
  { id: "template", title: "Use a template", hint: "Pick your course. We fill it with examples.", icon: "M4 4h16v16H4zM4 9h16M9 9v11" },
  { id: "blank", title: "Start blank", hint: "A clean page with every section ready.", icon: "M12 5v14M5 12h14" },
  { id: "upload", title: "Upload my CV", hint: "Already have one? We fill the builder for you.", icon: "M12 16V4m0 0-4 4m4-4 4 4M4 16v4h16v-4" },
];

/** First screen of the builder: start from a course example (with live preview) or blank. */
export function StartScreen({
  template,
  onBlank,
  onExample,
  onCancel,
  onImport,
  highlightImport,
}: {
  /** Template picked on the homepage ("Use this template"), if any. */
  template?: CvTemplateName | null;
  onBlank: () => void;
  /** `courseName` is set when the student typed a course we have no example for. */
  onExample: (slug: string, courseName?: string) => void;
  /** Set when reopened from the editor: lets the student go back without changing anything. */
  onCancel?: () => void;
  /** Called with a CV imported from an uploaded file. */
  onImport: (result: ImportResult) => void;
  /** True when the student came from an "Import my CV" button. */
  highlightImport?: boolean;
}) {
  /** Which of the three ways to start is open. The "Import my CV" button opens upload directly. */
  const [mode, setMode] = useState<StartMode>(highlightImport ? "upload" : "template");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(cvExamples[0].slug);

  /** The field chip that is open, or "all". Typing in the search box searches every field. */
  const [group, setGroup] = useState("all");
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q) return cvExamples.filter((e) => e.course.toLowerCase().includes(q));
    return group === "all" ? cvExamples : cvExamples.filter((e) => groupOf(e.slug) === group);
  }, [query, group]);
  // A course typed in the search box that we have no example for. We borrow the
  // closest field's example and relabel it, so nobody has to start from nothing.
  const [custom, setCustom] = useState<string | null>(null);
  const typed = query.trim();
  // Only offered when nothing in the list matches what they typed
  const canUseTyped = typed.length >= 2 && shown.length === 0;
  const example = custom ? exampleForCourse(custom) : (cvExamples.find((e) => e.slug === selected) ?? cvExamples[0]);
  // Preview the course in the template the student already chose, if they chose one
  const activeTemplate = template ?? example.template;
  const templateName = templates.find((t) => t.id === activeTemplate)?.name;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <SkyBackground />
      {/* Same atmosphere as the homepage hero */}
      <div aria-hidden="true" className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,black,transparent)]" />
      <PortalGlow />

      <header className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-6 lg:px-8">
        <Logo />
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {onCancel ? (
            <button type="button" onClick={onCancel} className="text-sm text-fg/70 hover:text-fg">
              ← Back to my CV
            </button>
          ) : (
            <Link href="/" className="hidden text-sm text-fg/60 hover:text-fg sm:inline">
              ← Back to home
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 sm:pt-10 lg:px-8">
        <div className="cv11-rise mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-1.5 rounded-full border border-fg/10 bg-fg/[0.04] px-3 py-1 text-xs text-fg/70">
            <SparkleIcon className="text-brand-300" />
            Free CV builder for students
          </p>
          <h1 className="mt-5 text-4xl font-medium tracking-tight text-balance sm:text-5xl lg:text-6xl">
            <span className="bg-linear-to-b from-fg to-fg/60 bg-clip-text text-transparent">Let’s build your CV</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-fg/60 sm:text-lg">
            Choose how you want to start. Whichever you pick, you’ll be done in minutes.
          </p>
          <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {perks.map((p) => (
              <li key={p.label} className="inline-flex items-center gap-2 text-sm text-fg/65">
                <span className="grid size-6 place-items-center rounded-full bg-brand-500/15 text-brand-300 ring-1 ring-brand-400/30">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d={p.d} />
                  </svg>
                </span>
                {p.label}
              </li>
            ))}
          </ul>
        </div>

        <div
          className={`mt-10 grid gap-6 lg:mt-14 lg:gap-10 ${
            mode === "template" ? "lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]" : "mx-auto max-w-2xl"
          }`}
        >
          <div className="min-w-0 space-y-5">
            {/* Three clear choices, so nobody has to work out what to do */}
            <div role="radiogroup" aria-label="How do you want to start?" className="grid gap-3 sm:grid-cols-3">
              {startOptions.map((o) => {
                const active = mode === o.id;
                return (
                  <button
                    key={o.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setMode(o.id)}
                    className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all sm:flex-col sm:gap-2.5 ${
                      active
                        ? "border-brand-400/70 bg-brand-500/15 shadow-[0_0_30px_-10px_rgb(124_128_255/0.8)]"
                        : "border-fg/10 bg-fg/[0.03] hover:border-fg/25"
                    }`}
                  >
                    <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${active ? "bg-brand-500/25 text-brand-300" : "bg-fg/10 text-fg/70"}`}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d={o.icon} />
                      </svg>
                    </span>
                    <span className="min-w-0">
                      <span className="block font-medium text-fg">{o.title}</span>
                      <span className="mt-0.5 block text-sm text-fg/55">{o.hint}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            {mode === "template" && (
            <section
              aria-labelledby="from-course"
              className="relative overflow-hidden rounded-2xl border border-brand-400/30 bg-linear-to-b from-brand-600/20 via-ink-900/60 to-ink-900/40 p-5 shadow-[0_0_60px_-25px_rgb(124_128_255/0.6)] sm:p-7"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 id="from-course" className="text-lg font-medium text-fg sm:text-xl">
                  Pick your course
                </h2>
              </div>
              <p className="mt-1.5 text-sm text-fg/60">Pick your course and check the preview. Examples show in grey as you fill in your own details.</p>

              <label htmlFor="course-search" className="sr-only">
                Search courses
              </label>
              <div className="relative mt-5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-fg/40" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3.5-3.5" />
                </svg>
                <input
                  id="course-search"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setCustom(null);
                  }}
                  placeholder="Search your course, e.g. Nursing"
                  className="w-full rounded-lg border border-fg/12 bg-ink-950/60 py-2.5 pl-10 pr-3 text-[15px] text-fg placeholder:text-fg/35 focus:border-brand-400/70 focus:outline-none"
                />
              </div>

              {/* Fields: one tap narrows 28 courses to the few that matter. Searching ignores them. */}
              <div role="group" aria-label="Filter courses by field" className="mt-3 flex flex-wrap gap-1.5">
                {[{ id: "all", label: "All" }, ...courseGroups].map((g) => {
                  const active = !query.trim() && group === g.id;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => {
                        setGroup(g.id);
                        setQuery("");
                        setCustom(null);
                      }}
                      className={`rounded-full px-3 py-2 text-xs transition-colors sm:py-1 ${
                        active ? "bg-brand-500/25 text-fg ring-1 ring-brand-400/60" : "bg-fg/[0.06] text-fg/60 hover:text-fg"
                      }`}
                    >
                      {g.label}
                    </button>
                  );
                })}
              </div>

              {canUseTyped && (
                <button
                  type="button"
                  onClick={() => setCustom(typed)}
                  aria-pressed={custom !== null}
                  className={`mt-3 flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-all ${
                    custom !== null
                      ? "border-brand-400/70 bg-brand-500/15 text-fg"
                      : "border-dashed border-brand-400/50 bg-brand-500/[0.07] text-fg/85 hover:border-brand-400/80"
                  }`}
                >
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-500/20 text-brand-300" aria-hidden="true">
                    +
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-medium">Use “{typed}”</span>
                    <span className="block text-xs text-fg/55">Not on our list yet? We’ll build you a sample CV for it.</span>
                  </span>
                </button>
              )}

              <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {shown.map((e) => {
                  const active = custom === null && e.slug === selected;
                  return (
                    <li key={e.slug}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelected(e.slug);
                          setCustom(null);
                        }}
                        aria-pressed={active}
                        className={`flex w-full items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-sm transition-all ${
                          active
                            ? "border-brand-400/70 bg-brand-500/15 text-fg shadow-[0_0_18px_-6px_rgb(124_128_255/0.8)]"
                            : "border-fg/10 bg-fg/[0.03] text-fg/75 hover:border-brand-400/40 hover:text-fg"
                        }`}
                      >
                        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-500/15 text-brand-300">
                          <CvIcon name={e.icon} size={14} />
                        </span>
                        <span className="truncate">{e.course}</span>
                      </button>
                    </li>
                  );
                })}
                {shown.length === 0 && !canUseTyped && (
                  <li className="col-span-full py-6 text-center text-sm text-fg/50">
                    No match yet. Start blank, or pick the closest course.
                  </li>
                )}
              </ul>

              <button
                type="button"
                onClick={() => onExample(example.slug, custom ? example.course : undefined)}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-brand-600 py-3 text-[15px] font-medium text-white ring-1 ring-brand-300/60 shadow-[0_0_22px_rgb(124_128_255/0.5)] transition-colors hover:bg-brand-500"
              >
                Continue with {example.course}
                <span aria-hidden="true">→</span>
              </button>
            </section>
            )}

            {mode === "blank" && (
              <section aria-label="Start with a blank CV" className="rounded-2xl border border-fg/10 bg-fg/[0.03] p-5 sm:p-6">
                <h2 className="text-lg font-medium text-fg">A clean page, every section ready</h2>
                <p className="mt-1.5 text-sm text-fg/60">Fill in one step at a time. Tips show at each step, and the preview updates as you type.</p>
                <button
                  type="button"
                  onClick={onBlank}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-brand-600 py-3 text-[15px] font-medium text-white ring-1 ring-brand-300/60 shadow-[0_0_22px_rgb(124_128_255/0.5)] transition-colors hover:bg-brand-500"
                >
                  Start a blank CV
                  <span aria-hidden="true">→</span>
                </button>
              </section>
            )}

            {mode === "upload" && <ImportCard template={template} highlight={highlightImport} onImport={onImport} />}
          </div>

          {mode === "template" && (
            <>
          {/* Live preview of the chosen course */}
          <div className="min-w-0">
            <div className="lg:sticky lg:top-8">
              <div className="mb-3 flex items-center justify-between gap-3 text-xs text-fg/50">
                <span>
                  Preview: <span className="text-fg/80">{example.course} CV</span>
                </span>
                {templateName && (
                  <span className={template ? "rounded-full bg-brand-500/15 px-2 py-0.5 text-brand-300 ring-1 ring-brand-400/40" : ""}>
                    {template ? "Your template: " : "Template: "}
                    {templateName}
                  </span>
                )}
              </div>
              <div className="relative">
                <div aria-hidden="true" className="absolute inset-x-[8%] -bottom-6 h-24 rounded-[100%] bg-brand-500/40 blur-3xl" />
                <div
                  key={example.slug + activeTemplate}
                  className="animate-fade-up relative mx-auto max-w-[520px] overflow-hidden rounded-md bg-white shadow-[0_30px_70px_-25px_rgb(0_0_0/0.7)] ring-1 ring-fg/10"
                >
                  <CvPageFrame>
                    <CvTemplateView template={activeTemplate} doc={example.cv} role={example.role} photo={example.photo} />
                  </CvPageFrame>
                </div>
              </div>
              <p className="mt-6 text-center text-xs text-fg/45">You can change the template and colour any time in the builder.</p>
            </div>
          </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

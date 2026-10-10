"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { cvExamples, type CvTemplateName } from "@/lib/cv-examples";
import { templates } from "@/lib/templates";
import { CvPageFrame } from "@/components/cv/cv-page-frame";
import { CvTemplateView } from "@/components/cv/cv-templates";
import { CvIcon } from "@/components/cv/cv-icon";
import { Logo } from "@/components/ui/logo";
import { SparkleIcon } from "@/components/ui/sparkle-icon";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SkyBackground } from "./sky-background";

const perks = [
  { label: "No account needed", d: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M4 21a8 8 0 0 1 16 0" },
  { label: "Saved on your device", d: "M5 12l5 5L20 7" },
  { label: "Free PDF, no watermark", d: "M7 3h7l5 5v13H7zM14 3v5h5" },
];

/** First screen of the builder: start from a course example (with live preview) or blank. */
export function StartScreen({
  template,
  onBlank,
  onExample,
}: {
  /** Template picked on the homepage ("Use this template"), if any. */
  template?: CvTemplateName | null;
  onBlank: () => void;
  onExample: (slug: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(cvExamples[0].slug);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? cvExamples.filter((e) => e.course.toLowerCase().includes(q)) : cvExamples;
  }, [query]);
  const example = cvExamples.find((e) => e.slug === selected) ?? cvExamples[0];
  // Preview the course in the template the student already chose, if they chose one
  const activeTemplate = template ?? example.template;
  const templateName = templates.find((t) => t.id === activeTemplate)?.name;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <SkyBackground />
      {/* Same atmosphere as the homepage hero */}
      <div aria-hidden="true" className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,black,transparent)]" />
      <div aria-hidden="true" className="absolute left-1/2 top-0 -z-10 h-[460px] w-[900px] max-w-full -translate-x-1/2 rounded-full bg-brand-600/20 blur-[120px]" />

      <header className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-6 lg:px-8">
        <Logo />
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/" className="hidden text-sm text-fg/60 hover:text-fg sm:inline">
            ← Back to home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 sm:pt-10 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-1.5 rounded-full border border-fg/10 bg-fg/[0.04] px-3 py-1 text-xs text-fg/70">
            <SparkleIcon className="text-brand-300" />
            Free CV builder for students
          </p>
          <h1 className="mt-5 text-4xl font-medium tracking-tight text-balance sm:text-5xl lg:text-6xl">
            <span className="bg-linear-to-b from-fg to-fg/60 bg-clip-text text-transparent">Let’s build your CV</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-fg/60 sm:text-lg">
            Start from a real CV for your course and make it yours, or begin with a clean page. Either way you’ll be done in minutes.
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

        <div className="mt-12 grid gap-6 lg:mt-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-10">
          {/* Choices */}
          <div className="min-w-0 space-y-5">
            <section
              aria-labelledby="from-course"
              className="relative overflow-hidden rounded-2xl border border-brand-400/30 bg-linear-to-b from-brand-600/20 via-ink-900/60 to-ink-900/40 p-5 shadow-[0_0_60px_-25px_rgb(124_128_255/0.6)] sm:p-7"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 id="from-course" className="text-lg font-medium text-fg sm:text-xl">
                  Start from my course
                </h2>
                <span className="rounded-full bg-brand-500/20 px-2.5 py-0.5 text-xs font-medium text-brand-300 ring-1 ring-brand-400/40">
                  Fastest · Recommended
                </span>
              </div>
              <p className="mt-1.5 text-sm text-fg/60">Pick your course, check the preview, then swap in your own details.</p>

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
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search your course, e.g. Nursing"
                  className="w-full rounded-lg border border-fg/12 bg-ink-950/60 py-2.5 pl-10 pr-3 text-[15px] text-fg placeholder:text-fg/35 focus:border-brand-400/70 focus:outline-none"
                />
              </div>

              <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {shown.map((e) => {
                  const active = e.slug === selected;
                  return (
                    <li key={e.slug}>
                      <button
                        type="button"
                        onClick={() => setSelected(e.slug)}
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
                {shown.length === 0 && (
                  <li className="col-span-full py-6 text-center text-sm text-fg/50">
                    No match yet. Start blank, or pick the closest course.
                  </li>
                )}
              </ul>

              <button
                type="button"
                onClick={() => onExample(example.slug)}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-brand-600 py-3 text-[15px] font-medium text-white ring-1 ring-brand-300/60 shadow-[0_0_22px_rgb(124_128_255/0.5)] transition-colors hover:bg-brand-500"
              >
                Start with the {example.course} CV
                <span aria-hidden="true">→</span>
              </button>
            </section>

            <button
              type="button"
              onClick={onBlank}
              className="group flex w-full items-center gap-4 rounded-2xl border border-fg/10 bg-fg/[0.03] p-5 text-left transition-all hover:border-fg/25 hover:bg-fg/[0.05] sm:p-6"
            >
              <span className="grid size-12 shrink-0 place-items-center rounded-xl border border-dashed border-fg/25 text-xl text-fg/70 group-hover:border-brand-400/60 group-hover:text-brand-300">
                +
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium text-fg">Start with a blank CV</span>
                <span className="mt-0.5 block text-sm text-fg/55">Every section ready, with tips at each step.</span>
              </span>
              <span className="text-fg/40 transition-transform group-hover:translate-x-1 group-hover:text-fg" aria-hidden="true">
                →
              </span>
            </button>
          </div>

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
        </div>
      </main>
    </div>
  );
}

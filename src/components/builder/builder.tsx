"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { cvExamples, type CvTemplateName } from "@/lib/cv-examples";
import { accentSwatches, templates } from "@/lib/templates";
import {
  BUILDER_STORAGE_KEY,
  blankCv,
  cvFromExample,
  cvStrength,
  toDoc,
  type BuilderCv,
} from "@/lib/builder";
import { CvPageFrame } from "@/components/cv/cv-page-frame";
import { CvTemplateView } from "@/components/cv/cv-templates";
import { CvIcon } from "@/components/cv/cv-icon";
import { HideEmptySections } from "@/components/cv/hide-empty-sections";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  EducationStep,
  ExperienceStep,
  ExtrasStep,
  PersonalStep,
  ProjectsStep,
  ReferencesStep,
  SkillsStep,
  SummaryStep,
} from "./sections";

const steps = [
  { id: "personal", label: "Personal", Comp: PersonalStep },
  { id: "summary", label: "Summary", Comp: SummaryStep },
  { id: "education", label: "Education", Comp: EducationStep },
  { id: "experience", label: "Experience", Comp: ExperienceStep },
  { id: "projects", label: "Projects", Comp: ProjectsStep },
  { id: "skills", label: "Skills", Comp: SkillsStep },
  { id: "extras", label: "Extras", Comp: ExtrasStep },
  { id: "references", label: "References", Comp: ReferencesStep },
] as const;

type Status = "loading" | "start" | "editing";

export function Builder() {
  const [status, setStatus] = useState<Status>("loading");
  const [cv, setCv] = useState<BuilderCv>(() => blankCv());
  const [step, setStep] = useState(0);
  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saved, setSaved] = useState(true);
  const requestedTemplate = useRef<CvTemplateName | null>(null);

  // Load a saved CV (and a ?template= choice from the gallery) after mount
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("template");
    if (t && templates.some((x) => x.id === t)) requestedTemplate.current = t as CvTemplateName;
    let stored: BuilderCv | null = null;
    try {
      const raw = localStorage.getItem(BUILDER_STORAGE_KEY);
      if (raw) stored = { ...blankCv(), ...JSON.parse(raw) };
    } catch {
      // Corrupt or blocked storage: start fresh
    }
     
    if (stored) {
      setCv(requestedTemplate.current ? { ...stored, template: requestedTemplate.current } : stored);
      setStatus("editing");
    } else {
      setStatus("start");
    }
  }, []);

  // Autosave, debounced
  useEffect(() => {
    if (status !== "editing") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reflects the pending save
    setSaved(false);
    const t = setTimeout(() => {
      try {
        localStorage.setItem(BUILDER_STORAGE_KEY, JSON.stringify(cv));
      } catch {
        // Storage full or blocked; the CV still works for this visit
      }
      setSaved(true);
    }, 500);
    return () => clearTimeout(t);
  }, [cv, status]);

  const update = (patch: Partial<BuilderCv>) => setCv((c) => ({ ...c, ...patch }));
  const doc = useMemo(() => toDoc(cv), [cv]);
  const strength = useMemo(() => cvStrength(cv), [cv]);
  const accentStyle = cv.accent ? ({ "--cv-accent": cv.accent } as CSSProperties) : undefined;
  const templateName = templates.find((t) => t.id === cv.template)?.name ?? "Template";

  function begin(next: BuilderCv) {
    setCv(requestedTemplate.current ? { ...next, template: requestedTemplate.current } : next);
    setStep(0);
    setStatus("editing");
  }

  function startOver() {
    if (!window.confirm("Start a new CV? Your current CV on this device will be cleared.")) return;
    try {
      localStorage.removeItem(BUILDER_STORAGE_KEY);
    } catch {}
    setCv(blankCv());
    setStatus("start");
  }

  function download() {
    const prev = document.title;
    // The browser uses the page title as the PDF file name
    document.title = `${(cv.name || "My").trim().replace(/\s+/g, "_")}_CV`;
    window.print();
    document.title = prev;
  }

  if (status === "loading") {
    return <div className="grid min-h-screen place-items-center text-sm text-fg/50">Loading your CV…</div>;
  }

  if (status === "start") {
    return <StartScreen onBlank={() => begin(blankCv(requestedTemplate.current ?? "ats"))} onExample={(slug) => {
      const ex = cvExamples.find((e) => e.slug === slug);
      if (ex) begin(cvFromExample(ex));
    }} />;
  }

  const Current = steps[step].Comp;

  return (
    <>
    <div className="flex min-h-screen flex-col print:hidden">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-fg/10 bg-ink-950/90 backdrop-blur-xl">
        <div className="flex h-16 items-center gap-2 px-3 sm:gap-3 sm:px-6">
          <Logo />
          <span className="hidden text-xs text-fg/40 sm:inline" aria-live="polite">
            {saved ? "✓ Saved on this device" : "Saving…"}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle className="hidden sm:grid" />
            <button
              type="button"
              onClick={startOver}
              className="hidden rounded-md px-3 py-2 text-sm text-fg/60 hover:text-fg md:block"
            >
              New CV
            </button>
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="max-w-[46vw] truncate rounded-md px-3 py-2 text-sm font-medium text-fg ring-1 ring-fg/15 hover:bg-fg/5"
            >
              <span className="hidden sm:inline">Template: </span>
              {templateName}
            </button>
            <button
              type="button"
              onClick={download}
              className="hidden rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white ring-1 ring-brand-300/60 shadow-[0_0_18px_rgb(124_128_255/0.45)] hover:bg-brand-500 sm:block"
            >
              Download PDF
            </button>
          </div>
        </div>

        {/* Mobile: edit / preview switch */}
        <div className="flex border-t border-fg/10 lg:hidden">
          {(["edit", "preview"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setMobileView(v)}
              aria-pressed={mobileView === v}
              className={`flex-1 py-2.5 text-sm font-medium capitalize ${
                mobileView === v ? "border-b-2 border-brand-400 text-fg" : "text-fg/50"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </header>

      <div className="grid flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        {/* Editor */}
        <section aria-label="Edit your CV" className={`min-w-0 ${mobileView === "edit" ? "block" : "hidden"} lg:block`}>
          <nav aria-label="Steps" className="sticky top-16 z-20 border-b border-fg/10 bg-ink-950/90 backdrop-blur-xl max-lg:top-[105px]">
            <ol className="flex gap-1 overflow-x-auto px-4 py-3 sm:px-6 [scrollbar-width:none]">
              {steps.map((s, i) => {
                const done = strength.checks.filter((c) => c.step === s.id).every((c) => c.done) &&
                  strength.checks.some((c) => c.step === s.id);
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => setStep(i)}
                      aria-current={i === step ? "step" : undefined}
                      ref={(el) => {
                        if (el && i === step) el.scrollIntoView({ block: "nearest", inline: "center" });
                      }}
                      className={`flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-sm transition-colors ${
                        i === step ? "bg-brand-500/15 text-fg ring-1 ring-brand-400/40" : "text-fg/55 hover:text-fg"
                      }`}
                    >
                      <span
                        className={`grid size-5 place-items-center rounded-full text-[10px] font-semibold ${
                          done ? "bg-emerald-500 text-white shadow-[0_0_10px_rgb(16_185_129/0.5)]" : "bg-fg/10 text-fg/60"
                        }`}
                      >
                        {done ? (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-label="Complete">
                            <path d="M5 12.5l4.5 4.5L19 7.5" />
                          </svg>
                        ) : (
                          i + 1
                        )}
                      </span>
                      {s.label}
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>

          <div className="mx-auto max-w-2xl px-4 pb-32 pt-6 sm:px-6 sm:pt-8">
            <Current cv={cv} update={update} />

            <div className="mt-10 flex items-center justify-between gap-3 border-t border-fg/10 pt-6">
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className="rounded-md px-4 py-2.5 text-sm font-medium text-fg/70 ring-1 ring-fg/15 hover:text-fg disabled:opacity-30"
              >
                ← Back
              </button>
              {step < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    setStep((s) => s + 1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="rounded-md bg-brand-600 px-5 py-2.5 text-sm font-medium text-white ring-1 ring-brand-300/60 shadow-[0_0_18px_rgb(124_128_255/0.45)] hover:bg-brand-500"
                >
                  Next: {steps[step + 1].label} →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={download}
                  className="rounded-md bg-brand-600 px-5 py-2.5 text-sm font-medium text-white ring-1 ring-brand-300/60 shadow-[0_0_18px_rgb(124_128_255/0.45)] hover:bg-brand-500"
                >
                  Finish and download PDF
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Preview */}
        <aside
          aria-label="Live preview"
          className={`min-w-0 ${mobileView === "preview" ? "block" : "hidden"} border-fg/10 bg-fg/[0.025] lg:block lg:border-l`}
        >
          <div className="sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto px-4 pb-32 pt-6 sm:px-8">
            <StrengthMeter strength={strength} onGo={(id) => {
              const i = steps.findIndex((s) => s.id === id);
              if (i >= 0) {
                setStep(i);
                setMobileView("edit");
              }
            }} />
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-fg/45">Live preview · A4</p>
              <AccentPicker value={cv.accent} onChange={(accent) => update({ accent })} />
            </div>
            <div style={accentStyle} className="mx-auto mt-3 max-w-[640px] overflow-hidden rounded-md bg-white shadow-[0_20px_60px_-20px_rgb(0_0_0/0.6)] ring-1 ring-fg/10">
              <CvPageFrame key={mobileView}>
                <HideEmptySections>
                  <CvTemplateView template={cv.template} doc={doc} role={cv.role || "Your role"} photo={cv.photo} />
                </HideEmptySections>
              </CvPageFrame>
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile sticky download */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-fg/10 bg-ink-950/95 p-3 backdrop-blur-xl sm:hidden">
        <button
          type="button"
          onClick={download}
          className="w-full rounded-md bg-brand-600 py-3 text-sm font-medium text-white ring-1 ring-brand-300/60 shadow-[0_0_18px_rgb(124_128_255/0.45)]"
        >
          Download PDF · {strength.score}% strong
        </button>
      </div>

      {pickerOpen && (
        <TemplatePicker
          cv={cv}
          onPick={(template) => {
            update({ template });
            setPickerOpen(false);
          }}
          onClose={() => setPickerOpen(false)}
        />
      )}

    </div>

    {/* Full-size copy used only when printing / saving as PDF */}
    <PrintCopy cv={cv} />
    </>
  );
}

/* ------------------------------------------------------------------ */

function StartScreen({ onBlank, onExample }: { onBlank: () => void; onExample: (slug: string) => void }) {
  return (
    <div className="min-h-screen">
      <header className="flex h-16 items-center justify-between px-4 sm:px-6">
        <Logo />
        <Link href="/" className="text-sm text-fg/60 hover:text-fg">
          ← Back to home
        </Link>
      </header>
      <main className="mx-auto max-w-5xl px-4 pb-24 pt-10 sm:px-6 sm:pt-16">
        <div className="text-center">
          <h1 className="text-3xl font-medium tracking-tight text-fg sm:text-5xl">How do you want to start?</h1>
          <p className="mx-auto mt-4 max-w-xl text-fg/60 sm:text-lg">
            Pick your course to start from a full example CV and swap in your details, or begin with a blank page.
          </p>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-[1fr_2fr]">
          <button
            type="button"
            onClick={onBlank}
            className="group flex flex-col items-start rounded-2xl border border-fg/10 bg-fg/[0.03] p-6 text-left transition-all hover:-translate-y-0.5 hover:border-brand-400/50"
          >
            <span className="grid size-11 place-items-center rounded-lg bg-fg/10 text-xl text-fg">+</span>
            <h2 className="mt-5 text-lg font-medium text-fg">Start blank</h2>
            <p className="mt-2 text-sm text-fg/55">An empty CV with every section ready. We’ll guide you step by step.</p>
            <span className="mt-auto pt-6 text-sm font-medium text-brand-300 group-hover:text-fg">Start writing →</span>
          </button>

          <div className="rounded-2xl border border-brand-400/30 bg-linear-to-b from-brand-600/15 to-transparent p-6">
            <h2 className="text-lg font-medium text-fg">Start from my course</h2>
            <p className="mt-2 text-sm text-fg/55">The fastest way. Everything is filled in, so you just change it to match you.</p>
            <ul className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {cvExamples.map((e) => (
                <li key={e.slug}>
                  <button
                    type="button"
                    onClick={() => onExample(e.slug)}
                    className="flex w-full items-center gap-2 rounded-lg border border-fg/10 bg-fg/[0.03] px-2.5 py-2 text-left text-sm text-fg/80 transition-colors hover:border-brand-400/60 hover:text-fg"
                  >
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-500/15 text-brand-300">
                      <CvIcon name={e.icon} size={14} />
                    </span>
                    <span className="truncate">{e.course}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-8 text-center text-xs text-fg/40">Your CV is saved on this device only. No account needed.</p>
      </main>
    </div>
  );
}

function StrengthMeter({
  strength,
  onGo,
}: {
  strength: ReturnType<typeof cvStrength>;
  onGo: (step: string) => void;
}) {
  const { score, checks } = strength;
  const todo = checks.filter((c) => !c.done);
  const color = score >= 80 ? "bg-emerald-400" : score >= 50 ? "bg-brand-400" : "bg-amber-400";
  return (
    <div className="rounded-xl border border-fg/10 bg-fg/[0.03] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-fg">CV strength</p>
        <p className="text-sm font-semibold text-fg">{score}%</p>
      </div>
      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-fg/10">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${score}%` }} />
      </div>
      {todo.length > 0 ? (
        <ul className="mt-3 space-y-1">
          {todo.slice(0, 3).map((c) => (
            <li key={c.label}>
              <button type="button" onClick={() => onGo(c.step)} className="text-left text-xs text-fg/60 hover:text-brand-300">
                → {c.label}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-xs text-emerald-300">Great work. Your CV covers everything recruiters look for.</p>
      )}
    </div>
  );
}

function AccentPicker({ value, onChange }: { value: string | null; onChange: (v: string | null) => void }) {
  return (
    <div role="radiogroup" aria-label="Accent colour" className="flex gap-1.5">
      {accentSwatches.map((s) => (
        <button
          key={s.name}
          type="button"
          role="radio"
          aria-checked={value === s.color}
          aria-label={s.name}
          title={s.name}
          onClick={() => onChange(s.color)}
          className={`size-6 rounded-full transition-transform hover:scale-110 ${
            value === s.color ? "ring-2 ring-brand-400 ring-offset-2 ring-offset-ink-950" : "ring-1 ring-fg/20"
          }`}
          style={
            s.color
              ? { background: s.color }
              : { background: "conic-gradient(#1e3a5f, #047857, #9f1239, #f2b705, #1e3a5f)" }
          }
        />
      ))}
    </div>
  );
}

function TemplatePicker({
  cv,
  onPick,
  onClose,
}: {
  cv: BuilderCv;
  onPick: (t: CvTemplateName) => void;
  onClose: () => void;
}) {
  const doc = useMemo(() => toDoc(cv), [cv]);
  const accentStyle = cv.accent ? ({ "--cv-accent": cv.accent } as CSSProperties) : undefined;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div role="dialog" aria-modal="true" aria-label="Choose a template" className="fixed inset-0 z-50 flex flex-col bg-ink-950/95 backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-fg/10 px-4 py-4 sm:px-6">
        <div>
          <h2 className="text-lg font-medium text-fg">Choose a template</h2>
          <p className="text-sm text-fg/50">Your details stay the same. Only the design changes.</p>
        </div>
        <button type="button" onClick={onClose} className="rounded-md px-3 py-2 text-sm text-fg/70 ring-1 ring-fg/15 hover:text-fg">
          Close
        </button>
      </div>
      <ul className="grid flex-1 grid-cols-2 gap-5 overflow-y-auto p-4 sm:grid-cols-3 sm:p-6 lg:grid-cols-4 xl:grid-cols-5">
        {templates.map((t) => (
          <li key={t.id}>
            <button type="button" onClick={() => onPick(t.id)} className="group w-full text-left">
              <div
                style={accentStyle}
                className={`overflow-hidden rounded-md bg-white transition-all group-hover:-translate-y-1 ${
                  cv.template === t.id ? "ring-2 ring-brand-400 shadow-[0_0_30px_-6px_rgb(124_128_255/0.8)]" : "ring-1 ring-fg/10"
                }`}
              >
                <CvPageFrame>
                  <HideEmptySections>
                    <CvTemplateView template={t.id} doc={doc} role={cv.role || "Your role"} photo={cv.photo} />
                  </HideEmptySections>
                </CvPageFrame>
              </div>
              <p className="mt-2 flex items-center justify-between gap-2 text-sm text-fg">
                {t.name}
                {cv.template === t.id && <span className="text-xs text-brand-300">Selected</span>}
              </p>
              <p className="text-xs text-fg/45">{t.tags.includes("ats") ? "ATS-safe" : t.tags.includes("photo") ? "With photo" : "Simple"}</p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Unscaled A4 copy of the CV, only visible to the printer. */
function PrintCopy({ cv }: { cv: BuilderCv }) {
  const doc = useMemo(() => toDoc(cv), [cv]);
  const accentStyle = cv.accent ? ({ "--cv-accent": cv.accent } as CSSProperties) : undefined;
  return (
    <div id="cv-print" aria-hidden="true" style={accentStyle}>
      <div className="@container flex min-h-[1123px] w-[794px] flex-col bg-white [&>*]:flex-1">
        <HideEmptySections>
                  <CvTemplateView template={cv.template} doc={doc} role={cv.role || "Your role"} photo={cv.photo} />
                </HideEmptySections>
      </div>
    </div>
  );
}

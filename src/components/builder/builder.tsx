
"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { cvExamples, type CvTemplateName } from "@/lib/cv-examples";
import { accentSwatches, isTwoColumn, templates } from "@/lib/templates";
import { AtsExplainer } from "@/components/ui/ats-explainer";
import {
  BUILDER_STORAGE_KEY,
  blankCv,
  courseHints,
  cvFromCourse,
  cvStrength,
  toDoc,
  type BuilderCv,
} from "@/lib/builder";
import { CvPageFrame } from "@/components/cv/cv-page-frame";
import { A4_HEIGHT, A4_WIDTH, fillWidth } from "@/lib/page-fit";
import { CvTemplateView } from "@/components/cv/cv-templates";
import { HideEmptySections } from "@/components/cv/hide-empty-sections";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { CheckIcon } from "@/components/ui/check-icon";
import {
  EducationStep,
  ExperienceStep,
  ExtrasStep,
  PersonalStep,
  ProjectsStep,
  ReferencesStep,
  SkillsStep,
  SummaryStep,
  ResearchStep,
} from "./sections";
import { CvTypePicker, TypeGuide } from "./type-guide";
import type { CvType } from "@/lib/cv-type";
import { CHECKER_HANDOFF_KEY, importCv, type ImportResult } from "@/lib/cv-import";
import { templateAdviceFor, type TemplateAdvice } from "@/lib/template-advice";
import { ConfirmDialog } from "./confirm-dialog";
import { ImportBanner } from "./import-card";
import { StartScreen } from "./start-screen";
import { JobMatchPanel } from "./job-match-panel";
import { BuildTimer, readBest, saveBest } from "./build-timer";
import { CompletionCard, type Completion } from "./completion-card";
import { trackEvent } from "@/lib/track";
import Link from "next/link";

const stepDefs = {
  personal: { label: "Personal", Comp: PersonalStep },
  summary: { label: "Summary", Comp: SummaryStep },
  education: { label: "Education", Comp: EducationStep },
  research: { label: "Research", Comp: ResearchStep },
  experience: { label: "Experience", Comp: ExperienceStep },
  projects: { label: "Projects", Comp: ProjectsStep },
  skills: { label: "Skills", Comp: SkillsStep },
  extras: { label: "Extras", Comp: ExtrasStep },
  references: { label: "References", Comp: ReferencesStep },
} as const;

type StepId = keyof typeof stepDefs;

/** Which steps a CV type shows, in order. The order is what makes each type different. */
const stepOrder: Record<CvType, StepId[]> = {
  standard: ["personal", "summary", "education", "experience", "projects", "skills", "extras", "references"],
  graduate: ["personal", "summary", "education", "projects", "experience", "skills", "extras", "references"],
  skills: ["personal", "summary", "skills", "projects", "experience", "education", "extras", "references"],
  academic: ["personal", "summary", "education", "research", "experience", "projects", "skills", "extras", "references"],
};

const stepsFor = (type: CvType) => stepOrder[type].map((id) => ({ id, ...stepDefs[id] }));

type Status = "loading" | "start" | "guide" | "editing";

export function Builder() {
  const [status, setStatus] = useState<Status>("loading");
  const [cv, setCv] = useState<BuilderCv>(() => blankCv());
  const [step, setStep] = useState(0);
  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [matchOpen, setMatchOpen] = useState(false);
  const [completion, setCompletion] = useState<Completion | null>(null);
  const timeRef = useRef(0);
  const persistTime = useCallback((ms: number) => setCv((c) => (c.timeSpent === ms ? c : { ...c, timeSpent: ms })), []);
  const [saved, setSaved] = useState(true);
  const [fit, setFit] = useState(1);
  const [requested, setRequested] = useState<CvTemplateName | null>(null);
  /** True while the student reopens the course picker from inside the editor. */
  const [changingCourse, setChangingCourse] = useState(false);
  /** True when the student arrived from an "Import my CV" button (?import=1). */
  const [importMode, setImportMode] = useState(false);
  /** What we found when the student uploaded their CV, shown as a banner in the editor. */
  const [importInfo, setImportInfo] = useState<ImportResult | null>(null);
  /** Whether a CV is already saved on this device, so importing can warn before replacing it. */
  const [hasSaved, setHasSaved] = useState(false);
  /** A brand-new CV waiting for the student to choose its type in the guide. */
  const [pending, setPending] = useState<BuilderCv | null>(null);
  /** A CV handed over by the CV checker, waiting to be opened in the editor. */
  const [incoming, setIncoming] = useState<ImportResult | null>(null);
  /** A pending "are you sure?" pop-up. Nothing destructive happens until the student confirms. */
  const [confirm, setConfirm] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    onConfirm: () => void;
  } | null>(null);

  // Load a saved CV (and a ?template= or ?import= choice from the page that sent us here) after mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("template");
    const picked = t && templates.some((x) => x.id === t) ? (t as CvTemplateName) : null;
    const wantsImport = params.get("import") === "1";
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read once from the URL after mount
    setRequested(picked);
    setImportMode(wantsImport);
    // The checker leaves the CV's text in sessionStorage and sends the student here
    if (params.get("fromChecker") === "1") {
      try {
        const handedOver = sessionStorage.getItem(CHECKER_HANDOFF_KEY);
        sessionStorage.removeItem(CHECKER_HANDOFF_KEY);
        if (handedOver) setIncoming(importCv(handedOver));
      } catch {
        // Blocked storage: the student can upload the CV here instead
      }
    }
    let stored: BuilderCv | null = null;
    try {
      const raw = localStorage.getItem(BUILDER_STORAGE_KEY);
      if (raw) stored = { ...blankCv(), ...JSON.parse(raw) };
    } catch {
      // Corrupt or blocked storage: start fresh
    }
     
    if (stored) {
      timeRef.current = stored.timeSpent ?? 0;
      setCv(picked ? { ...stored, template: picked } : stored);
      setHasSaved(true);
      // "Import my CV" shows the upload screen even when a CV is saved; a back button returns to it
      setStatus(wantsImport ? "start" : "editing");
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
  const steps = useMemo(() => stepsFor(cv.cvType), [cv.cvType]);
  const strength = useMemo(() => cvStrength(cv), [cv]);
  const accentStyle = cvStyle(cv, strength.score);
  const templateName = templates.find((t) => t.id === cv.template)?.name ?? "Template";

  // The picked course's example CV: shown as dimmed placeholders in the form, and as
  // a sample preview until the student types their name. Never saved into their CV.
  const hints = useMemo(() => courseHints(cv.courseSlug, cv.courseName), [cv.courseSlug, cv.courseName]);
  const previewingSample = !!hints && !cv.name.trim();
  const previewDoc = previewingSample && hints ? toDoc(hints) : doc;
  const previewRole = (previewingSample ? hints?.role : cv.role) || "Your role";
  // The example's stock photo belongs to somebody else, so it is never previewed
  const previewPhoto = previewingSample ? undefined : cv.photo;

  // Until a name is typed a blank CV would show every template as an empty page, which makes the
  // designs impossible to judge. The picker shows sample text instead, then switches to the student's own.
  const showingPickerSample = !cv.name.trim();
  const sampleExample = cvExamples[0];
  const pickerDoc = !showingPickerSample ? doc : hints ? previewDoc : sampleExample.cv;
  const pickerRole = !showingPickerSample ? previewRole : hints ? previewRole : sampleExample.role;
  const pickerPhoto = showingPickerSample ? undefined : cv.photo;

  /**
   * Starts editing `next` (and shows the import banner if it came from an upload).
   * Starting a different CV overwrites the one saved on this device, so when there
   * is one we show a confirmation pop-up first and only continue if they agree.
   */
  function begin(next: BuilderCv, imported?: ImportResult) {
    const start = () => {
      setHasSaved(false);
      setImportMode(false);
      if (imported) {
        openEditor(next, imported);
      } else {
        // A new CV: ask three quick questions first so we can pick the right type
        setPending(next);
        setStatus("guide");
      }
    };
    if (!hasSaved) return start();
    setConfirm({
      title: imported ? "Replace your saved CV with this upload?" : "Replace your saved CV?",
      message: "You already have a CV saved on this device. Continuing will replace it. If you opened this by mistake, keep your CV.",
      confirmLabel: imported ? "Replace with upload" : "Replace my CV",
      onConfirm: start,
    });
  }

  useEffect(() => {
    if (!incoming || status === "loading") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hand-over from the checker, then cleared
    begin(incoming.cv, incoming);
    setIncoming(null);
    // begin() is recreated every render; this must only run when a CV arrives
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incoming, status]);

  /** Opens the editor on `next`, from step one. A template chosen on the homepage always wins. */
  function openEditor(next: BuilderCv, imported?: ImportResult) {
    timeRef.current = 0;
    setCv(requested ? { ...next, template: requested } : next);
    setStep(0);
    setImportInfo(imported ?? null);
    setPending(null);
    setStatus("editing");
  }

  /** Changes the CV type from inside the editor, staying on the same step when the new type has it. */
  function changeType(type: CvType) {
    const currentId = steps[step]?.id;
    update({ cvType: type });
    const next = stepsFor(type).findIndex((x) => x.id === currentId);
    setStep(next >= 0 ? next : 0);
  }

  function startOver() {
    setConfirm({
      title: "Start a new CV?",
      message: "Your current CV on this device will be cleared. Download it first if you still need it.",
      confirmLabel: "Clear and start new",
      onConfirm: () => {
        try {
          localStorage.removeItem(BUILDER_STORAGE_KEY);
        } catch {}
        setCv(blankCv());
        setHasSaved(false);
        setImportInfo(null);
        setStatus("start");
      },
    });
  }

  async function downloadWord() {
    const { downloadDocx } = await import("@/lib/docx-export");
    await downloadDocx(doc, cv.role.trim(), cv.accent, `${(cv.name || "My").trim().replace(/\s+/g, "_")}_CV`);
  }

  function download() {
    const prev = document.title;
    // The browser uses the page title as the PDF file name
    document.title = `${(cv.name || "My").trim().replace(/\s+/g, "_")}_CV`;
    window.print();
    document.title = prev;

    // First download marks the CV as complete and shows the summary
    if (!cv.finishedAt) {
      const ms = timeRef.current;
      const best = readBest();
      if (best === null || ms < best) saveBest(ms);
      trackEvent("cv_downloaded", { template: templateName, type: cv.cvType, minutes: Math.round(ms / 60000) });
      update({ finishedAt: Date.now(), timeSpent: ms });
      setCompletion({ ms, score: strength.score, template: templateName, best, newBest: best !== null && ms < best });
    }
  }

  if (status === "loading") {
    return <div className="grid min-h-screen place-items-center text-sm text-fg/50">Loading your CV…</div>;
  }

  // The same pop-up serves both screens (replacing a saved CV, or clearing it)
  const confirmDialog = confirm && (
    <ConfirmDialog
      title={confirm.title}
      message={confirm.message}
      confirmLabel={confirm.confirmLabel}
      onCancel={() => setConfirm(null)}
      onConfirm={() => {
        const action = confirm.onConfirm;
        setConfirm(null);
        action();
      }}
    />
  );

  if (status === "guide" && pending) {
    return (
      <TypeGuide
        onDone={(type, template) => openEditor({ ...pending, cvType: type, template })}
        onSkip={() => openEditor(pending)}
      />
    );
  }

  if (status === "start") {
    return (
      <>
      <StartScreen
        template={requested}
        highlightImport={importMode}
        // The student's saved CV is kept when they came back to this screen from the editor, or from an import button
        onCancel={
          changingCourse || (importMode && hasSaved)
            ? () => {
                setChangingCourse(false);
                setImportMode(false);
                setStatus("editing");
              }
            : undefined
        }
        onImport={(result) => begin(result.cv, result)}
        onBlank={() => {
          if (changingCourse) {
            update({ courseSlug: undefined, courseName: undefined });
            setChangingCourse(false);
            setStatus("editing");
          } else {
            begin(blankCv(requested ?? "ats"));
          }
        }}
        // courseName is set when the student typed a course we have no example for
        onExample={(slug, courseName) => {
          const ex = cvExamples.find((e) => e.slug === slug);
          if (!ex) return;
          if (changingCourse) {
            update({ courseSlug: slug, courseName });
            setChangingCourse(false);
            setStatus("editing");
          } else {
            begin(cvFromCourse(ex, undefined, courseName));
          }
        }}
      />
      {confirmDialog}
      </>
    );
  }

  const Current = steps[step].Comp;

  return (
    <>
    <div className="flex min-h-screen flex-col print:hidden">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-fg/10 bg-ink-950/90 backdrop-blur-xl">
        <div className="flex h-16 items-center gap-2 px-3 sm:gap-3 sm:px-6">
          <Logo />
          {/* Save status. On phones only the icon shows; the words are for screen readers and larger screens. */}
          <span
            className="inline-flex items-center gap-1.5 text-xs text-fg/45"
            aria-live="polite"
            title={saved ? "Saved on this device" : "Saving…"}
          >
            {saved ? (
              <CheckIcon size={14} />
            ) : (
              <span className="size-2 animate-pulse rounded-full bg-amber-400" aria-hidden="true" />
            )}
            <span className="sr-only sm:not-sr-only">{saved ? "Saved on this device" : "Saving…"}</span>
          </span>
          <div className="ml-auto flex items-center gap-2">
            <BuildTimer timeRef={timeRef} initialMs={cv.timeSpent ?? 0} finished={!!cv.finishedAt} onPersist={persistTime} />
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
              onClick={downloadWord}
              title="Editable Word file, for employers who ask for .docx"
              className="hidden rounded-md px-3 py-2 text-sm font-medium text-fg ring-1 ring-fg/15 hover:bg-fg/5 sm:block"
            >
              Download Word
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
            <ol className="flex flex-wrap gap-1 px-3 py-2.5 sm:px-6 sm:py-3">
              {steps.map((s, i) => {
                const done = strength.checks.filter((c) => c.step === s.id).every((c) => c.done) &&
                  strength.checks.some((c) => c.step === s.id);
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => setStep(i)}
                      aria-current={i === step ? "step" : undefined}
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
            {importInfo && <ImportBanner info={importInfo} onDismiss={() => setImportInfo(null)} />}

            <div className="mb-5">
              <p className="mb-1.5 text-xs font-medium text-fg/60">CV type</p>
              <CvTypePicker value={cv.cvType} onChange={changeType} />
            </div>

            {/* Where the dimmed example text comes from, with a way back to the course choice */}
            <p className={`mb-5 flex-wrap items-center gap-x-2 text-xs text-fg/50 ${importInfo && !hints ? "hidden" : "flex"}`}>
              {hints
                ? `Grey example text comes from the ${cv.courseName ?? cvExamples.find((e) => e.slug === cv.courseSlug)?.course ?? "course"} CV.`
                : "Pick your course to see example text for your field."}
              <button
                type="button"
                onClick={() => {
                  setChangingCourse(true);
                  setStatus("start");
                }}
                className="font-medium text-brand-300 hover:text-fg"
              >
                {hints ? "Change course" : "Choose course"}
              </button>
            </p>
            <Current cv={cv} update={update} hints={hints} />

            {/* Near the end, nudge students to see their details in other templates: the picker is easy to miss in the top bar */}
            {step >= steps.length - 3 && (
              <div className="mt-8 flex flex-col gap-3 rounded-xl border border-brand-400/30 bg-brand-500/[0.08] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-fg">Happy with your details?</p>
                  <p className="mt-0.5 text-sm text-fg/60">
                    See your own CV in all {templates.length} templates and pick the one you like. Your details stay the same.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="shrink-0 rounded-md bg-brand-600 px-5 py-2.5 text-sm font-medium text-white ring-1 ring-brand-300/60 shadow-[0_0_18px_rgb(124_128_255/0.45)] hover:bg-brand-500"
                >
                  Choose your template
                </button>
              </div>
            )}

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
            <div className="mb-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMatchOpen(true)}
                className="flex items-center justify-center gap-2 rounded-lg border border-fg/12 bg-fg/[0.04] px-3 py-2.5 text-sm font-medium text-fg hover:border-brand-400/50"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" className="text-brand-300">
                  <circle cx="12" cy="12" r="8" />
                  <circle cx="12" cy="12" r="3.5" />
                </svg>
                Match a job
              </button>
              <Link
                href="/cover-letter"
                className="flex items-center justify-center gap-2 rounded-lg border border-fg/12 bg-fg/[0.04] px-3 py-2.5 text-sm font-medium text-fg hover:border-brand-400/50"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-brand-300">
                  <path d="M3 6h18v12H3zM3 6l9 7 9-7" />
                </svg>
                Cover letter
              </Link>
            </div>
            <StrengthMeter strength={strength} onGo={(id) => {
              const i = steps.findIndex((s) => s.id === id);
              if (i >= 0) {
                setStep(i);
                setMobileView("edit");
              }
            }} />
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-fg/45">
                Live preview · A4
                {fit < 0.995 && fit > MIN_FIT + 0.005 && (
                  <span className="mt-1 block text-amber-300">
                    A bit long for one page. Your PDF will shrink it to {Math.round(fit * 100)}% so it fits.
                  </span>
                )}
                {fit <= MIN_FIT + 0.005 && (
                  <span className="mt-1 block text-amber-300">Too long for one page, so your PDF will use two. Try trimming it.</span>
                )}
              </p>
              <AccentPicker value={cv.accent} onChange={(accent) => update({ accent })} />
            </div>
            <div style={accentStyle} className="mx-auto mt-3 max-w-[640px] overflow-hidden rounded-md bg-white shadow-[0_20px_60px_-20px_rgb(0_0_0/0.6)] ring-1 ring-fg/10">
              <CvPageFrame key={mobileView} fill={strength.score >= FILL_FROM_SCORE || previewingSample}>
                <HideEmptySections type={cv.cvType}>
                  <CvTemplateView template={cv.template} doc={previewDoc} role={previewRole} photo={previewPhoto} />
                </HideEmptySections>
              </CvPageFrame>
            </div>
            {previewingSample && (
              <p className="mt-3 text-center text-xs text-fg/50">
                Sample preview for your course. Type your name and it becomes your own CV.
              </p>
            )}
          </div>
        </aside>
      </div>

      {/* Mobile sticky download */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-fg/10 bg-ink-950/95 p-3 backdrop-blur-xl sm:hidden">
        <button
          type="button"
          onClick={downloadWord}
          className="flex-1 rounded-md py-3 text-sm font-medium text-fg ring-1 ring-fg/15"
        >
          Download Word
        </button>
        <button
          type="button"
          onClick={download}
          className="flex-1 rounded-md bg-brand-600 py-3 text-sm font-medium text-white ring-1 ring-brand-300/60 shadow-[0_0_18px_rgb(124_128_255/0.45)]"
        >
          Download PDF
        </button>
      </div>

      {completion && <CompletionCard data={completion} onClose={() => setCompletion(null)} />}
      {matchOpen && <JobMatchPanel cv={cv} update={update} onClose={() => setMatchOpen(false)} />}

      {pickerOpen && (
        <TemplatePicker
          cv={cv}
          doc={pickerDoc}
          role={pickerRole}
          photo={pickerPhoto}
          showingSample={showingPickerSample}
          advice={templateAdviceFor(cv.courseSlug, cv.courseName)}
          onPick={(template) => {
            update({ template });
            setPickerOpen(false);
          }}
          onClose={() => setPickerOpen(false)}
        />
      )}

    </div>

    {/* Full-size copy used only when printing / saving as PDF */}
    <PrintCopy cv={cv} onFit={(f) => setFit((prev) => (Math.abs(prev - f) > 0.005 ? f : prev))} />
    {confirmDialog}
    </>
  );
}

/* ------------------------------------------------------------------ */

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
  doc,
  role,
  photo,
  showingSample,
  advice,
  onPick,
  onClose,
}: {
  cv: BuilderCv;
  /** Suggested templates for the student's course, if they picked one. */
  advice: TemplateAdvice | null;
  /** True while the thumbnails show sample text because the CV has no name yet. */
  showingSample: boolean;
  /** What the thumbnails show: the student's CV, or the course sample while it is still empty. */
  doc: ReturnType<typeof toDoc>;
  role: string;
  photo?: string;
  onPick: (t: CvTemplateName) => void;
  onClose: () => void;
}) {
  const accentStyle = cvStyle(cv, cvStrength(cv).score);
  // Suggested designs lead the list; the rest keep their usual order
  const suggested = advice?.ids ?? [];
  const ordered = [...templates].sort((a, b) => Number(suggested.includes(b.id)) - Number(suggested.includes(a.id)));

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
          <p className="text-sm text-fg/50">
            {showingSample ? "Showing sample text until you add your name. " : ""}Your details stay the same. Only the design changes.
          </p>
        </div>
        <button type="button" onClick={onClose} className="rounded-md px-3 py-2 text-sm text-fg/70 ring-1 ring-fg/15 hover:text-fg">
          Close
        </button>
      </div>
      {advice && (
        <p className="mx-4 mt-4 rounded-lg border border-brand-400/30 bg-brand-500/[0.08] px-4 py-3 text-sm text-fg/75 sm:mx-6">
          <span className="font-medium text-fg">Recommended for {advice.field}.</span> {advice.reason}
        </p>
      )}
      <AtsExplainer className="mx-4 mt-3 sm:mx-6" />
      <ul className="grid flex-1 grid-cols-2 gap-5 overflow-y-auto p-4 sm:grid-cols-3 sm:p-6 lg:grid-cols-4 xl:grid-cols-5">
        {ordered.map((t) => (
          <li key={t.id}>
            <button type="button" onClick={() => onPick(t.id)} className="group w-full text-left">
              <div
                style={accentStyle}
                className={`overflow-hidden rounded-md bg-white transition-all group-hover:-translate-y-1 ${
                  cv.template === t.id ? "ring-2 ring-brand-400 shadow-[0_0_30px_-6px_rgb(124_128_255/0.8)]" : "ring-1 ring-fg/10"
                }`}
              >
                <CvPageFrame>
                  <HideEmptySections type={cv.cvType}>
                    <CvTemplateView template={t.id} doc={doc} role={role} photo={photo} />
                  </HideEmptySections>
                </CvPageFrame>
              </div>
              <p className="mt-2 flex items-center justify-between gap-2 text-sm text-fg">
                {t.name}
                {cv.template === t.id && <span className="text-xs text-brand-300">Selected</span>}
              </p>
              <p className="mt-0.5 flex flex-wrap gap-1.5 text-[11px]">
                {suggested.includes(t.id) && (
                  <span className="rounded bg-brand-500/25 px-1.5 py-0.5 font-medium text-brand-300">Recommended</span>
                )}
                {t.tags.includes("ats") && (
                  <span title="One column, plain headings, no photo" className="rounded bg-emerald-500/15 px-1.5 py-0.5 font-medium text-emerald-300">
                    ATS-safe
                  </span>
                )}
                {t.tags.includes("photo") && <span className="rounded bg-fg/10 px-1.5 py-0.5 text-fg/60">Photo</span>}
                {isTwoColumn(t.id) && <span className="rounded bg-fg/10 px-1.5 py-0.5 text-fg/60">Two columns</span>}
              </p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/*
 * Print rules live with the builder (not globals.css) so the PDF never depends
 * on a cached stylesheet. The copy stays off-screen, not display:none, so its
 * height can be measured for fit-to-page.
 */
const printCss = `
#cv-print { position: fixed; left: -10000px; top: 0; visibility: hidden; pointer-events: none; }
@media print {
  @page { size: A4; margin: 0; }
  html, body { background: #fff !important; margin: 0 !important; padding: 0 !important; }
  body > *:not(#cv-print) { display: none !important; }
  #cv-print { position: static; left: 0; visibility: visible; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
  #cv-print li, #cv-print section, #cv-print p { break-inside: avoid; }
  #cv-print h3 { break-after: avoid; }
}
`;

/**
 * From this CV strength up, the page is stretched to fill the sheet: sections are
 * spread out and a short CV is scaled up. A half-filled CV stays top-aligned and
 * unscaled, so the text does not jump around while the student is still typing.
 */
const FILL_FROM_SCORE = 80;

/** Accent colour plus how sections are spaced (see FILL_FROM_SCORE). */
function cvStyle(cv: BuilderCv, score: number): CSSProperties {
  return {
    ...(cv.accent ? { "--cv-accent": cv.accent } : {}),
    "--cv-justify": score >= FILL_FROM_SCORE ? "space-between" : "flex-start",
  } as CSSProperties;
}

/** Smallest shrink we allow before letting a very long CV run onto a second page. */
const MIN_FIT = 0.72;


/**
 * Full-size copy of the CV that only the printer sees. If the CV is taller than
 * one A4 page, it is laid out a little wider and zoomed down so it fills exactly
 * one page edge to edge, instead of being cut across two pages.
 */
function PrintCopy({ cv, onFit }: { cv: BuilderCv; onFit: (scale: number) => void }) {
  const doc = useMemo(() => toDoc(cv), [cv]);
  const pageRef = useRef<HTMLDivElement>(null);
  const score = cvStrength(cv).score;
  const accentStyle = cvStyle(cv, score);
  // Same rule as the preview: only a nearly complete CV is scaled up to fill the page
  const fill = score >= FILL_FROM_SCORE;

  useLayoutEffect(() => {
    const el = pageRef.current;
    if (!el) return;
    el.style.zoom = "1";
    // Rendered at width w and zoomed by A4_WIDTH / w, does the page fit one A4 height?
    const fits = (w: number) => {
      el.style.width = `${w}px`;
      return (el.offsetHeight * A4_WIDTH) / w <= A4_HEIGHT - 2;
    };
    let width = A4_WIDTH;
    if (!fits(A4_WIDTH)) {
      let lo = A4_WIDTH;
      let hi = A4_WIDTH / MIN_FIT;
      width = hi;
      if (fits(hi)) {
        for (let i = 0; i < 12; i++) {
          const mid = (lo + hi) / 2;
          if (fits(mid)) hi = mid;
          else lo = mid;
        }
        width = hi;
      }
    }
    // A short CV is laid out narrower and zoomed up so it fills the sheet
    if (fill && width === A4_WIDTH) width = fillWidth(el);
    el.style.width = `${width}px`;
    el.style.zoom = String(A4_WIDTH / width);
    // Keep the sheet exactly one A4 page tall after the zoom
    el.style.minHeight = `${(1121 * width) / A4_WIDTH}px`;
    onFit(A4_WIDTH / width);
  });

  return (
    <div id="cv-print" aria-hidden="true" style={accentStyle}>
      <style>{printCss}</style>
      <div ref={pageRef} className="@container flex min-h-[1121px] w-[794px] flex-col bg-white [&>*]:flex-1">
        <HideEmptySections type={cv.cvType}>
          <CvTemplateView template={cv.template} doc={doc} role={cv.role || "Your role"} photo={cv.photo} />
        </HideEmptySections>
      </div>
    </div>
  );
}

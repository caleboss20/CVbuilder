"use client";

import { useState } from "react";
import {
  cvTypes,
  defaultTemplates,
  guideComplete,
  guideQuestions,
  recommendCvType,
  type CvType,
  type GuideAnswers,
} from "@/lib/cv-type";
import type { CvTemplateName } from "@/lib/cv-examples";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { PortalGlow } from "./portal-glow";
import { SkyBackground } from "./sky-background";

/*
 * "Which kind of CV do I need?" Students should not have to know the difference
 * between a graduate and a skills-based CV. We ask three plain questions, pick a
 * type for them with a one-line reason, and let them change it with one tap.
 */

export function TypeGuide({
  onDone,
  onSkip,
}: {
  /** Called with the chosen type and a template that suits it. */
  onDone: (type: CvType, template: CvTemplateName) => void;
  /** Used when the student does not want to answer: a standard CV, nothing else changes. */
  onSkip: () => void;
}) {
  const [answers, setAnswers] = useState<GuideAnswers>({});
  const [index, setIndex] = useState(0);
  /** A type the student picked instead of our recommendation. */
  const [override, setOverride] = useState<CvType | null>(null);

  const finished = index >= guideQuestions.length && guideComplete(answers);
  const question = guideQuestions[index];
  const recommendation = recommendCvType(answers);
  const type = override ?? recommendation.type;

  function answer(value: string) {
    setAnswers((a) => ({ ...a, [question.key]: value }));
    setIndex((i) => i + 1); // moving on at once keeps it to three quick taps
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <SkyBackground />
      <PortalGlow />

      <header className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 sm:h-20 sm:px-6">
        <Logo />
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button type="button" onClick={onSkip} className="text-sm text-fg/60 hover:text-fg">
            Skip
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 pb-20 pt-6 sm:pt-12">
        {!finished ? (
          <section aria-live="polite">
            <p className="text-sm text-fg/55">
              Question {index + 1} of {guideQuestions.length}
            </p>
            <div className="mt-2 flex gap-1.5" aria-hidden="true">
              {guideQuestions.map((q, i) => (
                <span key={q.key} className={`h-1 flex-1 rounded-full ${i <= index ? "bg-brand-400" : "bg-fg/15"}`} />
              ))}
            </div>

            <h1 className="mt-8 text-3xl font-medium tracking-tight text-fg sm:text-4xl">{question.title}</h1>
            <ul className="mt-7 space-y-3">
              {question.options.map((o) => (
                <li key={o.value}>
                  <button
                    type="button"
                    onClick={() => answer(o.value)}
                    className="w-full rounded-xl border border-fg/12 bg-fg/[0.04] px-5 py-4 text-left transition-all hover:border-brand-400/60 hover:bg-brand-500/10"
                  >
                    <span className="block font-medium text-fg">{o.label}</span>
                    {o.hint && <span className="mt-0.5 block text-sm text-fg/55">{o.hint}</span>}
                  </button>
                </li>
              ))}
            </ul>

            {index > 0 && (
              <button type="button" onClick={() => setIndex((i) => i - 1)} className="mt-6 text-sm text-fg/55 hover:text-fg">
                ← Back
              </button>
            )}
          </section>
        ) : (
          <section aria-live="polite">
            <p className="text-sm text-fg/55">Your CV type</p>
            <h1 className="mt-2 text-3xl font-medium tracking-tight text-fg sm:text-4xl">
              {cvTypes.find((t) => t.id === type)?.label} CV
            </h1>
            <p className="mt-3 text-base leading-relaxed text-fg/65">
              {override && override !== recommendation.type
                ? cvTypes.find((t) => t.id === override)?.summary
                : recommendation.reason}
            </p>

            <button
              type="button"
              onClick={() => onDone(type, defaultTemplates[type])}
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-md bg-brand-600 py-3.5 text-[15px] font-medium text-white ring-1 ring-brand-300/60 shadow-[0_0_22px_rgb(124_128_255/0.5)] transition-colors hover:bg-brand-500"
            >
              Start building
              <span aria-hidden="true">→</span>
            </button>

            <p className="mt-8 text-sm text-fg/55">Want a different type? You can change it any time.</p>
            <CvTypePicker value={type} onChange={setOverride} className="mt-3" />

            <button
              type="button"
              onClick={() => {
                setIndex(0);
                setOverride(null);
              }}
              className="mt-6 text-sm text-fg/55 hover:text-fg"
            >
              ← Answer again
            </button>
          </section>
        )}
      </main>
    </div>
  );
}

/** The four CV types as a row of choices. Used by the guide and inside the editor. */
export function CvTypePicker({
  value,
  onChange,
  className = "",
}: {
  value: CvType;
  onChange: (type: CvType) => void;
  className?: string;
}) {
  const current = cvTypes.find((t) => t.id === value);
  return (
    <div className={className}>
      <div role="radiogroup" aria-label="CV type" className="flex flex-wrap gap-1.5 rounded-lg bg-fg/5 p-1">
        {cvTypes.map((t) => (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={value === t.id}
            onClick={() => onChange(t.id)}
            className={`flex-1 whitespace-nowrap rounded-md px-3 py-1.5 text-sm transition-colors ${
              value === t.id ? "bg-fg/10 text-fg ring-1 ring-fg/15" : "text-fg/55 hover:text-fg"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {current && <p className="mt-2 text-xs text-fg/50">{current.summary}</p>}
    </div>
  );
}

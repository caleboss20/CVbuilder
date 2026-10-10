import type { ReactNode } from "react";
import { SectionHeading } from "./section-heading";

const problems: {
  title: string;
  problem: string;
  fix: string;
  fixTitle: string;
  icon: ReactNode;
}[] = [
  {
    title: "Blank page panic",
    problem: "You open Word, stare at an empty page and have no idea where to start.",
    fixTitle: "Guided, step by step",
    fix: "CV11 walks you through every section with examples written by students like you.",
    icon: (
      <path d="M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h4" />
    ),
  },
  {
    title: "Weak wording",
    problem: "“I helped with stuff” won’t impress a recruiter. But what else do you write?",
    fixTitle: "AI writes it stronger",
    fix: "Write it the way you’d say it. Our AI turns it into strong bullet points recruiters actually read.",
    icon: (
      <path d="M4 20h4L19 9l-4-4L4 16zM13 7l4 4" />
    ),
  },
  {
    title: "Messy formatting",
    problem: "Fonts, margins and spacing never line up, and you can’t tell if hiring software can even read it.",
    fixTitle: "Formatted for you",
    fix: "Pick a template and we handle the layout. Every one is built to pass hiring software.",
    icon: (
      <path d="M4 5h16M4 10h10M4 15h16M4 20h7" />
    ),
  },
];

export function Problems() {
  return (
    <section aria-labelledby="problems-heading" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="problems-heading"
          eyebrow="Sound familiar?"
          title={
            <>
              Writing a CV is <em>hard</em> when you’re <em>just starting out</em>
            </>
          }
          description="Most students have never written a CV before. We built CV11 so your first one looks like you’ve done it many times."
        />

        <ul className="mt-14 grid gap-5 md:grid-cols-3">
          {problems.map((p) => (
            <li key={p.title} className="group h-60 sm:h-64 [perspective:1200px]">
              <div
                tabIndex={0}
                className="relative h-full rounded-xl outline-none transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] focus-visible:[transform:rotateY(180deg)] focus-visible:ring-2 focus-visible:ring-brand-400"
              >
                {/* Front: the problem */}
                <div className="absolute inset-0 flex flex-col rounded-xl border border-fg/10 bg-fg/[0.03] p-6 [backface-visibility:hidden]">
                  <span className="grid size-11 place-items-center rounded-lg border border-fg/10 bg-fg/5 text-fg/70">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      {p.icon}
                    </svg>
                  </span>
                  <h3 className="mt-5 text-lg font-medium text-fg">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-fg/55">{p.problem}</p>
                  <p className="mt-auto inline-flex items-center gap-1.5 text-xs text-brand-300">
                    See how we fix it
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </p>
                </div>

                {/* Back: how CV11 fixes it */}
                <div className="absolute inset-0 flex flex-col rounded-xl border border-brand-400/40 bg-linear-to-b from-brand-600/30 to-ink-900 p-6 shadow-[0_0_40px_-12px_rgb(124_128_255/0.7)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
                  <span className="grid size-11 place-items-center rounded-lg bg-brand-500 text-white shadow-[0_0_20px_rgb(124_128_255/0.6)]">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                  </span>
                  <h3 className="mt-5 text-lg font-medium text-fg">{p.fixTitle}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-fg/75">{p.fix}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

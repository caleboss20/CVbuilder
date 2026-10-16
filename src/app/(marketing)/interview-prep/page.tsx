import type { Metadata } from "next";
import Link from "next/link";
import { QuestionList } from "@/components/marketing/question-list";
import { fieldPrep, generalQuestions, starSteps } from "@/lib/interview-prep";

export const metadata: Metadata = {
  title: "Interview Preparation for Students and Graduates in Ghana",
  description:
    "Common interview questions and how to answer them, for students and fresh graduates. General questions plus advice for health, engineering, computing, business, sciences, education and more.",
  alternates: { canonical: "/interview-prep" },
};

export default function InterviewPrepPage() {
  return (
    <div className="relative overflow-hidden pt-32 pb-24 sm:pt-40">
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-0 -z-10 h-[420px] w-[900px] -translate-x-1/2 rounded-full bg-brand-600/15 blur-[120px]"
      />
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center">
          <h1 className="text-4xl font-medium tracking-tight text-fg sm:text-5xl">Interview preparation</h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-fg/65 sm:text-lg">
            The questions interviewers ask most, and how to build an honest answer. Start with the general ones, then open your field.
          </p>
        </div>

        <section className="mt-12">
          <h2 className="text-2xl font-medium text-fg">Questions almost everyone is asked</h2>
          <div className="mt-5">
            <QuestionList questions={generalQuestions} />
          </div>
        </section>

        <section className="mt-12 rounded-2xl border border-brand-400/30 bg-brand-500/[0.08] p-5 sm:p-6">
          <h2 className="text-xl font-medium text-fg">The STAR method for “tell us about a time…”</h2>
          <ol className="mt-4 grid gap-3 sm:grid-cols-2">
            {starSteps.map((s) => (
              <li key={s.letter} className="flex gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-500/25 text-sm font-semibold text-brand-300">
                  {s.letter}
                </span>
                <span>
                  <span className="block font-medium text-fg">{s.label}</span>
                  <span className="text-sm text-fg/65">{s.text}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-medium text-fg">Questions for your field</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {fieldPrep.map((f) => (
              <li key={f.id}>
                <Link
                  href={`/interview-prep/${f.id}`}
                  className="group block h-full rounded-xl border border-fg/10 bg-fg/[0.03] p-5 transition-all hover:border-brand-400/50 hover:bg-fg/[0.05]"
                >
                  <p className="font-medium text-fg">{f.title}</p>
                  <p className="mt-1.5 line-clamp-2 text-sm text-fg/60">{f.intro}</p>
                  <span className="mt-3 inline-block text-sm text-brand-300 group-hover:text-fg">{f.questions.length} questions →</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

import type { Question } from "@/lib/interview-prep";

/**
 * Interview questions as a list of folding cards: the question first, the advice when
 * opened. Uses the browser's own <details>, so it works without JavaScript and is
 * easy to read on a phone.
 */
export function QuestionList({ questions }: { questions: Question[] }) {
  return (
    <ul className="space-y-3">
      {questions.map((item) => (
        <li key={item.q}>
          <details className="group/q rounded-xl border border-fg/10 bg-fg/[0.03] open:border-brand-400/40 open:bg-fg/[0.05]">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4 p-4 sm:p-5">
              <span className="font-medium text-fg">{item.q}</span>
              <span className="mt-0.5 text-fg/45 transition-transform group-open/q:rotate-45" aria-hidden="true">
                +
              </span>
            </summary>
            <div className="px-4 pb-5 sm:px-5">
              <p className="text-xs font-medium uppercase tracking-wide text-fg/45">How to answer</p>
              <ul className="mt-2 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-fg/70">
                {item.tips.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          </details>
        </li>
      ))}
    </ul>
  );
}

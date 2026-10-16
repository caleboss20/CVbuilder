import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/ui/button";
import { QuestionList } from "@/components/marketing/question-list";
import { fieldPrep, generalQuestions, getFieldPrep } from "@/lib/interview-prep";

// Every field is prebuilt from generateStaticParams, so reading params here is fine
export const instant = false;

export function generateStaticParams() {
  return fieldPrep.map((f) => ({ field: f.id }));
}

export async function generateMetadata({ params }: PageProps<"/interview-prep/[field]">): Promise<Metadata> {
  const { field } = await params;
  const prep = getFieldPrep(field);
  if (!prep) return {};
  return {
    title: `${prep.title} Interview Questions and How to Answer Them`,
    description: `${prep.intro} ${prep.questions.length} common questions with advice on how to answer each one.`,
    alternates: { canonical: `/interview-prep/${prep.id}` },
  };
}

export default async function FieldPrepPage({ params }: PageProps<"/interview-prep/[field]">) {
  const { field } = await params;
  const prep = getFieldPrep(field);
  if (!prep) notFound();

  const others = fieldPrep.filter((f) => f.id !== prep.id);

  return (
    <div className="relative overflow-hidden pt-32 pb-24 sm:pt-40">
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-0 -z-10 h-[420px] w-[900px] -translate-x-1/2 rounded-full bg-brand-600/15 blur-[120px]"
      />
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Link href="/interview-prep" className="text-sm text-fg/55 hover:text-fg">
          ← All interview preparation
        </Link>
        <h1 className="mt-4 text-4xl font-medium tracking-tight text-balance text-fg sm:text-5xl">{prep.title} interview questions</h1>
        <p className="mt-4 text-lg leading-relaxed text-fg/65">{prep.intro}</p>

        <section className="mt-10">
          <h2 className="text-2xl font-medium text-fg">Questions for this field</h2>
          <div className="mt-5">
            <QuestionList questions={prep.questions} />
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-medium text-fg">Questions everyone gets asked</h2>
          <div className="mt-5">
            <QuestionList questions={generalQuestions.slice(0, 4)} />
          </div>
          <p className="mt-4 text-sm text-fg/55">
            <Link href="/interview-prep" className="text-brand-300 hover:text-fg">
              See all general questions and the STAR method →
            </Link>
          </p>
        </section>

        <div className="mt-12 rounded-2xl border border-brand-400/30 bg-brand-500/[0.08] p-6">
          <p className="text-lg font-medium text-fg">Get the CV that gets you the interview</p>
          <p className="mt-1 text-sm text-fg/65">Build it free, check it against the job, and track where you have applied.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <ButtonLink href="/builder">Build my CV</ButtonLink>
            <ButtonLink href="/cv-checker" variant="ghost">
              Check my CV
            </ButtonLink>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-lg font-medium text-fg">Other fields</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {others.map((f) => (
              <li key={f.id}>
                <Link
                  href={`/interview-prep/${f.id}`}
                  className="inline-block rounded-md bg-fg/[0.06] px-3.5 py-2 text-sm text-fg/70 hover:text-fg"
                >
                  {f.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

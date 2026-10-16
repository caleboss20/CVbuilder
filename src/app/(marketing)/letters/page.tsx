import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { letterGuides, writerHref } from "@/lib/letter-guides";

export const metadata: Metadata = {
  title: "Free Letter Writer: Scholarship, University, Cover and Reference Letters",
  description:
    "Write a scholarship application letter, a university application letter, a cover letter, a reference request, a thank-you or a follow-up. Free drafts built from your CV.",
  alternates: { canonical: "/letters" },
};

export default function LettersPage() {
  return (
    <div className="relative overflow-hidden pt-32 pb-24 sm:pt-40">
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-0 -z-10 h-[420px] w-[900px] -translate-x-1/2 rounded-full bg-brand-600/15 blur-[120px]"
      />
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-medium tracking-tight text-fg sm:text-5xl">Letters for every step</h1>
          <p className="mt-4 text-base text-fg/65 sm:text-lg">
            Scholarship and university applications, cover letters, reference requests and the short notes around an interview. Pick
            the one you need, and we draft it from your CV.
          </p>
          <div className="mt-6">
            <ButtonLink href="/cover-letter" size="lg">
              Write a letter
            </ButtonLink>
          </div>
        </div>

        <ul className="mt-14 grid gap-4 sm:grid-cols-2">
          {letterGuides.map((g) => (
            <li key={g.slug}>
              <Link
                href={`/letters/${g.slug}`}
                className="group flex h-full flex-col rounded-xl border border-fg/10 bg-fg/[0.03] p-5 transition-all hover:-translate-y-0.5 hover:border-brand-400/50 hover:bg-fg/[0.05] sm:p-6"
              >
                <h2 className="text-lg font-medium text-fg">{g.short}</h2>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-fg/60">{g.blurb}</p>
                <span className="mt-4 text-sm text-brand-300 group-hover:text-fg">Read the guide →</span>
              </Link>
              <Link href={writerHref(g.kind)} className="mt-2 inline-block px-1 py-1 text-sm text-fg/55 hover:text-fg">
                Write it now
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

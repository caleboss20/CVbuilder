import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { letterGuides } from "@/lib/letter-guides";

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
            </li>
          ))}
        </ul>

        {/* For students who already have a letter and only need it signed */}
        <Link
          href="/sign-letter"
          className="group mt-4 flex flex-col gap-1 rounded-xl border border-brand-400/30 bg-brand-500/[0.08] p-5 transition-colors hover:border-brand-400/60 sm:p-6"
        >
          <h2 className="text-lg font-medium text-fg">Have your own letter? Edit it and sign it</h2>
          <p className="text-sm leading-relaxed text-fg/60">
            Type a letter, or upload a PDF or Word file and change the words. Add your signature under “Yours faithfully” and download it. No forms to fill in.
          </p>
          <span className="mt-2 text-sm text-brand-300 group-hover:text-fg">Write or sign a letter →</span>
        </Link>
      </div>
    </div>
  );
}

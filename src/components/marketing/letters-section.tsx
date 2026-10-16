import Link from "next/link";
import { letterGuides } from "@/lib/letter-guides";
import { SectionHeading } from "./section-heading";

/**
 * Puts every letter the writer can draft on the homepage, so a student looking for a
 * scholarship letter or a reference request sees at once that CV11 does it. Each card
 * opens the guide for that letter, which leads on to the writer.
 */
export function LettersSection() {
  return (
    <section id="letters" aria-labelledby="letters-heading" className="relative scroll-mt-20 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="letters-heading"
          eyebrow="Letters"
          title={
            <>
              A <em>letter</em> for every step
            </>
          }
          description="Scholarship and university applications, cover letters, reference requests, thank-you notes and follow-ups. We draft each one from your CV, you make it yours."
        />

        <ul className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {letterGuides.map((g, i) => (
            <li key={g.slug}>
              <Link
                href={`/letters/${g.slug}`}
                className="group flex h-full flex-col rounded-xl border border-fg/10 bg-fg/[0.03] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-400/50 hover:bg-fg/[0.05] hover:shadow-[0_0_40px_-14px_rgb(124_128_255/0.7)] sm:p-5"
              >
                {/* The first card is the scholarship letter, which students ask for most, so it is marked */}
                {i === 0 && (
                  <span className="mb-2 w-fit rounded-full bg-brand-500/20 px-2.5 py-0.5 text-[11px] font-medium text-brand-300">Popular</span>
                )}
                <h3 className="font-medium text-fg">{g.short}</h3>
                <p className="mt-1 flex-1 text-sm leading-relaxed text-fg/60">{g.blurb}</p>
                <span className="mt-3 text-sm text-brand-300 group-hover:text-fg">Write it →</span>
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-center">
          <Link href="/letters" className="text-sm font-medium text-brand-300 hover:text-fg">
            See all letters →
          </Link>
        </p>
      </div>
    </section>
  );
}

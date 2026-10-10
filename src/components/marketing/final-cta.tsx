import { ButtonLink } from "@/components/ui/button";
import { Magnetic } from "@/components/ui/magnetic";
import { CvTemplate } from "@/components/cv/cv-templates";
import { getCvExample, type CvExample } from "@/lib/cv-examples";
import { InView } from "./in-view";

const perks = [
  "Templates that pass hiring software",
  "AI help to make your wording stronger",
  "Free PDF download with no watermark",
];

// Three different designs so the stack shows real variety
const stack = ["law", "nursing", "data-science"]
  .map((slug) => getCvExample(slug))
  .filter((e): e is CvExample => Boolean(e));

/** Position of each page in the fan: back left, back right, front centre. */
const fan = [
  "left-0 top-10 -rotate-[9deg] [@media(hover:hover)]:group-hover:-translate-x-6 [@media(hover:hover)]:group-hover:-rotate-[13deg] [@media(hover:none)]:group-data-[inview=true]:-translate-x-6 [@media(hover:none)]:group-data-[inview=true]:-rotate-[13deg]",
  "right-0 top-10 rotate-[9deg] [@media(hover:hover)]:group-hover:translate-x-6 [@media(hover:hover)]:group-hover:rotate-[13deg] [@media(hover:none)]:group-data-[inview=true]:translate-x-6 [@media(hover:none)]:group-data-[inview=true]:rotate-[13deg]",
  "left-1/2 top-0 z-10 -translate-x-1/2 [@media(hover:hover)]:group-hover:-translate-y-3 [@media(hover:none)]:group-data-[inview=true]:-translate-y-3",
];

export function FinalCta() {
  return (
    <section aria-labelledby="final-cta-heading" className="px-4 pb-24 sm:px-6 lg:px-8">
      <div className="relative mx-auto grid max-w-6xl overflow-hidden rounded-2xl border border-brand-400/30 bg-linear-to-br from-brand-600/30 via-ink-900 to-ink-950 lg:grid-cols-[1fr_1.05fr]">
        <div aria-hidden="true" className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_70%)]" />
        <div
          aria-hidden="true"
          className="absolute -right-20 top-10 h-80 w-[520px] max-w-full rounded-full bg-brand-500/30 blur-[110px]"
        />

        {/* Text */}
        <div className="relative px-6 py-14 sm:px-12 sm:py-16 lg:py-20">
          <h2
            id="final-cta-heading"
            className="text-3xl font-medium tracking-tight text-balance text-fg sm:text-5xl"
          >
            Ready to build your CV?
          </h2>
          <p className="mt-4 max-w-md text-base text-fg/65 sm:text-lg">
            Answer a few simple questions about your course, skills and experience, and get a
            professional CV ready in minutes. It’s free for students.
          </p>

          <ul className="mt-7 space-y-3">
            {perks.map((p) => (
              <li key={p} className="flex items-center gap-3 text-[15px] text-fg/80">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-500/20 text-brand-300 ring-1 ring-brand-400/40">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                </span>
                {p}
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Magnetic className="w-full sm:w-auto">
              <ButtonLink href="/builder" size="lg" className="w-full">
                Build my CV
              </ButtonLink>
            </Magnetic>
            <Magnetic className="w-full sm:w-auto">
              <ButtonLink href="/cv-examples" variant="ghost" size="lg" className="w-full">
                See CV examples
              </ButtonLink>
            </Magnetic>
          </div>
        </div>

        {/* Fanned stack of real CV pages, rising from the bottom edge */}
        <InView className="group relative h-[340px] sm:h-[420px] lg:h-auto">
          <div aria-hidden="true" className="contents">
          <div className="absolute inset-x-0 bottom-0 top-8 mx-auto max-w-[560px] lg:top-20">
            {stack.map((example, i) => (
              <div
                key={example.slug}
                className={`absolute transition-transform duration-500 ease-out ${fan[i]}`}
              >
                <MiniPage example={example} />
              </div>
            ))}
          </div>
          {/* Fade the pages into the card's bottom edge */}
          <div className="absolute inset-x-0 bottom-0 z-20 h-16 bg-linear-to-t from-ink-950 to-transparent" />
          </div>
        </InView>
      </div>
    </section>
  );
}

/** A full A4 CV page laid out at 794px and shrunk to a card-sized preview. */
function MiniPage({ example }: { example: CvExample }) {
  return (
    <div className="h-[300px] w-[212px] overflow-hidden rounded-md bg-white shadow-[0_20px_50px_-12px_rgb(0_0_0/0.55),0_0_40px_-10px_rgb(124_128_255/0.45)] ring-1 ring-black/5 sm:h-[360px] sm:w-[254px] lg:h-[440px] lg:w-[311px]">
      <div className="@container flex min-h-[1123px] w-[794px] origin-top-left scale-[0.267] flex-col sm:scale-[0.32] lg:scale-[0.392] [&>*]:flex-1">
        <CvTemplate example={example} />
      </div>
    </div>
  );
}

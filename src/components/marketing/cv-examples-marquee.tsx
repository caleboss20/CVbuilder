import Link from "next/link";
import { cvExamples, type CvExample } from "@/lib/cv-examples";
import { CvIcon } from "@/components/cv/cv-icon";
import { SectionHeading } from "./section-heading";

const rows = [0, 1, 2].map((r) => cvExamples.filter((e) => e.row === r));
const speeds = ["48s", "42s", "52s"];

export function CvExamplesMarquee() {
  return (
    <section
      id="cv-examples"
      aria-labelledby="cv-examples-heading"
      className="relative scroll-mt-20 overflow-hidden py-24 sm:py-32"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="cv-examples-heading"
          eyebrow="CV examples"
          title={
            <>
              See a real CV for <em>your course</em>
            </>
          }
          description="Every example is written for students in Ghana, with tips on what recruiters in that field look for. Pick yours and start from there."
        />
      </div>

      <div className="mt-14 space-y-4 [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        {rows.map((items, i) => (
          <MarqueeRow key={i} items={items} reverse={i === 1} duration={speeds[i]} />
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link
          href="/cv-examples"
          className="inline-flex items-center gap-2 text-sm font-medium text-brand-300 transition-colors hover:text-white"
        >
          View all CV examples
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>
    </section>
  );
}

function MarqueeRow({
  items,
  reverse,
  duration,
}: {
  items: CvExample[];
  reverse: boolean;
  duration: string;
}) {
  return (
    <div className="group/row flex overflow-hidden motion-reduce:overflow-x-auto">
      {/* Two identical lists slide by their own width, so the loop never shows a gap */}
      {[0, 1].map((copy) => (
        <ul
          key={copy}
          aria-hidden={copy === 1 || undefined}
          style={{ animationDuration: duration }}
          className={`flex shrink-0 gap-3 pr-3 group-hover/row:[animation-play-state:paused] ${
            reverse ? "animate-marquee-reverse" : "animate-marquee"
          }`}
        >
          {[...items, ...items].map((e, i) => (
            <li key={e.slug + i}>
              <Link
                href={`/cv-examples/${e.slug}`}
                tabIndex={copy === 1 || i >= items.length ? -1 : undefined}
                className="flex items-center gap-2.5 whitespace-nowrap rounded-full border border-white/10 bg-white/[0.04] py-1.5 pl-1.5 pr-4 text-sm text-white/80 transition-all duration-300 hover:border-brand-400/60 hover:bg-brand-500/10 hover:text-white hover:shadow-[0_0_24px_-4px_rgb(124_128_255/0.7)]"
              >
                <span className="grid size-8 place-items-center rounded-full bg-brand-500/15 text-brand-300">
                  <CvIcon name={e.icon} />
                </span>
                {e.course} CV
              </Link>
            </li>
          ))}
        </ul>
      ))}
    </div>
  );
}

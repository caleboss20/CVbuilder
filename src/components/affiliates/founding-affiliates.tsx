import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

/**
 * The photo on the left: two people toasting with coffee over their laptops, supplied by the owner (735 x 1103 px;
 * confirm its licence before the site goes public). Swap this one line when a new photo arrives.
 */
const PHOTO = { src: "/images/affiliates/founding-cheers.webp", alt: "Two people toasting with coffee cups over their laptops", position: "50% 45%" };

/** The words that scroll along the ribbon on top. */
const RIBBON = ["Founding affiliates", `Only ${siteConfig.affiliates.spots} spots`, "Free to join", "Apply now"];

const steps = ["Apply in two minutes. It is free.", "Get your personal code and link.", `Help people with their CV and get paid on ${siteConfig.affiliates.payoutDay}.`];

/** A highlighted word, like a marker pen. */
function Mark({ children }: { children: string }) {
  return <mark className="rounded bg-[#d4d6ff] px-1.5 py-0.5 font-bold text-zinc-950">{children}</mark>;
}

/**
 * The call-to-action section after "Why join", in the layout of a software affiliate page: a ribbon of words
 * sliding along the top, then a photo on the left and the offer on the right. It follows the usual
 * principles of a page that makes people sign up: one clear action, a headline about what they get, the
 * numbers that matter picked out, three easy steps, real scarcity (we are starting with a few founding
 * affiliates), and the worry removed right under the button (free, no targets).
 */
export function FoundingAffiliates({ photo = PHOTO }: { photo?: { src: string; alt: string; position: string } }) {
  const ribbon = [...RIBBON, ...RIBBON, ...RIBBON, ...RIBBON];
  return (
    <section id="join" className="scroll-mt-24 bg-white text-zinc-950">
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          @keyframes ribbon-slide { from { transform: translateX(0); } to { transform: translateX(-50%); } }
          .ribbon-slide { animation: ribbon-slide 38s linear infinite; }
        }
      `}</style>

      {/* The ribbon: the same words twice over, sliding left forever */}
      <div aria-hidden="true" className="overflow-hidden bg-[#c9caff] py-3.5">
        <div className="ribbon-slide flex w-max gap-10 whitespace-nowrap text-sm font-semibold uppercase tracking-wide text-[#16145f]">
          {[...ribbon, ...ribbon].map((word, i) => (
            <span key={i} className="flex items-center gap-10">
              {word}
              <span className="size-1.5 rounded-full bg-[#16145f]" />
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto grid max-w-[1110px] items-center gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-2 lg:gap-20">
        {/* Photo */}
        <div className="relative mx-auto w-full max-w-[520px] lg:mx-0">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[28px] bg-[#e9ecff]">
            <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 1024px) 520px, 90vw" className="object-cover" style={{ objectPosition: photo.position }} />
          </div>
          {/* Stickers, as on the hero */}
          <span className="absolute -left-3 top-8 -rotate-6 rounded-full bg-[#5b5fe0] px-4 py-2 text-sm font-semibold text-white shadow-lg sm:-left-6">Free to join</span>
          <span className="absolute -right-2 bottom-12 rotate-3 rounded-full bg-[#16145f] px-4 py-2 text-sm font-semibold text-white shadow-lg sm:-right-5">No targets</span>
        </div>

        {/* The offer */}
        <div>
          <h2 className="text-balance text-[2rem] font-semibold leading-[1.05] tracking-[-0.04em] sm:text-[36px] sm:leading-[36px]">Start earning from your very first CV</h2>
          <p className="mt-6 max-w-[460px] text-base font-medium leading-6 tracking-[-0.02em] text-zinc-700 sm:text-[17px] sm:leading-7">
            Earn <Mark>{siteConfig.affiliates.commission}</Mark> of every CV payment made with your code, and keep <Mark>100%</Mark> of any fee you charge for your own time. Help one person or a hundred: there is no cap.
          </p>

          <ol className="mt-8 max-w-[460px] divide-y divide-zinc-200 border-y border-zinc-200 text-base font-medium tracking-[-0.02em]">
            {steps.map((step, i) => (
              <li key={step} className="flex gap-3 py-4">
                <span className="text-[#5b5fe0]">{i + 1}.</span>
                {step}
              </li>
            ))}
          </ol>

          <div className="mt-9">
            <Link
              href="/affiliates/join"
              className="inline-flex h-14 items-center gap-2 rounded-lg bg-[#5b5fe0] px-8 text-base font-semibold text-white transition-colors hover:bg-[#4a4ed0]"
            >
              Claim my founding spot
              <span aria-hidden="true">→</span>
            </Link>
            <p className="mt-4 text-sm text-zinc-500">
              We are starting with {siteConfig.affiliates.spots} founding affiliates. Free to join, no targets, and we reply within a few days.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

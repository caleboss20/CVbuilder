import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

/** Photo: Pexels photo 30511162 (free to use, no credit needed): a graduate laughing under a confetti cannon. */
const PHOTO = { src: "/images/affiliates/celebrate.jpg", alt: "A young woman in a graduation cap laughing as confetti flies around her", position: "38% 42%" };

/** Small paper pieces scattered around the round photo, in the site's colours: [left %, top %, width px, height px, rotation, colour]. */
const CONFETTI: [number, number, number, number, number, string][] = [
  [4, 12, 22, 9, -28, "#c7c9ff"],
  [14, 3, 16, 7, 38, "#f4b400"],
  [88, 8, 24, 9, 24, "#9a9dff"],
  [96, 30, 14, 14, 0, "#ffffff"],
  [-1, 46, 14, 14, 0, "#7c80ff"],
  [92, 66, 22, 8, -34, "#f4b400"],
  [7, 82, 20, 8, 30, "#ffffff"],
  [78, 92, 16, 16, 0, "#c7c9ff"],
  [24, 96, 24, 9, -20, "#9a9dff"],
];

/**
 * A celebration band before the questions, in the manner of a big network's closing section: a deep violet
 * background, a round photo with paper confetti on the left, and on the right a large headline over an accent
 * bar, one short paragraph and a white pill button. The picture of someone celebrating answers the visitor's
 * last question ("is it worth it?") with a feeling, just before the plain answers below.
 */
export function CelebrateCta() {
  return (
    <section className="bg-[#16145f] text-white">
      <div className="mx-auto grid max-w-[1110px] items-center gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[minmax(0,500px)_1fr] lg:gap-20">
        {/* The round photo, with confetti */}
        <div className="relative mx-auto w-full max-w-[420px] lg:mx-0 lg:max-w-none">
          <div className="relative aspect-square w-full overflow-hidden rounded-full bg-[#2b2896]">
            <Image src={PHOTO.src} alt={PHOTO.alt} fill sizes="(min-width: 1024px) 500px, 85vw" className="object-cover" style={{ objectPosition: PHOTO.position }} />
          </div>
          {CONFETTI.map(([left, top, w, h, turn, colour], i) => (
            <span
              key={i}
              aria-hidden="true"
              className="absolute rounded-[2px]"
              style={{ left: `${left}%`, top: `${top}%`, width: w, height: h, transform: `rotate(${turn}deg)`, backgroundColor: colour }}
            />
          ))}
        </div>

        {/* The words */}
        <div>
          <h2 className="text-balance text-[2.25rem] font-medium leading-[1.05] tracking-[-0.035em] sm:text-[56px] sm:leading-[56px]">Turn one CV into your first payout</h2>
          <div aria-hidden="true" className="mt-7 h-1.5 w-[260px] rounded-full bg-[#9a9dff] sm:w-[420px]" />
          <p className="mt-8 max-w-[560px] text-lg leading-8 text-white/85 sm:text-xl sm:leading-9">
            Every CV you help finish puts someone closer to a job, and you a little closer to getting paid. Join free, share your code, and watch your first {siteConfig.affiliates.commission} come in.
          </p>
          <Link
            href="/affiliates/join"
            className="mt-9 inline-flex h-16 items-center gap-2 rounded-full bg-white px-9 text-lg font-semibold text-[#16145f] transition-colors hover:bg-[#e6e7ff]"
          >
            Become an affiliate
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

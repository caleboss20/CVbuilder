import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

/** The photo: a young woman in an orange top and denim dungarees, smiling at her phone against a yellow wall (supplied by the owner). */
const PHOTO = { src: "/images/affiliates/celebrate.webp", alt: "A smiling young woman holding her phone in front of a yellow wall", position: "50% 36%" };

/**
 * Paper confetti: thin strips and a few squares in pink, red, blue, green, yellow, violet and white, scattered in
 * a ring that runs across the edge of the round photo, some on the picture and some outside it. The positions come
 * from a fixed formula, so the server and the browser always draw exactly the same pieces.
 */
const COLOURS = ["#ff5fa2", "#ff4d5e", "#4da3ff", "#3ddc97", "#f4b400", "#b9a6ff", "#ffffff", "#ff8fc0"];
const CONFETTI = (() => {
  let seed = 7;
  const next = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  return Array.from({ length: 44 }, () => {
    const angle = next() * Math.PI * 2;
    const reach = 0.42 + next() * 0.78; // 0.42 is well inside the photo, 1 its edge, 1.2 a little way out
    const strip = next() > 0.22;
    return {
      left: 50 + Math.cos(angle) * reach * 50,
      top: 50 + Math.sin(angle) * reach * 50,
      w: strip ? 16 + Math.round(next() * 22) : 8 + Math.round(next() * 6),
      h: strip ? 5 + Math.round(next() * 3) : 8 + Math.round(next() * 6),
      turn: Math.round(next() * 180 - 90),
      colour: COLOURS[Math.floor(next() * COLOURS.length)],
    };
  });
})();

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
          {CONFETTI.map((p, i) => (
            <span
              key={i}
              aria-hidden="true"
              className="absolute rounded-[2px]"
              style={{ left: `${p.left}%`, top: `${p.top}%`, width: p.w, height: p.h, transform: `rotate(${p.turn}deg)`, backgroundColor: p.colour }}
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

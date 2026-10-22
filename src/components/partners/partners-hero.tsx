import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

/** The picture in the arch on the right. Swap this one line when a new photo arrives. */
// Photo: Pexels photo 7658276 (free to use, no credit needed), 1400 px wide.
const PHOTO = { src: "/images/partners/hero-woman.jpg", alt: "A smiling young woman in an orange shirt holding a folder of documents", position: "50% 16%" };

/**
 * A small label on a splash of paint: an irregular blob with a few flying drops, in a bright violet, behind
 * the words. It replaces a plain rounded tag.
 */
function PaintLabel({ children }: { children: string }) {
  return (
    <span className="relative inline-flex items-center px-8 py-3">
      <svg aria-hidden="true" viewBox="0 0 280 72" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <path
          fill="#7c80ff"
          d="M22 40c-9-16 8-31 34-30 18-7 52-7 78-2 32-8 72-6 100 4 26 4 42 16 38 30-3 13-22 24-46 24-28 8-62 6-96 3-34 5-70 3-92-6-10-6-16-12-16-23Z"
        />
        <circle cx="262" cy="12" r="5" fill="#7c80ff" />
        <circle cx="273" cy="26" r="3" fill="#7c80ff" />
        <circle cx="10" cy="58" r="4" fill="#7c80ff" />
        <circle cx="48" cy="4" r="2.5" fill="#7c80ff" />
        <path fill="#a9acff" d="M70 14c18-5 40-5 58-2-20 1-40 3-58 2Z" />
      </svg>
      <span className="relative text-[13px] font-semibold uppercase tracking-[0.16em] text-white">{children}</span>
    </span>
  );
}

/**
 * The first screen of the partner site, with the measurements of a software affiliate page: a 944 px wide
 * block in the middle of the page, the words in a 472 px column on the left (a label, a 60 px headline,
 * a 20 px paragraph and a 48 px button, each 24 px below the one before), then a 58 px gap, then a
 * 414 x 445 photo with a fully round top, standing on the bottom edge of the hero. The deep blue-violet
 * background carries on from the navbar. What makes it CV11's own: the paint-splash label and the round
 * commission badge that sits low on the arch's edge, clear of the face.
 */
export function PartnersHero({ photo = PHOTO }: { photo?: { src: string; alt: string; position?: string } }) {
  return (
    <section className="relative overflow-hidden bg-[#16145f]">
      {/* A soft violet glow behind the photo */}
      <div aria-hidden="true" className="pointer-events-none absolute right-[8%] top-0 size-[520px] rounded-full bg-[#7c80ff]/30 blur-[120px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-40 bottom-0 size-[380px] rounded-full bg-[#3a36d6]/40 blur-[110px]" />

      <div className="relative mx-auto grid w-full max-w-[944px] gap-8 px-5 pt-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_414px] lg:gap-[58px] lg:px-0 lg:pt-6">
        {/* Words */}
        <div className="flex flex-col items-start pb-2 lg:pb-12 lg:pt-6">
          <PaintLabel>Partner programme</PaintLabel>
          <h1 className="mt-6 text-balance text-[2.5rem] font-medium leading-[1.05] tracking-[-0.75px] text-white sm:text-[60px] sm:leading-[60px]">
            Help people get hired. Get paid.
          </h1>
          <p className="mt-6 max-w-[420px] text-lg leading-7 text-white/85 sm:text-xl">
            Earn {siteConfig.partners.commission} on every CV paid for with your code. Paid straight to your MoMo.
          </p>
          <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-5">
            <Link
              href="/partners/join"
              className="inline-flex h-12 items-center gap-2 whitespace-nowrap rounded-lg bg-white px-5 text-lg font-medium text-[#16145f] sm:px-6 transition-colors hover:bg-[#e6e7ff]"
            >
              Join the programme
              <span aria-hidden="true">→</span>
            </Link>
            <p className="text-sm text-white/70">Free to join. No targets.</p>
          </div>
        </div>

        {/* Photo in a round-topped arch, standing on the bottom edge */}
        <div className="relative mx-auto w-full max-w-[330px] self-end lg:mx-0 lg:max-w-none">
          <div className="relative h-[320px] w-full overflow-hidden rounded-t-full bg-[#e9ecff] sm:h-[380px] lg:h-[445px]">
            <Image src={photo.src} alt={photo.alt} fill priority sizes="(min-width: 1024px) 414px, 330px" className="object-cover" style={{ objectPosition: photo.position ?? "50% 16%" }} />
          </div>
          {/* The commission badge: small, and low on the left edge so it never covers the face */}
          <div
            aria-hidden="true"
            className="absolute -bottom-0 left-0 grid size-[84px] -rotate-6 place-items-center rounded-full bg-[#7c80ff] text-center text-white shadow-[0_14px_30px_-12px_rgba(0,0,0,0.6)] sm:bottom-6 sm:size-[96px] lg:-left-10 lg:bottom-16 lg:size-[108px]"
          >
            <span className="leading-none">
              <span className="block text-2xl font-semibold tracking-tight sm:text-3xl">{siteConfig.partners.commission}</span>
              <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-wide text-white/90">commission</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

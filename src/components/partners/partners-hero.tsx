import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

/** The picture in the arch on the right. Swap this one line when a new photo arrives. */
const PHOTO = { src: "/images/partners/hero-team.webp", alt: "Friends laughing together while looking at a tablet" };

/**
 * The first screen of the partner site, laid out like a software affiliate page: a deep blue background that
 * carries on from the navbar, the words on the left (a small label, a 60px medium-weight headline, a short
 * paragraph and one button), and a photo standing on the bottom edge on the right. What makes it CV11's own:
 * the photo sits in an arch rather than a box, and a round commission badge overlaps its edge.
 */
export function PartnersHero() {
  return (
    <section className="relative overflow-hidden bg-[#16145f]">
      {/* A soft violet glow behind the photo */}
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-0 size-[620px] rounded-full bg-[#7c80ff]/35 blur-[120px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-40 bottom-0 size-[420px] rounded-full bg-[#3a36d6]/40 blur-[110px]" />

      <div className="relative mx-auto grid max-w-[1200px] items-end gap-10 px-5 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:gap-6">
        {/* Words */}
        <div className="pb-4 pt-10 lg:self-center lg:pb-24 lg:pt-20">
          <p className="w-fit rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-[#c7c9ff]">Partner programme</p>
          <h1 className="mt-6 max-w-[520px] text-[2.5rem] font-medium leading-[1.05] tracking-[-0.75px] text-white sm:text-[60px] sm:leading-[60px]">
            Help people get hired. Get paid for it.
          </h1>
          <p className="mt-6 max-w-[480px] text-base leading-7 text-white/85 sm:text-lg sm:leading-8">
            Earn {siteConfig.partners.commission} commission on every CV that someone you help pays for on CV11. Share your code, and get paid straight to your mobile money.
          </p>
          <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-5">
            <Link
              href="/partners/join"
              className="inline-flex h-12 items-center gap-2 rounded-lg bg-white px-6 text-base font-medium text-[#16145f] transition-colors hover:bg-[#e6e7ff]"
            >
              Join the programme
              <span aria-hidden="true">→</span>
            </Link>
            <p className="text-sm text-white/70">Free to join. No targets.</p>
          </div>
        </div>

        {/* Photo in an arch, standing on the bottom edge */}
        <div className="relative mx-auto w-full max-w-[440px] lg:max-w-none">
          <div className="relative ml-auto h-[360px] w-full max-w-[440px] overflow-hidden rounded-t-[220px] bg-[#e9ecff] sm:h-[460px] lg:h-[540px]">
            <Image src={PHOTO.src} alt={PHOTO.alt} fill priority sizes="(min-width: 1024px) 440px, 90vw" className="object-cover object-[52%_30%]" />
          </div>
          {/* The commission badge, overlapping the arch's edge */}
          <div
            aria-hidden="true"
            className="absolute left-0 top-16 grid size-[118px] -rotate-6 place-items-center rounded-full bg-[#7c80ff] text-center text-white shadow-[0_18px_40px_-14px_rgba(0,0,0,0.6)] sm:size-[132px] lg:-left-6"
          >
            <span className="leading-none">
              <span className="block text-4xl font-semibold tracking-tight sm:text-[2.6rem]">{siteConfig.partners.commission}</span>
              <span className="mt-1 block text-xs font-medium uppercase tracking-wide text-white/90">commission</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

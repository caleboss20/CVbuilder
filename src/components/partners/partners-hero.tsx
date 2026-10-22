import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

/**
 * The pictures in the hero. The big photo sits faded behind the gradient. When the phone (and laptop) pictures
 * arrive, put their paths in PHONE and LAPTOP: they are drawn at the lower left and right of the headline.
 * Leave them null and the hero is just the photo, the gradient and the words.
 */
const PHOTO = { src: "/images/partners/hero-team.webp", width: 1199, height: 897, alt: "" };
const PHONE: { src: string; width: number; height: number; alt: string } | null = null;
const LAPTOP: { src: string; width: number; height: number; alt: string } | null = null;

/**
 * The first screen of the partner site, laid out like a retail partner page: centred words over a soft
 * gradient with a faded photo, one black button, and one line about the commission. No cards, no borders.
 * It starts under the navbar (the layout pulls it up by the navbar's height).
 */
export function PartnersHero() {
  return (
    <section className="relative -mt-[70px] overflow-hidden pt-[70px]">
      {/* The photo, faded, then the gradient over it */}
      <Image src={PHOTO.src} alt={PHOTO.alt} width={PHOTO.width} height={PHOTO.height} priority sizes="100vw" className="absolute inset-0 h-full w-full object-cover object-[50%_20%] opacity-40 mix-blend-multiply" />
      <div aria-hidden="true" className="absolute inset-0 bg-linear-to-b from-[#a99dff] via-[#d9d4ff]/90 to-white" />

      {PHONE && (
        <Image src={PHONE.src} alt={PHONE.alt} width={PHONE.width} height={PHONE.height} className="pointer-events-none absolute bottom-0 left-[3%] hidden h-[78%] w-auto lg:block" />
      )}
      {LAPTOP && (
        <Image src={LAPTOP.src} alt={LAPTOP.alt} width={LAPTOP.width} height={LAPTOP.height} className="pointer-events-none absolute bottom-0 right-[3%] hidden h-[70%] w-auto lg:block" />
      )}

      <div className="relative mx-auto flex min-h-[600px] max-w-3xl flex-col items-center px-5 pb-24 pt-16 text-center sm:pt-20 lg:min-h-[640px]">
        <h1 className="text-[2.9rem] font-extrabold leading-[1.1] tracking-tight text-zinc-950 sm:text-6xl lg:text-[64px]">
          Become a CV11
          <br />
          Partner
        </h1>
        <p className="mt-8 max-w-[484px] text-lg leading-8 text-zinc-600 sm:text-xl">
          Earn commissions by helping people get their CV done and sharing your code. Simple, rewarding, and free to join.
        </p>

        <div className="relative mt-9">
          <Link
            href="/partners/join"
            className="inline-flex h-[44px] items-center rounded-lg bg-zinc-950 px-7 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
          >
            Join Now for Free
          </Link>
          {/* A hand-drawn arrow pointing at the button */}
          <svg aria-hidden="true" viewBox="0 0 80 90" className="absolute -right-20 -top-3 hidden h-20 w-16 text-zinc-950 sm:block" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 8C48 4 74 28 62 68" />
            <path d="M50 58l12 14 12-16" />
          </svg>
        </div>

        <p className="mt-14 text-xl leading-9 text-zinc-600 sm:text-[25px] sm:leading-[48px]">
          Earn up to{" "}
          <mark className="rounded-sm bg-[#c8c2ff] px-1.5 font-bold text-zinc-950">{siteConfig.partners.commission} commission</mark>
          <br className="hidden sm:block" /> by becoming a CV11 partner
        </p>
      </div>
    </section>
  );
}

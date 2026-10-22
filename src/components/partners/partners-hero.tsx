import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

/**
 * The picture behind the hero. Swap this one line when the new photo (or the phone picture) arrives: any
 * wide image works, and its left side is covered by the green gradient so the words stay readable.
 */
const HERO_IMAGE = { src: "/images/partners/hero-team.webp", width: 1199, height: 897, alt: "A group of friends laughing together while looking at a tablet" };

const trust = ["Free to join", "Paid by mobile money", "No targets, no fees"];

const facts = [
  { big: siteConfig.partners.commission, small: "for every CV paid with your code" },
  { big: "MoMo", small: "MTN, Telecel and AirtelTigo" },
  { big: "Monthly", small: `payouts on ${siteConfig.partners.payoutDay}` },
  { big: "GH₵ 0", small: "to join, ever" },
];

function Tick({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <circle cx="10" cy="10" r="10" fill="#f4b400" />
      <path d="M5.8 10.3l2.8 2.8 5.6-5.8" fill="none" stroke="#0b3d2e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * The first screen of the partner site, laid out like a large retail partner page: one big picture across the
 * whole width, a gradient that carries the words, a single main button with a quiet "log in" beside it, small
 * trust points, and a row of plain facts that sits on the picture's lower edge. The facts are how the
 * programme really works: no made-up numbers.
 */
export function PartnersHero() {
  return (
    <section className="relative bg-[#faf7f0]">
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          @keyframes partner-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
          .partner-float { animation: partner-float 5s ease-in-out infinite; }
          .partner-float-slow { animation: partner-float 6.5s ease-in-out infinite 0.8s; }
        }
      `}</style>

      <div className="relative min-h-[640px] overflow-hidden bg-[#0b3d2e] lg:min-h-[720px]">
        {/* The big picture, pushed to the right so the people stay clear of the words */}
        <Image
          src={HERO_IMAGE.src}
          alt={HERO_IMAGE.alt}
          width={HERO_IMAGE.width}
          height={HERO_IMAGE.height}
          priority
          sizes="100vw"
          className="absolute inset-0 h-full w-full object-cover object-[68%_6%]"
        />
        {/* Gradient 1: green from the left (or the top on a phone), so the headline reads on any photo */}
        <div aria-hidden="true" className="absolute inset-0 bg-linear-to-b from-[#0b3d2e]/95 via-[#0b3d2e]/80 to-[#0b3d2e]/55 lg:bg-linear-to-r lg:from-[#0b3d2e] lg:from-30% lg:via-[#0b3d2e]/80 lg:via-52% lg:to-[#0b3d2e]/5" />
        {/* Gradient 2: the bottom of the picture melts into the page below */}
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-44 bg-linear-to-b from-transparent to-[#faf7f0]" />
        {/* A soft gold glow behind the headline */}
        <div aria-hidden="true" className="absolute -left-40 top-10 size-[520px] rounded-full bg-[#f4b400]/15 blur-3xl" />

        <div className="relative mx-auto flex min-h-[640px] max-w-6xl items-center px-4 pb-40 pt-14 sm:px-6 lg:min-h-[720px] lg:pt-10">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-white ring-1 ring-white/20 backdrop-blur">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-[#f4b400]" />
              CV11 Partners
            </p>
            <h1 className="mt-6 text-[2.75rem] font-semibold leading-[1.04] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Help people get hired.
              <span className="mt-1 block">
                Get paid{" "}
                <span className="relative inline-block text-[#f4b400]">
                  every time.
                  <svg aria-hidden="true" viewBox="0 0 300 14" preserveAspectRatio="none" className="absolute -bottom-2 left-0 h-3 w-full">
                    <path d="M3 9C60 2 130 2 297 8" fill="none" stroke="#f4b400" strokeWidth="5" strokeLinecap="round" />
                  </svg>
                </span>
              </span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-white/85">
              Earn <b className="text-white">{siteConfig.partners.commission}</b> for every CV that someone you help pays for on CV11. Share your code, keep any fee you charge for your own time, and get paid straight to your MoMo.
            </p>

            <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <Link
                href="/partners/join"
                className="inline-flex h-14 items-center gap-2 rounded-full bg-[#f4b400] px-8 text-base font-semibold text-[#0b3d2e] shadow-[0_14px_34px_-12px_rgba(244,180,0,0.8)] transition-all hover:-translate-y-0.5 hover:bg-[#ffc61a]"
              >
                Become a partner
                <span aria-hidden="true">→</span>
              </Link>
              <Link href="/partners/dashboard" className="text-[15px] font-medium text-white underline decoration-[#f4b400] decoration-2 underline-offset-4 hover:decoration-white">
                Already a partner? Log in
              </Link>
            </div>

            <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-white/85">
              {trust.map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <Tick className="size-5" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Examples of what a partner sees. They are illustrations, not real payments. */}
        <div className="partner-float absolute right-[8%] top-[22%] hidden items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-2xl lg:flex" aria-hidden="true">
          <span className="grid size-10 place-items-center rounded-full bg-[#e6f4ec] text-sm font-bold text-[#0f6b4a]">CV</span>
          <div>
            <p className="text-xs text-[#5b6c63]">New CV paid with your code</p>
            <p className="text-base font-semibold text-[#0f6b4a]">+ {siteConfig.partners.commission}.00</p>
          </div>
        </div>
        <div className="partner-float-slow absolute bottom-[26%] right-[4%] hidden items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-2xl lg:flex" aria-hidden="true">
          <span className="grid size-10 place-items-center rounded-full bg-[#fff4cc] text-sm font-bold text-[#8a6400]">₵</span>
          <div>
            <p className="text-xs text-[#5b6c63]">MoMo payout on the 1st</p>
            <p className="text-base font-semibold text-[#0d2b21]">GH₵ 120.00</p>
          </div>
        </div>
      </div>

      {/* Plain facts, in the place other programmes put their big numbers */}
      <div className="relative z-10 mx-auto -mt-28 max-w-6xl px-4 pb-14 sm:px-6 lg:-mt-24">
        <dl className="grid grid-cols-2 overflow-hidden rounded-3xl bg-white shadow-[0_24px_60px_-28px_rgba(13,43,33,0.5)] ring-1 ring-[#0d2b21]/10 lg:grid-cols-4">
          {facts.map((f, i) => (
            <div key={f.big} className={`p-5 sm:p-7 ${i % 2 === 1 ? "border-l border-[#0d2b21]/10" : ""} ${i >= 2 ? "border-t border-[#0d2b21]/10 lg:border-t-0" : ""} ${i >= 1 ? "lg:border-l lg:border-[#0d2b21]/10" : ""}`}>
              <dt className="text-2xl font-semibold tracking-tight text-[#0f6b4a] sm:text-3xl">{f.big}</dt>
              <dd className="mt-1 text-sm leading-snug text-[#3d5348]">{f.small}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-center text-[11px] uppercase tracking-wide text-[#0d2b21]/40">The cards on the picture are examples</p>
      </div>
    </section>
  );
}

import Link from "next/link";
import type { ReactNode } from "react";
import { siteConfig } from "@/lib/site";

/** The reasons shown beside the form; they read from `siteConfig` so the numbers are never out of step. */
const REASONS = [
  `Earn ${siteConfig.affiliates.commission} of every CV paid for with your code`,
  "Free to join, nothing to buy",
  "Paid straight to your mobile money",
  `${siteConfig.affiliates.spots} founding spots, reviewed by hand`,
];

/**
 * The sign-up and log-in screen of the affiliate site, split in two as on a big network's own: a deep violet panel
 * on the left with the offer (the headline, the commission and four short reasons), and a white panel on the right
 * with the form. On a phone the violet panel goes above the form. The navbar and footer come from the affiliate
 * layout, so the page looks like the rest of the site.
 */
export function AffiliateAuthScreen({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  return (
    <div className="grid lg:min-h-[640px] lg:grid-cols-2">
      <section className="bg-[#16145f] px-5 py-14 text-white sm:px-8 lg:flex lg:flex-col lg:justify-center lg:px-16 lg:py-20">
        <div className="mx-auto w-full max-w-[480px] lg:mx-0 lg:ml-auto">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#9a9dff]">CV11 affiliates</p>
          <h2 className="mt-4 text-balance text-[2.25rem] font-medium leading-[1.05] tracking-[-0.035em] sm:text-[48px] sm:leading-[50px]">
            Help people get hired. Get paid.
          </h2>
          <div aria-hidden="true" className="mt-6 h-1.5 w-[200px] rounded-full bg-[#9a9dff]" />
          <ul className="mt-8 space-y-4 text-lg leading-7 text-white/85">
            {REASONS.map((r) => (
              <li key={r} className="flex gap-3">
                <svg viewBox="0 0 20 20" width="22" height="22" fill="none" stroke="#9a9dff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="mt-0.5 shrink-0">
                  <path d="M4.5 10.5l3.5 3.5 7.5-8" />
                </svg>
                {r}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-white px-5 py-14 sm:px-8 lg:flex lg:flex-col lg:justify-center lg:px-16 lg:py-20">
        <div className="mx-auto w-full max-w-[400px] lg:mx-0 lg:mr-auto">
          <h1 className="text-balance text-[2rem] font-semibold leading-[1.05] tracking-[-0.04em] text-zinc-950 sm:text-[40px]">{title}</h1>
          <p className="mt-3 text-base leading-7 text-zinc-600">{intro}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-8 text-xs leading-relaxed text-zinc-500">
            By continuing, you agree to the{" "}
            <Link href="/affiliates/terms" className="underline underline-offset-2 hover:text-zinc-800">Affiliate terms</Link> and the{" "}
            <Link href="/privacy" className="underline underline-offset-2 hover:text-zinc-800">Privacy policy</Link>.
          </p>
        </div>
      </section>
    </div>
  );
}

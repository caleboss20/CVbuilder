import type { Metadata } from "next";
import Link from "next/link";
import { CheckIcon } from "@/components/ui/check-icon";
import { ProWaitlist } from "@/components/marketing/pro-waitlist";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Pricing: Free CV Builder and the Coming Pro Pass",
  description:
    "CV11 is free for students: the CV builder, templates, PDF downloads, letters and more. Pro adds AI help with your CV for a few cedis, and it is coming soon.",
  alternates: { canonical: "/pricing" },
};

/** What the free plan includes today. Everything here already works. */
const free = [
  "CV builder with 34 templates",
  "PDF and Word downloads",
  "CV checker and job match",
  "8 letter types, with a signature",
  "Sign a letter you already have",
  "Application tracker and national service checklist",
  "Interview preparation",
  "Backup file for your CV",
];

/** What Pro will add. Marked as coming soon on the page, since none of it is on sale yet. */
const pro = [
  `${siteConfig.pro.reviews} AI reviews of your CV, valid for ${siteConfig.pro.validDays} days`,
  "Suggestions for a stronger summary and bullet points",
  "AI match between your CV and a job advert",
  "Your CV saved to your account, on any phone",
  "Everything in Free",
];

function Check({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-sm text-fg/80">
      <CheckIcon size={18} className="mt-0.5" />
      <span>{children}</span>
    </li>
  );
}

export default function PricingPage() {
  return (
    <div className="relative overflow-hidden pt-32 pb-24 sm:pt-40">
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-0 -z-10 h-[460px] w-[900px] -translate-x-1/2 rounded-full bg-brand-600/20 blur-[130px]"
      />
      <div className="mx-auto max-w-4xl px-6 sm:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-medium tracking-tight text-fg sm:text-5xl">Simple pricing</h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-fg/65 sm:text-lg">
            Everything you need to make a CV and apply is free. Pro is a small, one-off pass for AI help, with no subscription.
          </p>
        </div>

        <div className="mt-20 grid items-stretch gap-10 md:grid-cols-2 md:gap-8">
          {/* Free */}
          <section className="flex flex-col rounded-2xl border border-fg/10 bg-fg/[0.03] p-7 sm:p-8">
            <h2 className="text-lg font-medium text-fg">Free</h2>
            <p className="mt-4 flex items-baseline gap-2">
              <span className="text-5xl font-semibold tracking-tight text-fg">GH₵ 0</span>
            </p>
            <p className="mt-1 text-sm text-fg/55">Free for students, always.</p>
            <ul className="mt-7 flex-1 space-y-3.5">
              {free.map((f) => (
                <Check key={f}>{f}</Check>
              ))}
            </ul>
            <Link
              href="/builder"
              className="mt-8 inline-flex h-12 items-center justify-center rounded-md bg-fg/[0.03] text-[15px] font-medium text-fg/90 ring-1 ring-fg/25 transition-all hover:bg-fg/[0.07] hover:text-fg"
            >
              Build my CV
            </Link>
          </section>

          {/* Pro: a glowing border, with the badge floating over the top edge */}
          <section className="group relative">
            <div aria-hidden="true" className="absolute -inset-3 -z-10 rounded-[2rem] bg-brand-500/25 blur-2xl transition-opacity group-hover:opacity-100" />
            <span className="absolute -top-4 left-1/2 z-10 inline-flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-brand-600 px-4 py-1.5 text-xs font-semibold tracking-wide text-white ring-1 ring-brand-300/70 shadow-[0_0_22px_rgb(124_128_255/0.7)]">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M6 3h12l4 6-10 12L2 9z" />
              </svg>
              PRO · COMING SOON
            </span>

            <div className="h-full rounded-2xl bg-gradient-to-b from-brand-300/80 via-brand-500/40 to-brand-500/10 p-px transition-transform duration-300 group-hover:-translate-y-1">
              <div className="flex h-full flex-col rounded-[15px] bg-ink-900 p-7 pt-9 sm:p-8 sm:pt-10">
                <h2 className="text-lg font-medium text-fg">Pro pass</h2>
                <p className="mt-4 flex items-baseline gap-2">
                  <span className="text-5xl font-semibold tracking-tight text-fg">{siteConfig.pro.price}</span>
                  <span className="text-sm text-fg/55">once</span>
                </p>
                <p className="mt-1 text-sm text-fg/55">Pay once, no subscription. Planned price, to be confirmed.</p>
                <ul className="mt-7 flex-1 space-y-3.5">
                  {pro.map((f) => (
                    <Check key={f}>{f}</Check>
                  ))}
                </ul>
                <a
                  href="#join"
                  className="mt-8 inline-flex h-12 items-center justify-center rounded-md bg-brand-600 text-[15px] font-medium text-white ring-1 ring-brand-300/60 shadow-[0_0_22px_rgb(124_128_255/0.55)] transition-all hover:bg-brand-500"
                >
                  Tell me when it launches
                </a>
              </div>
            </div>
          </section>
        </div>

        <p className="mx-auto mt-10 max-w-xl text-center text-sm text-fg/50">
          AI suggestions are a starting point. Always read them and keep only what is true about you.
        </p>

        <div className="mt-14">
          <ProWaitlist />
        </div>
      </div>
    </div>
  );
}

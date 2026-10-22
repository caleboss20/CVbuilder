import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { EarningsCalculator } from "@/components/affiliates/earnings-calculator";
import { AffiliatesHero } from "@/components/affiliates/affiliates-hero";
import { FoundingAffiliates } from "@/components/affiliates/founding-affiliates";
import { WhoCanJoin } from "@/components/affiliates/who-can-join";
import { WhyJoin } from "@/components/affiliates/why-join";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "CV11 Affiliates: Earn by Helping People Get Their CV Done",
  description: `Help people build a CV on CV11 and earn ${siteConfig.affiliates.commission} of every CV payment made with your code. Free to join, paid by mobile money.`,
};

const faqs = [
  { q: "Do I have to pay to join?", a: "No. Joining is free and there is nothing to buy." },
  { q: "How does CV11 know a CV is mine?", a: "The person you helped types your code in the Affiliate code box when they pay, or opens CV11 from your link. We record it on that payment." },
  { q: "When do I get paid?", a: `A reward counts as owed ${siteConfig.affiliates.holdDays} days after the payment, so refunds can be sorted out first. We pay owed rewards by mobile money on ${siteConfig.affiliates.payoutDay}, once you are owed at least ${siteConfig.affiliates.minPayout}.` },
  { q: "Can I use my own code on my own CV?", a: "No. A code only earns when someone else pays." },
  { q: "How long does approval take?", a: "We review every application by hand, usually within a few days. Your dashboard shows your status." },
  { q: "What is not allowed?", a: "Misleading people about the price, spamming, using someone's details without their permission, or faking payments. We can switch off a code at any time." },
];

export default function AffiliatesPage() {
  return (
    <>
      <AffiliatesHero />
      <WhyJoin />
      <FoundingAffiliates />
      <WhoCanJoin />

      {/* The sections below are still in the first draft look; they are redesigned one at a time */}
      <div className="bg-ink-950 text-fg">
      {/* Earnings */}
      <section id="earn" className="mx-auto grid max-w-6xl scroll-mt-24 items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-medium tracking-tight text-fg">See what you could earn</h2>
          <p className="mt-4 text-fg/65">A CV on CV11 costs the student {siteConfig.download.price} and covers all their edits for a while. You earn {siteConfig.affiliates.commission} of it every time.</p>
        </div>
        <EarningsCalculator />
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl scroll-mt-24 px-4 py-16 sm:px-6">
        <h2 className="text-center text-3xl font-medium tracking-tight text-fg">Questions</h2>
        <div className="mt-8 divide-y divide-fg/10 rounded-2xl border border-fg/10 bg-fg/[0.03]">
          {faqs.map((f) => (
            <details key={f.q} className="group p-5">
              <summary className="cursor-pointer list-none text-[15px] font-medium text-fg marker:hidden">{f.q}</summary>
              <p className="mt-3 text-sm leading-relaxed text-fg/65">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Closing call to action */}
      <section className="px-4 pb-24 sm:px-6">
        <div className="mx-auto max-w-3xl rounded-2xl border border-brand-400/30 bg-brand-500/10 p-8 text-center">
          <h2 className="text-2xl font-medium text-fg">Ready to start earning?</h2>
          <p className="mt-2 text-fg/65">It takes two minutes to apply.</p>
          <ButtonLink href="/affiliates/join" size="lg" className="mt-6">Become an affiliate</ButtonLink>
        </div>
      </section>
      </div>
    </>
  );
}

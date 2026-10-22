import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Partner Programme Terms",
  alternates: { canonical: "/partners/terms" },
};

const p = siteConfig.partners;

export default function PartnerTermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <h1 className="text-3xl font-medium tracking-tight text-fg sm:text-4xl">CV11 Partner Programme terms</h1>
      <p className="mt-3 text-sm text-fg/50">These are the plain rules of the programme. We may update them, and we will say so on this page.</p>
      <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-fg/75">
        <section>
          <h2 className="text-lg font-medium text-fg">1. What a partner is</h2>
          <p className="mt-2">A partner is a person who brings paying customers to CV11 using a personal code or link. Partners are not employees or agents of CV11 and are free to stop at any time.</p>
        </section>
        <section>
          <h2 className="text-lg font-medium text-fg">2. Joining</h2>
          <p className="mt-2">Joining is free. You apply with a CV11 account, your name as registered on your mobile money and your phone number. We review every application and may refuse or end a partnership at any time.</p>
        </section>
        <section>
          <h2 className="text-lg font-medium text-fg">3. What you earn</h2>
          <p className="mt-2">You earn {p.commission} for each CV payment that is confirmed with your code. You earn nothing on your own payments, on payments made from your own account, or on free CVs.</p>
        </section>
        <section>
          <h2 className="text-lg font-medium text-fg">4. When you are paid</h2>
          <p className="mt-2">A reward counts as owed {p.holdDays} days after the payment, so refunds and disputes can be settled first. If a payment is refunded or reversed, its reward is cancelled. We pay owed rewards by mobile money on {p.payoutDay}, once you are owed at least {p.minPayout}. Smaller amounts carry over to the next month.</p>
        </section>
        <section>
          <h2 className="text-lg font-medium text-fg">5. What is not allowed</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Telling people a different price than the one shown on CV11.</li>
            <li>Spam, or promoting CV11 in a misleading way.</li>
            <li>Using, copying or sharing the personal details of the people you help for anything except making their CV.</li>
            <li>Faking or arranging payments only to earn rewards.</li>
          </ul>
          <p className="mt-2">We may pause or remove a code, and cancel rewards earned unfairly, if these rules are broken.</p>
        </section>
        <section>
          <h2 className="text-lg font-medium text-fg">6. Other people&apos;s information</h2>
          <p className="mt-2">When you help someone with their CV you may see their personal details. Treat them as private, use them only for that person&apos;s CV, and make sure they agree to you helping them. See our <a href="/privacy" className="text-emerald-300 underline">privacy policy</a>.</p>
        </section>
        <section>
          <h2 className="text-lg font-medium text-fg">7. Changes</h2>
          <p className="mt-2">We may change the reward, the payout rules or these terms. Changes apply to payments made after the change.</p>
        </section>
      </div>
    </div>
  );
}

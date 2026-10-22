import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { EarningsCalculator } from "@/components/partners/earnings-calculator";
import { PartnersHero } from "@/components/partners/partners-hero";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "CV11 Partners: Earn by Helping People Get Their CV Done",
  description: `Help people build a CV on CV11 and earn ${siteConfig.partners.commission} for every CV they pay for with your code. Free to join, paid by mobile money.`,
  alternates: { canonical: "/partners" },
};

const steps = [
  { n: "1", title: "Join for free", body: "Create a CV11 account and apply with your name and MoMo number. No fee, ever." },
  { n: "2", title: "Get your code", body: "We approve your application and give you a personal code, and a link ending in ?p=KOFI that remembers it for you." },
  { n: "3", title: "Help people with their CV", body: "Build a CV with a student, or share your link. They type your code when they pay." },
  { n: "4", title: "Get paid", body: `You earn ${siteConfig.partners.commission} for every CV paid with your code, sent to your MoMo on ${siteConfig.partners.payoutDay}.` },
];

const benefits = [
  { title: `${siteConfig.partners.commission} on every CV`, body: "A flat reward for each confirmed payment, however many you bring." },
  { title: "Charge your own fee too", body: "Typing a CV for someone? Keep whatever you charge them. We never take a cut of that." },
  { title: "Paid by mobile money", body: "MTN, Telecel or AirtelTigo. One clear payout, once a month." },
  { title: "No cost, no stock, no risk", body: "You are paid only when a real payment is confirmed." },
  { title: "A simple dashboard", body: "See your code, your customers and what you are owed at any time." },
  { title: "A product people need", body: "Every student and graduate needs a CV. CV11 makes a professional one in minutes." },
];

const who = ["Cyber cafés and print shops", "Campus helpers and course reps", "Teachers and youth leaders", "NSS coordinators and career clubs", "Bootcamp and event organisers", "Any student who helps friends"];

const faqs = [
  { q: "Do I have to pay to join?", a: "No. Joining is free and there is nothing to buy." },
  { q: "How does CV11 know a CV is mine?", a: "The person you helped types your code in the Partner code box when they pay, or opens CV11 from your link. We record it on that payment." },
  { q: "When do I get paid?", a: `A reward counts as owed ${siteConfig.partners.holdDays} days after the payment, so refunds can be sorted out first. We pay owed rewards by mobile money on ${siteConfig.partners.payoutDay}, once you are owed at least ${siteConfig.partners.minPayout}.` },
  { q: "Can I use my own code on my own CV?", a: "No. A code only earns when someone else pays." },
  { q: "How long does approval take?", a: "We review every application by hand, usually within a few days. Your dashboard shows your status." },
  { q: "What is not allowed?", a: "Misleading people about the price, spamming, using someone's details without their permission, or faking payments. We can switch off a code at any time." },
];

export default function PartnersPage() {
  return (
    <>
      <PartnersHero />

      {/* The sections below are still in the first draft look; they are redesigned one at a time */}
      <div className="bg-ink-950 text-fg">
      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16 sm:px-6">
        <h2 className="text-center text-3xl font-medium tracking-tight text-fg">How it works</h2>
        <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <li key={s.n} className="rounded-2xl border border-fg/10 bg-fg/[0.03] p-6">
              <span className="grid size-9 place-items-center rounded-full bg-emerald-400/15 text-sm font-semibold text-emerald-300">{s.n}</span>
              <h3 className="mt-4 text-base font-medium text-fg">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-fg/60">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-center text-3xl font-medium tracking-tight text-fg">Why partner with CV11</h2>
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b) => (
            <li key={b.title} className="rounded-2xl border border-fg/10 bg-fg/[0.03] p-6">
              <h3 className="text-base font-medium text-fg">{b.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-fg/60">{b.body}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Earnings */}
      <section id="earn" className="mx-auto grid max-w-6xl scroll-mt-24 items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-medium tracking-tight text-fg">See what you could earn</h2>
          <p className="mt-4 text-fg/65">A CV on CV11 costs the student {siteConfig.download.price} and covers all their edits for a while. You earn {siteConfig.partners.commission} of it every time.</p>
          <h3 className="mt-8 text-base font-medium text-fg">Who partners are</h3>
          <ul className="mt-3 grid gap-2 text-sm text-fg/65 sm:grid-cols-2">
            {who.map((w) => (
              <li key={w} className="flex items-start gap-2">
                <span aria-hidden="true" className="mt-1.5 size-1.5 shrink-0 rounded-full bg-emerald-400" />
                {w}
              </li>
            ))}
          </ul>
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
        <div className="mx-auto max-w-3xl rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-8 text-center">
          <h2 className="text-2xl font-medium text-fg">Ready to start earning?</h2>
          <p className="mt-2 text-fg/65">It takes two minutes to apply.</p>
          <ButtonLink href="/partners/join" size="lg" className="mt-6">Become a partner</ButtonLink>
        </div>
      </section>
      </div>
    </>
  );
}

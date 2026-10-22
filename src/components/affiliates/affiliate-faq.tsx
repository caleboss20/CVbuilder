import { siteConfig } from "@/lib/site";

const a = siteConfig.affiliates;

/**
 * Everything an affiliate may want to know, in the order they ask it: what the program is, how it pays, how to
 * join, how it is tracked, and the rules. Answers read from `siteConfig`, so a change to the commission, the hold
 * or the payout day is made in one place.
 */
const FAQS = [
  { q: "What is the CV11 affiliate program and how does it work?", a: `CV11 is a CV builder and job-hunt toolkit for students in Ghana. As an affiliate you help people finish their CV on CV11. When one of them pays to download it with your code, you earn ${a.commission} of that payment.` },
  { q: "What is the commission?", a: `${a.commission} of every confirmed CV payment made with your code (a CV download costs ${siteConfig.download.price}). Your reward is recorded the moment the payment is confirmed.` },
  { q: "Who can become an affiliate?", a: "Anyone who helps people with their CVs: cyber café and print shop owners, campus helpers and course reps, teachers and youth leaders, NSS coordinators and career clubs, bootcamp and event organisers. You do not need a website or an audience." },
  { q: "Do I have to pay to join?", a: "No. Joining is free and there is nothing to buy." },
  { q: "How do I join?", a: `Press “Become an affiliate”, sign in and fill in the short form. The program is invite-only for now, starting with ${a.spots} founding spots.` },
  { q: "How will I know if my application is accepted?", a: "We review every application by hand, usually within a few days. Your affiliate dashboard shows your status, and once you are approved it shows your code." },
  { q: "Why might my application be declined?", a: "Usually because the program is full for now, or because we could not tell how you would help people with their CVs. You are welcome to apply again later." },
  { q: "Where do I find my code and link?", a: "On your affiliate dashboard, as soon as you are approved. Share the code, or the link that carries it." },
  { q: "How does CV11 know a CV is mine?", a: "The person you helped types your code in the Affiliate code box when they pay, or opens CV11 from your link. We record the code on that payment." },
  { q: "How and when will I get paid?", a: `A reward counts as owed ${a.holdDays} days after the payment, so refunds can be sorted out first. We pay owed rewards by mobile money on ${a.payoutDay}, once you are owed at least ${a.minPayout}. Smaller amounts carry over to the next month.` },
  { q: "I cannot find a CV in my statistics", a: "Check that the person typed your code (or used your link) before paying, and that the payment went through. A reward appears once the payment is confirmed. If something still looks wrong, contact us with the person's first name and the day they paid." },
  { q: "Can I use my own code on my own CV?", a: "No. A code only earns when someone else pays." },
  { q: "What am I not allowed to do?", a: "Misleading people about the price, spamming, using someone's details without their permission, or faking payments. We can switch off a code at any time." },
  { q: "Where can I read the affiliate terms?", a: "On the Affiliate terms page, linked in the footer of every affiliate page." },
  { q: "How do I close my affiliate account?", a: "Contact us and we will switch off your code and close your account. Rewards you are already owed will still be paid." },
];

/** The questions, as a wide white section: a centred title, then one full-width divided accordion. */
export function AffiliateFaq() {
  return (
    <section id="faq" className="scroll-mt-24 bg-white py-16 text-zinc-950 sm:py-28">
      <div className="mx-auto max-w-[1110px] px-5 sm:px-8">
        <h2 className="text-center text-[2rem] font-semibold leading-[1.02] tracking-[-0.04em] sm:text-[46px] sm:leading-[46px]">Frequently asked questions</h2>
        <div className="mt-12 divide-y divide-zinc-200 border-y border-zinc-200">
          {FAQS.map((f) => (
            <details key={f.q} className="group py-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-medium tracking-tight sm:text-xl marker:hidden [&::-webkit-details-marker]:hidden">
                {f.q}
                <span aria-hidden="true" className="shrink-0 text-2xl font-light text-[#5b5fe0] transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 max-w-[900px] text-base leading-7 text-zinc-600">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

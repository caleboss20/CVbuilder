import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Affiliate Program Terms",
};

const p = siteConfig.affiliates;

/** The terms as a list of numbered sections, so each can be read, changed and linked on its own. */
const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: "What an affiliate is",
    body: "An affiliate is a person who brings paying customers to CV11 using a personal code or link. Affiliates are independent. They are not employees, agents or partners of CV11, they cannot speak or sign for CV11, and they are free to stop at any time.",
  },
  {
    title: "Joining",
    body: `The program is by invitation for now, with a small number of founding places. Joining is free. You apply with a CV11 account, your full name as it is registered on your mobile money wallet, and your phone number. You must be at least 18, or have a parent or guardian agree for you. We review every application by hand and may accept, refuse or end an affiliateship at any time, with or without giving a reason.`,
  },
  {
    title: "What you earn",
    body: `You earn ${p.commission} of each CV payment that is confirmed with your code. You earn nothing on your own payments, on payments made from your own account, on free CVs, or on payments that are refunded or reversed.`,
  },
  {
    title: "When and how you are paid",
    body: `A reward counts as owed ${p.holdDays} days after the payment, so refunds and disputes can be settled first. We pay owed rewards by mobile money on ${p.payoutDay}, once you are owed at least ${p.minPayout}. Smaller amounts carry over to the next month. You are responsible for giving us the correct mobile money details. We cannot recover money sent to a wrong number that you gave us. Every payout is recorded in your dashboard, with a receipt.`,
  },
  {
    title: "Refunds and reversals",
    body: "If a payment is refunded, charged back or reversed for any reason, the reward for it is cancelled. If we have already paid you that reward, we may take it off your next payout, or ask you to return it.",
  },
  {
    title: "Fair use and limits",
    body: "To keep the program fair, a code can earn only a limited number of rewards in a day, and only a limited number from the same paying account. A payment over a limit still works for the customer, but earns no reward. We watch for unusual activity, and may hold, cancel or refuse rewards that look unfair, and pause or remove the code while we look into it.",
  },
  {
    title: "What is not allowed",
    body: (
      <>
        <ul className="list-disc space-y-1 pl-5">
          <li>Telling people a different price than the one shown on CV11, or promising things CV11 does not offer.</li>
          <li>Spam, or promoting CV11 in a misleading way, including pretending to be CV11 or its staff.</li>
          <li>Using, copying or sharing the personal details of the people you help for anything except making their CV.</li>
          <li>Faking, arranging or paying for purchases only to earn rewards, or using several accounts or devices to do so.</li>
          <li>Using someone else&apos;s code, or letting someone else use yours.</li>
        </ul>
        <p className="mt-2">If these rules are broken we may pause or remove your code, cancel rewards, and close your account.</p>
      </>
    ),
  },
  {
    title: "Be honest about who you are",
    body: "When you recommend CV11 and earn from it, say so. People should know you may earn a reward if they use your code. Follow the advertising and consumer rules that apply to you.",
  },
  {
    title: "Other people's information",
    body: (
      <>
        When you help someone with their CV you may see their personal details. Treat them as private, use them only for that person&apos;s CV, and make sure they agree to you helping them. See our{" "}
        <Link href="/privacy" className="text-violet-700 underline">privacy policy</Link>.
      </>
    ),
  },
  {
    title: "Your own taxes",
    body: "You are responsible for any tax that applies to what you earn. We do not withhold or pay tax for you.",
  },
  {
    title: "Ending your affiliateship",
    body: "You can stop at any time by contacting us, and we will close your code. Rewards you have already earned and that are owed will still be paid, unless they were earned in breach of these terms. We may end or pause your affiliateship at any time. If we end it for a breach, we may cancel unpaid rewards.",
  },
  {
    title: "Our responsibility",
    body: "We do our best to track every payment made with your code correctly, but we do not promise that CV11 will always be available or that you will earn any amount. To the extent the law allows, CV11 is not liable for lost earnings or indirect losses. Nothing here limits any right you have by law.",
  },
  {
    title: "Changes",
    body: "We may change the reward, the payout rules or these terms. We will post the change on this page, and it applies to payments made after the change. If you keep using your code after a change, you accept it.",
  },
  {
    title: "Law and contact",
    body: "These terms are governed by the laws of Ghana. For any question about them or your account, contact us through the WhatsApp link in your dashboard.",
  },
];

export default function AffiliateTermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <h1 className="text-3xl font-medium tracking-tight text-zinc-950 sm:text-4xl">CV11 Affiliate Program terms</h1>
      <p className="mt-3 text-sm text-zinc-600">These are the plain rules of the program. By applying you agree to them. Last updated October 2026.</p>
      <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-zinc-600">
        {SECTIONS.map((s, i) => (
          <section key={s.title}>
            <h2 className="text-lg font-medium text-zinc-950">{i + 1}. {s.title}</h2>
            <div className="mt-2">{s.body}</div>
          </section>
        ))}
      </div>
    </div>
  );
}

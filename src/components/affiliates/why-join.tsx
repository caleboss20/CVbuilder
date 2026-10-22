import type { ReactNode } from "react";
import { siteConfig } from "@/lib/site";

/** A 32 px icon in the same simple outline style, one per reason. */
function Icon({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

const reasons: { icon: ReactNode; title: string; body: string }[] = [
  {
    icon: (
      <Icon>
        <circle cx="16" cy="16" r="12" />
        <path d="M11.5 20.5l9-9M12 12.5h.01M20 19.5h.01" />
      </Icon>
    ),
    title: `Earn ${siteConfig.affiliates.commission} on every CV`,
    body: `Get ${siteConfig.affiliates.commission} of every CV payment made with your code, for every person you bring, with no cap on how much you can earn.`,
  },
  {
    icon: (
      <Icon>
        <rect x="9" y="3" width="14" height="26" rx="3" />
        <path d="M14 24.5h4" />
      </Icon>
    ),
    title: "Paid by mobile money",
    body: `Rewards go straight to your MTN, Telecel or AirtelTigo wallet on ${siteConfig.affiliates.payoutDay}. No bank account needed.`,
  },
  {
    icon: (
      <Icon>
        <path d="M8 3h11l6 6v20H8z" />
        <path d="M19 3v6h6M12 15h9M12 20h9M12 25h5" />
      </Icon>
    ),
    title: "A product people need",
    body: "Every student and graduate in Ghana needs a good CV. CV11 helps them make a professional one in minutes, so it sells itself.",
  },
  {
    icon: (
      <Icon>
        <path d="M4 10h24v14a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z" />
        <path d="M11 10V7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3M4 17h24" />
      </Icon>
    ),
    title: "Keep your own fee too",
    body: "Typing a CV for someone? Charge them for your time and keep all of it. We only take our usual price for the download.",
  },
  {
    icon: (
      <Icon>
        <path d="M16 4l3.4 7.2 7.6 1-5.6 5.3 1.5 7.7L16 21.5 9.1 25.2l1.5-7.7L5 12.2l7.6-1z" />
      </Icon>
    ),
    title: "No cost, no targets",
    body: "Joining is free and there is no minimum to hit. You earn when someone you helped pays, and that is all.",
  },
  {
    icon: (
      <Icon>
        <path d="M4 26V6M4 26h24" />
        <path d="M9 21l5-6 4 3 7-9" />
      </Icon>
    ),
    title: "A simple dashboard",
    body: "See your code, your customers and what you are owed at any time. No spreadsheets, no guessing.",
  },
];

/**
 * "Why join": a small line of social proof under the hero, then a large heading and six reasons in a grid of
 * three, like a software affiliate page. The first card is filled with CV11's violet to lead the eye; the
 * others sit on a pale tint. No borders: the colour does the separating.
 */
export function WhyJoin() {
  return (
    <section id="how" className="scroll-mt-24 bg-white text-zinc-950">
      {/* A line of proof, tucked under the hero on the right */}
      <div className="mx-auto flex max-w-[944px] justify-center px-5 pt-6 text-sm font-medium tracking-tight text-zinc-500 sm:px-8 lg:justify-end lg:px-0">
        Students across Ghana build their CVs on CV11
      </div>

      <div className="mx-auto max-w-[1110px] px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24">
        <h2 className="mx-auto max-w-[900px] text-balance text-center text-[2rem] font-semibold uppercase leading-[1.02] tracking-[-0.04em] text-zinc-950 sm:text-[46px] sm:leading-[46px]">
          Why join the affiliate program?
        </h2>

        <ul className="mt-12 grid gap-5 sm:mt-16 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {reasons.map((r, i) => (
            <li
              key={r.title}
              className={`flex min-h-[300px] flex-col justify-between gap-12 rounded-3xl p-7 sm:p-8 ${i === 0 ? "bg-[#5b5fe0] text-white" : "bg-[#f2f2ff] text-zinc-950"}`}
            >
              <span className={i === 0 ? "text-white" : "text-[#5b5fe0]"}>{r.icon}</span>
              <div>
                <h3 className="text-xl font-semibold tracking-tight">{r.title}</h3>
                <p className={`mt-3 text-lg leading-[27px] tracking-[-0.02em] ${i === 0 ? "text-white/90" : "text-zinc-600"}`}>{r.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/track";
import { whatsappLink } from "@/lib/site";

/** What Pro would add, in the student's own words. Their picks tell us what to build first. */
const WANTS = ["AI review of my whole CV", "Better wording for my bullet points", "Match my CV to a job ad", "My CV on any phone", "Something else"];

/**
 * Pro is not on sale yet, so this is how interest is counted. The student ticks what they would
 * use most and sends a short WhatsApp message to CV11, which is also how we can tell them when
 * it launches. Nothing is charged and no payment details are asked for.
 */
export function ProWaitlist() {
  const [picked, setPicked] = useState<string[]>([]);
  const toggle = (item: string) => setPicked((p) => (p.includes(item) ? p.filter((x) => x !== item) : [...p, item]));

  const message = `Hi CV11, please tell me when Pro launches.${picked.length ? ` I would use: ${picked.join(", ")}.` : ""}`;
  // Null when no WhatsApp number is set up, in which case there is nowhere to send the request
  const link = whatsappLink(message);

  return (
    <div id="join" className="scroll-mt-28 rounded-2xl border border-fg/10 bg-fg/[0.03] p-6 sm:p-8">
      <h2 className="text-xl font-medium text-fg">Be first to know when Pro launches</h2>
      <p className="mt-1.5 text-sm text-fg/60">What would you use most? Tick all that apply. It helps us build the right thing first.</p>

      <ul className="mt-5 flex flex-wrap gap-2">
        {WANTS.map((w) => {
          const on = picked.includes(w);
          return (
            <li key={w}>
              <button
                type="button"
                role="checkbox"
                aria-checked={on}
                onClick={() => toggle(w)}
                className={`rounded-full border px-3.5 py-2 text-sm transition-colors ${
                  on ? "border-brand-400/60 bg-brand-500/15 text-fg" : "border-fg/12 bg-fg/[0.04] text-fg/70 hover:text-fg"
                }`}
              >
                {on ? "✓ " : ""}
                {w}
              </button>
            </li>
          );
        })}
      </ul>

      {link && (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent("pro_waitlist", { picks: picked.length })}
          className="mt-6 inline-flex h-12 items-center justify-center rounded-md bg-brand-600 px-6 text-[15px] font-medium text-white ring-1 ring-brand-300/60 shadow-[0_0_22px_rgb(124_128_255/0.5)] transition-all hover:bg-brand-500"
        >
          Join the Pro list on WhatsApp
        </a>
      )}
      <p className="mt-3 text-xs text-fg/45">This opens WhatsApp with a message ready to send. You are not charged anything.</p>
    </div>
  );
}

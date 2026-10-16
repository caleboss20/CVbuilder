"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckIcon } from "@/components/ui/check-icon";

/*
 * A national service preparation checklist. Ticks are saved on the student's device.
 *
 * The items are general good practice, not official requirements: rules, dates and
 * documents change, so the page tells students to confirm them with the National
 * Service Authority and with each organisation.
 */

const STORAGE_KEY = "cv11-nss-checklist-v1";

type Item = { id: string; label: string; hint?: string; action?: { label: string; href: string } };
type Group = { title: string; items: Item[] };

const groups: Group[] = [
  {
    title: "1. Get your documents ready",
    items: [
      { id: "id", label: "Your ID card is valid and easy to find", hint: "Organisations usually ask to see one." },
      { id: "certs", label: "Your certificate or transcript is scanned and saved on your phone" },
      { id: "photos", label: "A clear passport-size photo, printed and saved as a file" },
      { id: "contact", label: "A phone number and an email address that you check every day" },
      {
        id: "rules",
        label: "You have checked the current requirements with the National Service Authority and the organisation",
        hint: "Rules and dates change, so always confirm them at the source.",
      },
    ],
  },
  {
    title: "2. Write your CV",
    items: [
      {
        id: "see-example",
        label: "Look at an example national service CV",
        action: { label: "See an example", href: "/cv-examples/national-service" },
      },
      {
        id: "build-cv",
        label: "Build your CV: one page, with your course, projects and attachments first",
        action: { label: "Open the builder", href: "/builder" },
      },
      {
        id: "check-cv",
        label: "Check your CV and fix the weak points",
        action: { label: "Check my CV", href: "/cv-checker" },
      },
    ],
  },
  {
    title: "3. Cover letter and referees",
    items: [
      {
        id: "letter",
        label: "Write a short cover letter for a national service placement",
        action: { label: "Write it", href: "/cover-letter?kind=service" },
      },
      { id: "referees", label: "Ask two people to be your referees, and get their permission", hint: "A lecturer and a supervisor from your attachment work well." },
      { id: "tell-referees", label: "Tell your referees which organisations you are applying to" },
    ],
  },
  {
    title: "4. Apply and keep track",
    items: [
      {
        id: "track",
        label: "Add every organisation you apply to in your tracker",
        action: { label: "Open the tracker", href: "/tracker" },
      },
      { id: "name-file", label: "Name your CV file with your own name, for example Ama_Mensah_CV.pdf" },
      { id: "follow", label: "Follow up politely if you have not heard back after about a week" },
    ],
  },
];

const total = groups.reduce((n, g) => n + g.items.length, 0);

export function NationalServiceChecklist() {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- read once from storage after mount
      if (raw) setDone(JSON.parse(raw));
    } catch {
      // Blocked or corrupt storage: start with nothing ticked
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(done));
    } catch {
      // Storage blocked: ticks still work for this visit
    }
  }, [done, loaded]);

  const count = groups.flatMap((g) => g.items).filter((i) => done[i.id]).length;
  const percent = Math.round((count / total) * 100);

  return (
    <div>
      {/* Progress */}
      <div className="rounded-2xl border border-fg/10 bg-fg/[0.03] p-5 sm:p-6">
        <div className="flex items-baseline justify-between">
          <p className="font-medium text-fg">
            {count} of {total} done
          </p>
          <p className="text-sm tabular-nums text-fg/60">{percent}%</p>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-fg/10">
          <div className="h-full rounded-full bg-brand-400 transition-all duration-500" style={{ width: `${percent}%` }} />
        </div>
        {count === total && <p className="mt-3 text-sm text-emerald-300">You are ready. Apply with confidence.</p>}
      </div>

      <div className="mt-8 space-y-8">
        {groups.map((g) => (
          <section key={g.title}>
            <h2 className="text-lg font-medium text-fg">{g.title}</h2>
            <ul className="mt-3 space-y-2.5">
              {g.items.map((item) => {
                const checked = !!done[item.id];
                return (
                  <li key={item.id} className="rounded-xl border border-fg/10 bg-fg/[0.03]">
                    <label className="flex cursor-pointer items-start gap-3 p-4">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => setDone((d) => ({ ...d, [item.id]: !d[item.id] }))}
                        className="peer sr-only"
                      />
                      {/* The visible box: a real check icon when ticked, like everywhere else on the site */}
                      <span
                        aria-hidden="true"
                        className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-md border transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-brand-400 ${
                          checked ? "border-emerald-400/60 bg-emerald-500/15" : "border-fg/25"
                        }`}
                      >
                        {checked && <CheckIcon size={16} />}
                      </span>
                      <span className="min-w-0">
                        <span className={`block text-[15px] ${checked ? "text-fg/50 line-through" : "text-fg"}`}>{item.label}</span>
                        {item.hint && <span className="mt-0.5 block text-sm text-fg/50">{item.hint}</span>}
                      </span>
                    </label>
                    {item.action && (
                      <div className="border-t border-fg/10 px-4 py-2.5 pl-[3.25rem]">
                        <Link href={item.action.href} className="text-sm font-medium text-brand-300 hover:text-fg">
                          {item.action.label} →
                        </Link>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-3 text-sm">
        <p className="max-w-xl text-fg/50">
          This is a general preparation guide, not official advice. CV11 is not part of the National Service Authority. Always confirm
          current requirements and dates with them and with each organisation.
        </p>
        {count > 0 && (
          <button type="button" onClick={() => setDone({})} className="py-2 text-fg/55 hover:text-fg">
            Reset ticks
          </button>
        )}
      </div>
    </div>
  );
}

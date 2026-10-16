import Link from "next/link";
import { SectionHeading } from "./section-heading";

/*
 * Shows everything CV11 does beyond building a CV. This is what sets it apart: a
 * student gets the whole job hunt in one free place, not just a PDF.
 * Each card is a link, so the section works as navigation too.
 */

const tools: { title: string; text: string; href: string; icon: string }[] = [
  {
    title: "CV builder",
    text: "34 templates, live preview, PDF and Word.",
    href: "/builder",
    icon: "M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6",
  },
  {
    title: "Upload my CV",
    text: "Already have one? Upload it and keep editing.",
    href: "/builder?import=1",
    icon: "M12 16V4m0 0-4 4m4-4 4 4M4 16v4h16v-4",
  },
  {
    title: "CV checker",
    text: "Get a score out of 100 for the job you want.",
    href: "/cv-checker",
    icon: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM8 12.5l3 3 5-6",
  },
  {
    title: "Letters",
    text: "Scholarship, university, cover and reference letters.",
    href: "/letters",
    icon: "M3 6h18v12H3zM3 6l9 7 9-7",
  },
  {
    title: "Application tracker",
    text: "See every application and when to follow up.",
    href: "/tracker",
    icon: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  },
  {
    title: "National service checklist",
    text: "Documents, CV, referees: ready before you apply.",
    href: "/national-service",
    icon: "M5 21V4m0 0h11l-2 4 2 4H5",
  },
  {
    title: "Interview preparation",
    text: "Common questions and how to answer them.",
    href: "/interview-prep",
    icon: "M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z",
  },
  {
    title: "CV guides",
    text: "Plain advice on writing a CV that works.",
    href: "/blog",
    icon: "M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2zM8 7h6M8 11h6",
  },
];

export function JobHuntTools() {
  return (
    <section id="tools" aria-labelledby="tools-heading" className="relative scroll-mt-20 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="tools-heading"
          eyebrow="Beyond the CV"
          title={
            <>
              Your whole <em>job hunt</em>, in one free place
            </>
          }
          description="Build the CV, check it, write the cover letter, track every application and prepare for the interview. All free for students."
        />

        <ul className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {tools.map((t) => (
            <li key={t.title}>
              <Link
                href={t.href}
                className="group flex h-full flex-col rounded-xl border border-fg/10 bg-fg/[0.03] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-400/50 hover:bg-fg/[0.05] hover:shadow-[0_0_40px_-14px_rgb(124_128_255/0.7)] sm:p-5"
              >
                <span className="grid size-10 place-items-center rounded-lg bg-brand-500/15 text-brand-300 transition-colors group-hover:bg-brand-500/25">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d={t.icon} />
                  </svg>
                </span>
                <h3 className="mt-3.5 font-medium text-fg">{t.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-fg/60">{t.text}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

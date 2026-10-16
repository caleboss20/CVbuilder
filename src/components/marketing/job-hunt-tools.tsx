import Link from "next/link";
import { SectionHeading } from "./section-heading";
import { templates } from "@/lib/templates";

/*
 * Everything CV11 does, in six cards. This is what sets it apart: a student gets the
 * whole job hunt in one free place, not just a PDF. Kept to six on purpose: a short list
 * is easier to take in, and each card leads on to more.
 */

const tools: { title: string; text: string; href: string; icon: string; tags?: string[] }[] = [
  {
    title: "Build or upload your CV",
    text: `${templates.length} templates, live preview, PDF and Word. Or upload the CV you already have.`,
    href: "/builder",
    icon: "M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6",
  },
  {
    title: "Check your CV",
    text: "Get a score out of 100 for the job you want, and clear fixes.",
    href: "/cv-checker",
    icon: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM8 12.5l3 3 5-6",
  },
  {
    title: "Letters",
    text: "Written from your CV, ready to edit.",
    href: "/letters",
    icon: "M3 6h18v12H3zM3 6l9 7 9-7",
    tags: ["Scholarship", "Cover letter", "University", "Reference"],
  },
  {
    title: "Track your applications",
    text: "See every application and when to follow up.",
    href: "/tracker",
    icon: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  },
  {
    title: "National service",
    text: "A checklist from documents to follow-up.",
    href: "/national-service",
    icon: "M5 21V4m0 0h11l-2 4 2 4H5",
  },
  {
    title: "Interview preparation",
    text: "Common questions and how to answer them.",
    href: "/interview-prep",
    icon: "M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z",
  },
];

export function JobHuntTools() {
  return (
    <section id="tools" aria-labelledby="tools-heading" className="relative scroll-mt-20 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="tools-heading"
          eyebrow="Everything in one place"
          title={
            <>
              Your whole <em>job hunt</em>, free
            </>
          }
          description="Build the CV, check it, write the letters, track every application and prepare for the interview."
        />

        <ul className="mt-12 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {tools.map((t) => (
            <li key={t.title}>
              <Link
                href={t.href}
                className="group flex h-full flex-col rounded-xl border border-fg/10 bg-fg/[0.03] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-400/50 hover:bg-fg/[0.05] hover:shadow-[0_0_40px_-14px_rgb(124_128_255/0.7)]"
              >
                <span className="grid size-10 place-items-center rounded-lg bg-brand-500/15 text-brand-300 transition-colors group-hover:bg-brand-500/25">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d={t.icon} />
                  </svg>
                </span>
                <h3 className="mt-4 text-lg font-medium text-fg">{t.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-fg/60">{t.text}</p>
                {t.tags && (
                  <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Includes">
                    {t.tags.map((tag) => (
                      <li key={tag} className="rounded-full bg-fg/[0.07] px-2.5 py-1 text-xs text-fg/70">
                        {tag}
                      </li>
                    ))}
                  </ul>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

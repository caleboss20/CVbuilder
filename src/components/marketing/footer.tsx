import Link from "next/link";
import { cvExamples } from "@/lib/cv-examples";
import { siteConfig } from "@/lib/site";
import { Logo } from "@/components/ui/logo";
import { ButtonLink } from "@/components/ui/button";

const popularSlugs = [
  "nursing",
  "computer-science",
  "national-service",
  "accounting",
  "teaching",
  "civil-engineering",
];

const columns: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "CV",
    links: [
      { label: "CV Builder", href: "/builder" },
      { label: "CV Templates", href: "/templates" },
      { label: "CV Examples", href: "/cv-examples" },
      { label: "How to Write a CV", href: "/blog/how-to-write-a-cv" },
      { label: "CV Help", href: "/blog" },
    ],
  },
  {
    title: "Popular examples",
    links: popularSlugs.flatMap((slug) => {
      const e = cvExamples.find((x) => x.slug === slug);
      return e ? [{ label: `${e.course} CV`, href: `/cv-examples/${e.slug}` }] : [];
    }),
  },
  {
    title: "Support",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "FAQ", href: "/#faq" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookies", href: "/cookies" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-fg/10 bg-ink-950">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.3fr_2fr] lg:px-8">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-5 text-sm leading-relaxed text-fg/55">
            {siteConfig.name} helps students and fresh graduates in Ghana build professional CVs, with
            clean templates, real examples for every course and AI help with the wording.
          </p>
          <ButtonLink href="/builder" className="mt-6">
            Create my CV
          </ButtonLink>
        </div>

        <nav aria-label="Footer" className="grid gap-10 sm:grid-cols-3">
          {columns.map((col) => (
            <div key={col.title}>
              <h2 className="text-sm font-semibold text-fg">{col.title}</h2>
              <ul className="mt-4 space-y-3">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-fg/55 transition-colors hover:text-fg">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="border-t border-fg/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-fg/40 sm:flex-row sm:px-6 lg:px-8">
          <p>
            © 2026 {siteConfig.name}. All rights reserved.
          </p>
          <p>Made in Ghana, for students everywhere.</p>
        </div>
      </div>
    </footer>
  );
}

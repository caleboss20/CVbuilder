import type { ReactNode } from "react";

/**
 * Shared frame for text pages (About, Privacy, Terms, guides): the same glow and
 * spacing as the rest of the site, a heading, and readable body text.
 */
export function PageShell({
  title,
  intro,
  meta,
  children,
}: {
  title: string;
  intro?: string;
  /** A small line under the title, such as "Last updated 16 October 2026". */
  meta?: string;
  children: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden pt-32 pb-24 sm:pt-40">
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-0 -z-10 h-[420px] w-[900px] -translate-x-1/2 rounded-full bg-brand-600/15 blur-[120px]"
      />
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h1 className="text-4xl font-medium tracking-tight text-balance text-fg sm:text-5xl">{title}</h1>
        {meta && <p className="mt-3 text-sm text-fg/45">{meta}</p>}
        {intro && <p className="mt-4 text-lg leading-relaxed text-fg/65">{intro}</p>}
        <Prose className="mt-10">{children}</Prose>
      </div>
    </div>
  );
}

/** Body text styles: headings, paragraphs, lists and links, without a typography plugin. */
export function Prose({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`space-y-4 text-base leading-relaxed text-fg/75 [&_a]:text-brand-300 [&_a]:underline-offset-4 hover:[&_a]:text-fg hover:[&_a]:underline [&_h2]:mt-12 [&_h2]:text-2xl [&_h2]:font-medium [&_h2]:text-fg [&_h3]:mt-8 [&_h3]:text-lg [&_h3]:font-medium [&_h3]:text-fg [&_li]:pl-1 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6 [&_strong]:font-medium [&_strong]:text-fg [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 ${className}`}
    >
      {children}
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/ui/button";
import { PageShell } from "@/components/marketing/page-shell";
import { getLetterGuide, letterGuides, writerHref } from "@/lib/letter-guides";
import { siteConfig } from "@/lib/site";

// Every guide is prebuilt from generateStaticParams, so reading params here is fine
export const instant = false;

export function generateStaticParams() {
  return letterGuides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: PageProps<"/letters/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const guide = getLetterGuide(slug);
  if (!guide) return {};
  return {
    title: `${guide.title} (with a free letter writer)`,
    description: `${guide.intro} Write yours free in minutes.`,
    alternates: { canonical: `/letters/${guide.slug}` },
  };
}

export default async function LetterGuidePage({ params }: PageProps<"/letters/[slug]">) {
  const { slug } = await params;
  const guide = getLetterGuide(slug);
  if (!guide) notFound();

  // Structured data so search engines see this as a how-to article
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.intro,
    inLanguage: "en-GH",
    author: { "@type": "Organization", name: siteConfig.name },
    publisher: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
    mainEntityOfPage: `${siteConfig.url}/letters/${guide.slug}`,
  };

  const others = letterGuides.filter((g) => g.slug !== guide.slug);

  return (
    <PageShell title={guide.title} intro={guide.intro}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="rounded-2xl border border-brand-400/30 bg-brand-500/[0.08] p-6">
        <p className="text-lg font-medium text-fg">Write it now, free</p>
        <p className="mt-1 text-sm text-fg/65">We draft it from your CV. You change every word, then download it as a PDF.</p>
        <ButtonLink href={writerHref(guide.kind)} className="mt-4">
          Write my {guide.short.toLowerCase()}
        </ButtonLink>
      </div>

      <section>
        <h2>What to include</h2>
        <ul className="mt-4">
          {guide.include.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Tips that make it stronger</h2>
        <ul className="mt-4">
          {guide.tips.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Mistakes to avoid</h2>
        <ul className="mt-4">
          {guide.mistakes.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <div className="!mt-12">
        <h2 className="!mt-0">More letters</h2>
        <ul className="mt-4">
          {others.map((g) => (
            <li key={g.slug}>
              <Link href={`/letters/${g.slug}`}>{g.title}</Link>
            </li>
          ))}
        </ul>
      </div>
    </PageShell>
  );
}

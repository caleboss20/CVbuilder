import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { PageShell } from "@/components/marketing/page-shell";
import { getGuide, guides } from "@/lib/guides";
import { siteConfig } from "@/lib/site";

// Every guide is prebuilt from generateStaticParams, so reading params here is fine
export const instant = false;

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};
  return {
    title: guide.title,
    description: guide.summary,
    alternates: { canonical: `/blog/${guide.slug}` },
    openGraph: { type: "article", title: guide.title, description: guide.summary, publishedTime: guide.published },
  };
}

export default async function GuidePage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  // Structured data so search engines understand this is an article
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.summary,
    datePublished: guide.published,
    inLanguage: "en-GH",
    author: { "@type": "Organization", name: siteConfig.name },
    publisher: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
    mainEntityOfPage: `${siteConfig.url}/blog/${guide.slug}`,
  };

  const others = guides.filter((g) => g.slug !== guide.slug);

  return (
    <PageShell title={guide.title} intro={guide.summary}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {guide.sections.map((s) => (
        <section key={s.heading}>
          <h2>{s.heading}</h2>
          {s.body.map((p) => (
            <p key={p} className="mt-4">
              {p}
            </p>
          ))}
          {s.list && (
            <ul className="mt-4">
              {s.list.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </section>
      ))}

      <div className="!mt-12 rounded-2xl border border-brand-400/30 bg-brand-500/[0.08] p-6">
        <p className="text-lg font-medium text-fg">Ready to put this into practice?</p>
        <p className="mt-1 text-sm text-fg/65">It is free, and you can download your CV as a PDF or Word file.</p>
        <ButtonLink href={guide.cta.href} className="mt-4">
          {guide.cta.label}
        </ButtonLink>
      </div>

      <div className="!mt-12">
        <h2 className="!mt-0">More guides</h2>
        <ul className="mt-4">
          {others.map((g) => (
            <li key={g.slug}>
              <Link href={`/blog/${g.slug}`}>{g.title}</Link>
            </li>
          ))}
        </ul>
      </div>
    </PageShell>
  );
}

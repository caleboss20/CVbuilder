import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cvExamples, getCvExample } from "@/lib/cv-examples";
import { siteConfig } from "@/lib/site";
import { CvPageFrame } from "@/components/cv/cv-page-frame";
import { CvTemplate } from "@/components/cv/cv-templates";
import { CvIcon } from "@/components/cv/cv-icon";
import { ButtonLink } from "@/components/ui/button";

export function generateStaticParams() {
  return cvExamples.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/cv-examples/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const example = getCvExample(slug);
  if (!example) return {};

  const title = `${example.course} CV Example for Students in Ghana`;
  return {
    title,
    description: `${example.intro} Free ${example.course.toLowerCase()} CV example with tips, ready to edit in CV11.`,
    alternates: { canonical: `/cv-examples/${slug}` },
    openGraph: { title, description: example.intro, url: `/cv-examples/${slug}` },
  };
}

export default async function CvExamplePage({ params }: PageProps<"/cv-examples/[slug]">) {
  const { slug } = await params;
  const example = getCvExample(slug);
  if (!example) notFound();

  const others = cvExamples.filter((e) => e.slug !== slug);
  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
      { "@type": "ListItem", position: 2, name: "CV examples", item: `${siteConfig.url}/cv-examples` },
      {
        "@type": "ListItem",
        position: 3,
        name: `${example.course} CV`,
        item: `${siteConfig.url}/cv-examples/${slug}`,
      },
    ],
  };

  return (
    <div className="relative overflow-hidden pt-32 pb-24 sm:pt-40">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs).replace(/</g, "\\u003c") }}
      />
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-0 -z-10 h-[420px] w-[900px] -translate-x-1/2 rounded-full bg-brand-600/15 blur-[120px]"
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="text-sm text-white/50">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-white">Home</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/cv-examples" className="hover:text-white">CV examples</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-white/80">{example.course}</li>
          </ol>
        </nav>

        <div className="mt-6 flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-full bg-brand-500/15 text-brand-300">
            <CvIcon name={example.icon} size={20} />
          </span>
          <h1 className="text-3xl font-medium tracking-tight text-white sm:text-5xl">
            {example.course} CV Example
          </h1>
        </div>
        <p className="mt-4 max-w-2xl text-base text-white/65 sm:text-lg">{example.intro}</p>

        <div className="mt-12 grid items-start gap-8 lg:grid-cols-[1fr_340px]">
          <article
            aria-label={`${example.course} CV example`}
            className="overflow-hidden rounded-md bg-white shadow-[0_0_60px_-15px_rgb(124_128_255/0.6)]"
          >
            <CvPageFrame>
              <CvTemplate example={example} />
            </CvPageFrame>
          </article>

          <aside className="space-y-5 lg:sticky lg:top-28">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-lg font-medium text-white">Tips for a {example.course.toLowerCase()} CV</h2>
              <ol className="mt-4 space-y-4">
                {example.tips.map((tip, i) => (
                  <li key={tip} className="flex gap-3 text-sm leading-relaxed text-white/70">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-500/20 text-xs font-medium text-brand-300">
                      {i + 1}
                    </span>
                    {tip}
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-xl border border-brand-400/30 bg-linear-to-b from-brand-600/25 to-ink-900 p-6">
              <h2 className="text-lg font-medium text-white">Make yours in minutes</h2>
              <p className="mt-2 text-sm text-white/65">
                Start from this example, swap in your own details and let the AI polish your wording.
              </p>
              <ButtonLink href="/builder" className="mt-5 w-full">
                Use this example
              </ButtonLink>
              <p className="mt-3 text-center text-xs text-white/40">Free for students · No sign-up needed</p>
            </div>
          </aside>
        </div>

        <section aria-labelledby="more-heading" className="mt-20">
          <h2 id="more-heading" className="text-xl font-medium text-white">More CV examples</h2>
          <ul className="mt-5 flex flex-wrap gap-2.5">
            {others.map((e) => (
              <li key={e.slug}>
                <Link
                  href={`/cv-examples/${e.slug}`}
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] py-1 pl-1 pr-3.5 text-sm text-white/75 transition-colors hover:border-brand-400/60 hover:text-white"
                >
                  <span className="grid size-7 place-items-center rounded-full bg-brand-500/15 text-brand-300">
                    <CvIcon name={e.icon} size={14} />
                  </span>
                  {e.course}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

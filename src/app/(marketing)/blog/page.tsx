import type { Metadata } from "next";
import Link from "next/link";
import { guides } from "@/lib/guides";

export const metadata: Metadata = {
  title: "CV Guides for Students in Ghana",
  description: "Plain, practical guides on writing a CV, CV versus resume, and applying for national service.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  return (
    <div className="relative overflow-hidden pt-32 pb-24 sm:pt-40">
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-0 -z-10 h-[420px] w-[900px] -translate-x-1/2 rounded-full bg-brand-600/15 blur-[120px]"
      />
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h1 className="text-4xl font-medium tracking-tight text-fg sm:text-5xl">CV guides</h1>
        <p className="mt-4 text-lg text-fg/65">Plain, practical advice for students and fresh graduates in Ghana.</p>

        <ul className="mt-12 space-y-4">
          {guides.map((g) => (
            <li key={g.slug}>
              <Link
                href={`/blog/${g.slug}`}
                className="group block rounded-xl border border-fg/10 bg-fg/[0.03] p-5 transition-all hover:border-brand-400/50 hover:bg-fg/[0.05] sm:p-6"
              >
                <h2 className="text-xl font-medium text-fg">{g.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-fg/60">{g.summary}</p>
                <span className="mt-3 inline-block text-sm text-brand-300 group-hover:text-fg">Read the guide →</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { getCvExample } from "@/lib/cv-examples";
import { accentSwatches, templateFilters, templates, type TemplateTag } from "@/lib/templates";
import { CvPageFrame } from "@/components/cv/cv-page-frame";
import { CvTemplate } from "@/components/cv/cv-templates";

/**
 * Real templates rendered as full A4 pages, with filter tabs and an accent
 * colour picker. "row" scrolls sideways (homepage), "grid" shows them all.
 */
export function TemplateGallery({ layout = "grid" }: { layout?: "row" | "grid" }) {
  const [filter, setFilter] = useState<"all" | TemplateTag>("all");
  const [accent, setAccent] = useState<string | null>(null);

  const shown = templates.filter((t) => filter === "all" || t.tags.includes(filter));
  const accentStyle = accent ? ({ "--cv-accent": accent } as CSSProperties) : undefined;

  return (
    <div>
      <div className="flex flex-col items-center gap-5 px-4 sm:flex-row sm:justify-between sm:px-0">
        <div role="tablist" aria-label="Filter templates" className="flex gap-1 rounded-lg bg-fg/5 p-1">
          {templateFilters.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={`whitespace-nowrap rounded-md px-4 py-1.5 text-sm transition-colors ${
                filter === f.id ? "bg-fg/10 text-fg ring-1 ring-fg/15" : "text-fg/55 hover:text-fg"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-fg/55">Colour</span>
          <div role="radiogroup" aria-label="Accent colour" className="flex gap-2">
            {accentSwatches.map((s) => {
              const selected = accent === s.color;
              return (
                <button
                  key={s.name}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={s.name}
                  title={s.name}
                  onClick={() => setAccent(s.color)}
                  className={`size-7 rounded-full transition-transform hover:scale-110 ${
                    selected ? "ring-2 ring-brand-400 ring-offset-2 ring-offset-ink-950" : "ring-1 ring-fg/20"
                  }`}
                  style={
                    s.color
                      ? { background: s.color }
                      : { background: "conic-gradient(#1e3a5f, #047857, #9f1239, #f2b705, #1e3a5f)" }
                  }
                />
              );
            })}
          </div>
        </div>
      </div>

      <ul
        style={accentStyle}
        className={`mt-10 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 ${layout === "row" ? "px-4 sm:px-0" : ""}`}
      >
        {shown.map((t, i) => {
          const example = getCvExample(t.exampleSlug);
          if (!example) return null;
          return (
            <li
              key={t.id}
              className={`min-w-0 ${layout === "row" && i >= 6 ? "hidden" : ""}`}
            >
              <article className="group">
                <div className="relative overflow-hidden rounded-lg bg-white shadow-[0_20px_50px_-20px_rgb(0_0_0/0.5)] ring-1 ring-fg/10 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_0_50px_-12px_rgb(124_128_255/0.7)] group-hover:ring-brand-400/50">
                  <CvPageFrame lazy>
                    <CvTemplate example={example} />
                  </CvPageFrame>
                  <div className="absolute inset-0 flex items-end justify-center bg-linear-to-t from-ink-950/70 via-transparent to-transparent p-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
                    <Link
                      href={`/builder?template=${t.id}`}
                      className="rounded-md bg-brand-600 px-5 py-2.5 text-sm font-medium text-white shadow-[0_0_18px_rgb(124_128_255/0.6)] hover:bg-brand-500"
                    >
                      Use this template
                    </Link>
                  </div>
                </div>
                <div className="mt-4 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-medium text-fg">{t.name}</h3>
                    <p className="mt-1 text-sm text-fg/55">{t.blurb}</p>
                  </div>
                  {t.tags.includes("ats") && (
                    <span className="shrink-0 rounded-md bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
                      ATS-safe
                    </span>
                  )}
                </div>
                <Link
                  href={`/cv-examples/${example.slug}`}
                  className="mt-2 inline-block text-sm text-brand-300 hover:text-fg"
                >
                  See it as a {example.course.toLowerCase()} CV →
                </Link>
              </article>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

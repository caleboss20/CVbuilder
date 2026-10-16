"use client";

import Link from "next/link";
import { useRef, useState, type CSSProperties } from "react";
import { getCvExample } from "@/lib/cv-examples";
import { accentSwatches, templateFilters, templates, type TemplateTag } from "@/lib/templates";
import { AtsExplainer } from "@/components/ui/ats-explainer";
import { CvPageFrame } from "@/components/cv/cv-page-frame";
import { CvTemplateView } from "@/components/cv/cv-templates";

/**
 * Real templates rendered as full A4 pages, with filter tabs and an accent
 * colour picker. On phones it is a swipeable carousel; from the sm breakpoint
 * up it is a grid ("row" shows the first six on the homepage, "grid" shows all).
 */
export function TemplateGallery({ layout = "grid" }: { layout?: "row" | "grid" }) {
  const [filter, setFilter] = useState<"all" | TemplateTag>("all");
  const [accent, setAccent] = useState<string | null>(null);

  const shown = templates.filter((t) => filter === "all" || t.tags.includes(filter));
  const accentStyle = accent ? ({ "--cv-accent": accent } as CSSProperties) : undefined;

  const listRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);

  /** Which card sits closest to the middle of the carousel. */
  const onScroll = () => {
    const list = listRef.current;
    if (!list) return;
    const mid = list.scrollLeft + list.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    Array.from(list.children).forEach((el, i) => {
      const c = el as HTMLElement;
      const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    setActive(best);
  };

  const goTo = (i: number) => {
    const list = listRef.current;
    const card = list?.children[i] as HTMLElement | undefined;
    if (!list || !card) return;
    list.scrollTo({ left: card.offsetLeft - (list.clientWidth - card.offsetWidth) / 2, behavior: "smooth" });
  };

  const pickFilter = (id: "all" | TemplateTag) => {
    setFilter(id);
    setActive(0);
    listRef.current?.scrollTo({ left: 0 });
  };

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
              onClick={() => pickFilter(f.id)}
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

      {/* Plain-language explanation of the ATS-safe tag, since many students have not heard the term */}
<AtsExplainer className="mx-4 mt-6 sm:mx-0" />

      <ul
        ref={listRef}
        onScroll={onScroll}
        aria-label="CV templates"
        style={accentStyle}
        className={`mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-4 pb-2 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3 ${layout === "grid" ? "-mx-4 sm:mx-0" : ""}`}
      >
        {shown.map((t, i) => {
          const example = getCvExample(t.exampleSlug);
          if (!example) return null;
          return (
            <li
              key={t.id}
              data-active={i === active}
              className={`group w-[68%] max-w-64 shrink-0 snap-center sm:w-auto sm:max-w-none sm:min-w-0 ${layout === "row" && i >= 6 ? "sm:hidden" : ""}`}
            >
              <article className="group/card">
                <div className="relative overflow-hidden rounded-lg bg-white shadow-[0_20px_50px_-20px_rgb(0_0_0/0.5)] ring-1 ring-fg/10 transition-all duration-300 group-hover/card:-translate-y-1 group-hover/card:shadow-[0_0_50px_-12px_rgb(124_128_255/0.7)] group-hover/card:ring-brand-400/50">
                  <CvPageFrame lazy>
                    {/* Render this template's own design, using the example CV as sample content */}
                    <CvTemplateView template={t.id} doc={example.cv} role={example.role} photo={example.photo} />
                  </CvPageFrame>
                  <div className="absolute inset-0 flex items-end justify-center bg-linear-to-t from-ink-950/70 via-transparent to-transparent p-5 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100 group-focus-within/card:opacity-100 max-sm:group-data-[active=true]:opacity-100">
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
                    <span
                      title="Applicant Tracking System friendly: one column, plain headings, no photo"
                      className="shrink-0 rounded-md bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-300"
                    >
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

      {/* Carousel controls, phones only */}
      <div className="mt-6 flex items-center justify-between gap-4 px-4 sm:hidden">
        <button
          type="button"
          onClick={() => goTo(active - 1)}
          disabled={active === 0}
          aria-label="Previous template"
          className="grid size-10 place-items-center rounded-md text-fg ring-1 ring-fg/15 transition-opacity disabled:opacity-30"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M10 3 5 8l5 5" />
          </svg>
        </button>
        <div className="flex flex-1 flex-col items-center gap-2">
          <p aria-live="polite" className="text-sm tabular-nums text-fg/60">
            <span className="font-medium text-fg">{shown[active]?.name}</span> · {active + 1} / {shown.length}
          </p>
          <div className="h-0.5 w-full max-w-40 overflow-hidden rounded-full bg-fg/10">
            <div
              className="h-full rounded-full bg-brand-400 transition-all duration-300"
              style={{ width: `${((active + 1) / shown.length) * 100}%` }}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={() => goTo(active + 1)}
          disabled={active >= shown.length - 1}
          aria-label="Next template"
          className="grid size-10 place-items-center rounded-md text-fg ring-1 ring-fg/15 transition-opacity disabled:opacity-30"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m6 3 5 5-5 5" />
          </svg>
        </button>
      </div>
    </div>
  );
}

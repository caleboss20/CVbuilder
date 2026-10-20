"use client";

import { useLayoutEffect, useMemo, useRef, type CSSProperties } from "react";
import { HideEmptySections } from "@/components/cv/hide-empty-sections";
import { CvTemplateView } from "@/components/cv/cv-templates";
import { A4_HEIGHT, A4_WIDTH, fillWidth } from "@/lib/page-fit";
import { cvStrength, toDoc, type BuilderCv } from "@/lib/builder";

/*
 * The print copy of a CV: one full-size page that only the printer sees. The builder prints its own
 * CV with it, and the versions page prints each version the same way, so every PDF is identical in
 * quality and keeps real, readable text.
 */

/*
 * Print rules live with the print copy (not globals.css) so the PDF never depends
 * on a cached stylesheet. The copy stays off-screen, not display:none, so its
 * height can be measured for fit-to-page.
 */
const printCss = `
#cv-print { position: fixed; left: -10000px; top: 0; visibility: hidden; pointer-events: none; }
@media print {
  @page { size: A4; margin: 0; }
  html, body { background: #fff !important; margin: 0 !important; padding: 0 !important; }
  body > *:not(#cv-print) { display: none !important; }
  #cv-print { position: static; left: 0; visibility: visible; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
  #cv-print li, #cv-print section, #cv-print p { break-inside: avoid; }
  #cv-print h3 { break-after: avoid; }
}
`;

/**
 * From this CV strength up, the page is stretched to fill the sheet: sections are
 * spread out and a short CV is scaled up. A half-filled CV stays top-aligned and
 * unscaled, so the text does not jump around while the student is still typing.
 */
export const FILL_FROM_SCORE = 80;

/** Accent colour plus how sections are spaced (see FILL_FROM_SCORE). */
export function cvStyle(cv: BuilderCv, score: number): CSSProperties {
  return {
    ...(cv.accent ? { "--cv-accent": cv.accent } : {}),
    "--cv-justify": score >= FILL_FROM_SCORE ? "space-between" : "flex-start",
  } as CSSProperties;
}

/** Smallest shrink we allow before letting a very long CV run onto a second page. */
export const MIN_FIT = 0.72;


/**
 * Full-size copy of the CV that only the printer sees. If the CV is taller than
 * one A4 page, it is laid out a little wider and zoomed down so it fills exactly
 * one page edge to edge, instead of being cut across two pages.
 */
export function PrintCopy({ cv, onFit }: { cv: BuilderCv; onFit: (scale: number) => void }) {
  const doc = useMemo(() => toDoc(cv), [cv]);
  const pageRef = useRef<HTMLDivElement>(null);
  const score = cvStrength(cv).score;
  const accentStyle = cvStyle(cv, score);
  // Same rule as the preview: only a nearly complete CV is scaled up to fill the page
  const fill = score >= FILL_FROM_SCORE;

  useLayoutEffect(() => {
    const el = pageRef.current;
    if (!el) return;
    el.style.zoom = "1";
    // Rendered at width w and zoomed by A4_WIDTH / w, does the page fit one A4 height?
    const fits = (w: number) => {
      el.style.width = `${w}px`;
      return (el.offsetHeight * A4_WIDTH) / w <= A4_HEIGHT - 2;
    };
    let width = A4_WIDTH;
    if (!fits(A4_WIDTH)) {
      let lo = A4_WIDTH;
      let hi = A4_WIDTH / MIN_FIT;
      width = hi;
      if (fits(hi)) {
        for (let i = 0; i < 12; i++) {
          const mid = (lo + hi) / 2;
          if (fits(mid)) hi = mid;
          else lo = mid;
        }
        width = hi;
      }
    }
    // A short CV is laid out narrower and zoomed up so it fills the sheet
    if (fill && width === A4_WIDTH) width = fillWidth(el);
    el.style.width = `${width}px`;
    el.style.zoom = String(A4_WIDTH / width);
    // Keep the sheet exactly one A4 page tall after the zoom
    el.style.minHeight = `${(1121 * width) / A4_WIDTH}px`;
    onFit(A4_WIDTH / width);
  });

  return (
    <div id="cv-print" aria-hidden="true" style={accentStyle}>
      <style>{printCss}</style>
      <div ref={pageRef} className="@container flex min-h-[1121px] w-[794px] flex-col bg-white [&>*]:flex-1">
        <HideEmptySections type={cv.cvType}>
          <CvTemplateView template={cv.template} doc={doc} role={cv.role || "Your role"} photo={cv.photo} />
        </HideEmptySections>
      </div>
    </div>
  );
}

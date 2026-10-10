"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/** A4 width at 96 dpi. Templates always lay out at this size. */
const PAGE_WIDTH = 794;
const PAGE_MIN_HEIGHT = 1123;

/**
 * Shows a CV like a PDF preview: the full page is laid out at real A4 width,
 * then scaled to fit the available space, so phones see the same complete page
 * a recruiter would, never a cut-off or reflowed version.
 */
export function CvPageFrame({ children }: { children: ReactNode }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState<number>();

  useEffect(() => {
    const outer = outerRef.current;
    const page = pageRef.current;
    if (!outer || !page) return;

    const fit = () => {
      const s = Math.min(outer.clientWidth / PAGE_WIDTH, 1);
      setScale(s);
      setHeight(page.offsetHeight * s);
    };
    // Streamed pages can hydrate while the layout is still settling, so measure
    // after the first paint, on any resize, and whenever the container changes.
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(outer);
    ro.observe(page);
    if (outer.parentElement) ro.observe(outer.parentElement);
    const frame = requestAnimationFrame(fit);
    window.addEventListener("resize", fit);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", fit);
    };
  }, []);

  return (
    <div ref={outerRef} className="overflow-hidden" style={{ height }}>
      <div
        ref={pageRef}
        className="@container flex flex-col [&>*]:flex-1"
        style={{
          width: PAGE_WIDTH,
          minHeight: PAGE_MIN_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {children}
      </div>
    </div>
  );
}

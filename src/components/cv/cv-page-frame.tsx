"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { A4_HEIGHT, A4_WIDTH, fillWidth } from "@/lib/page-fit";

const PAGE_WIDTH = A4_WIDTH;
const PAGE_MIN_HEIGHT = A4_HEIGHT;

/**
 * Shows a CV like a PDF preview: the full page is laid out at real A4 width,
 * then scaled to fit the available space, so phones see the same complete page
 * a recruiter would, never a cut-off or reflowed version.
 *
 * With `fill` (the default), a short CV is laid out a little narrower and scaled
 * up so it fills the whole sheet instead of leaving blank space at the bottom.
 */
export function CvPageFrame({
  children,
  lazy = false,
  fill = true,
}: {
  children: ReactNode;
  lazy?: boolean;
  fill?: boolean;
}) {
  const outerRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState<number>();
  /** Width the CV is laid out at. A4 width, or narrower when a short CV is scaled up to fill. */
  const [layoutWidth, setLayoutWidth] = useState(PAGE_WIDTH);
  // Lazy frames render a blank A4 placeholder until they come near the screen
  const [shown, setShown] = useState(!lazy);

  useEffect(() => {
    if (shown) return;
    const outer = outerRef.current;
    if (!outer) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "800px 0px" },
    );
    io.observe(outer);
    return () => io.disconnect();
  }, [shown]);

  useEffect(() => {
    const outer = outerRef.current;
    const page = pageRef.current;
    if (!shown || !outer || !page) return;

    const fit = () => {
      const w = fill ? fillWidth(page) : PAGE_WIDTH;
      setLayoutWidth(w);
      // Zoom so the layout spans the page width (>1 when stretched), never wider than the container
      const s = Math.min(outer.clientWidth / w, PAGE_WIDTH / w);
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
  }, [shown, fill]);

  if (!shown) {
    return <div ref={outerRef} className="aspect-[210/297] w-full" aria-hidden="true" />;
  }

  return (
    <div ref={outerRef} className="overflow-hidden" style={{ height }}>
      <div
        ref={pageRef}
        className="@container flex flex-col [&>*]:flex-1"
        style={{
          width: layoutWidth,
          // Keeps the page exactly A4-tall once it has been scaled
          minHeight: (PAGE_MIN_HEIGHT * layoutWidth) / PAGE_WIDTH,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {children}
      </div>
    </div>
  );
}

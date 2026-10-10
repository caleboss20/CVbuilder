"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { subscribePointer } from "@/lib/pointer";

type MagneticProps = {
  children: ReactNode;
  className?: string;
  /** How strongly the element leans toward the cursor (0–1). */
  strength?: number;
  /** Extra px around the element where the pull starts. */
  range?: number;
};

/**
 * Leans its content toward a nearby cursor and springs back on leave.
 * Uses the CSS `translate` property so it composes with `transform` animations.
 * Inactive on touch devices and when reduced motion is requested.
 */
export function Magnetic({
  children,
  className = "",
  strength = 0.25,
  range = 60,
}: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      !window.matchMedia("(pointer: fine)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    return subscribePointer((p) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = p.x - cx;
      const dy = p.y - cy;
      const inside =
        Math.abs(dx) < rect.width / 2 + range &&
        Math.abs(dy) < rect.height / 2 + range;

      el.style.translate = inside
        ? `${dx * strength}px ${dy * strength}px`
        : "0px 0px";
    });
  }, [strength, range]);

  return (
    <div
      ref={ref}
      className={`transition-[translate] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${className}`}
    >
      {children}
    </div>
  );
}

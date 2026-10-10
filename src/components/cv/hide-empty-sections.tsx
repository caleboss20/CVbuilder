"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

/**
 * Hides any CV section that has a heading but nothing under it yet, so a
 * half-filled CV never shows "Education" or "Skills" with an empty space.
 */
export function HideEmptySections({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    for (const h of root.querySelectorAll("h3")) {
      const box = h.parentElement as HTMLElement | null;
      if (!box || box === root) continue;
      const empty = (box.textContent ?? "").trim() === (h.textContent ?? "").trim();
      box.style.display = empty ? "none" : "";
    }
  });

  return (
    <div ref={ref} className="contents">
      {children}
    </div>
  );
}

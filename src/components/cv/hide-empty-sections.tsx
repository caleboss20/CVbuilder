"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { headingGroup, sectionGroupOrder, type CvType } from "@/lib/cv-type";

/**
 * Tidies a rendered CV in two ways, so every template (old and new) behaves the same:
 *
 * 1. Hides any section that has a heading but nothing under it yet, so a half-filled
 *    CV never shows "Education" or "Skills" with an empty space.
 * 2. Puts sections in the order the CV type calls for (graduate: education before
 *    experience, skills-based: skills first, and so on). The templates were written
 *    with a fixed order, so this reorders them with CSS `order` after they render.
 *    Sections can only move within their own column; a section in a side column
 *    stays in that column.
 *
 * Both rely on the same structure: a section is an element whose first child is its
 * <h3> heading.
 */
export function HideEmptySections({ children, type = "standard" }: { children: ReactNode; type?: CvType }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;

    // Sections grouped by the column (parent element) they sit in
    const columns = new Map<HTMLElement, { box: HTMLElement; group: string }[]>();

    for (const h of root.querySelectorAll("h3")) {
      const box = h.parentElement as HTMLElement | null;
      if (!box || box === root) continue;
      const empty = (box.textContent ?? "").trim() === (h.textContent ?? "").trim();
      box.style.display = empty ? "none" : "";

      const column: HTMLElement | null = box.parentElement;
      if (column && column !== root) {
        const list = columns.get(column) ?? [];
        list.push({ box, group: headingGroup(h.textContent ?? "") });
        columns.set(column, list);
      }
    }

    const order = sectionGroupOrder[type];
    for (const [column, sections] of columns) {
      const wasReordered = column.dataset.cvReordered === "1";
      if (type === "standard") {
        // Undo anything a previous type did, so switching back restores the template's own order
        if (wasReordered) {
          for (const s of sections) s.box.style.order = "";
          column.style.display = "";
          column.style.flexDirection = "";
          delete column.dataset.cvReordered;
        }
        continue;
      }
      if (sections.length < 2) continue;

      const display = getComputedStyle(column).display;
      const direction = getComputedStyle(column).flexDirection;
      // A grid or a row of columns cannot be reordered safely, so leave it alone
      if (display === "grid" || (display === "flex" && direction !== "column")) continue;
      if (display !== "flex") {
        // A plain block column becomes a flex column so that `order` has an effect
        column.style.display = "flex";
        column.style.flexDirection = "column";
        column.dataset.cvReordered = "1";
      }
      sections.forEach((s, i) => {
        // Group decides the position; the original index keeps ties in their template order
        s.box.style.order = String(order.indexOf(s.group) * 100 + i);
      });
    }
  });

  return (
    <div ref={ref} className="contents">
      {children}
    </div>
  );
}

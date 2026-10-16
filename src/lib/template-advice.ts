import { closestExample } from "./course-match";
import { courseGroups, groupOf } from "./course-groups";
import type { CvTemplateName } from "./cv-examples";

/*
 * Which templates to lead with for each field of study. These are design
 * suggestions, not rules: every template works for every course. The reason is
 * written for the student, so it says what the design does for them.
 */

export type TemplateAdvice = {
  /** The field's name, e.g. "Health". */
  field: string;
  /** Templates to show first, best first. */
  ids: CvTemplateName[];
  reason: string;
};

const advice: Record<string, { ids: CvTemplateName[]; reason: string }> = {
  health: {
    ids: ["ruledClassic", "dateColumn", "sideTimeline"],
    reason: "Clean, easy-to-scan layouts that put your placements and clinical experience up front.",
  },
  engineering: {
    ids: ["sideTimeline", "iconLine", "gridLeft"],
    reason: "Structured layouts that keep your projects, tools and skills easy to find.",
  },
  computing: {
    ids: ["gridLeft", "serifNavy", "greyBars"],
    reason: "Skills-forward designs with room for projects, which is what computing employers read first.",
  },
  business: {
    ids: ["serifExecutive", "ruledClassic", "greyBars"],
    reason: "Formal, one-column layouts that suit banks, firms and online application systems.",
  },
  sciences: {
    ids: ["serifExecutive", "thinSplit", "ruledClassic"],
    reason: "Formal layouts with space for lab work, field work and research.",
  },
  social: {
    ids: ["serifNavy", "dateColumn", "lavenderBand"],
    reason: "Readable, polished designs that let your writing, research and activities stand out.",
  },
  education: {
    ids: ["dateColumn", "iconLine", "ruledClassic"],
    reason: "Clear timelines for placements and teaching practice, in a plain layout schools expect.",
  },
  creative: {
    ids: ["sidePanel", "gridBand", "sideStripe"],
    reason: "Designs with more personality. A photo is common in creative fields, so photo templates are fine here.",
  },
  service: {
    ids: ["ruledClassic", "dateColumn", "iconLine"],
    reason: "Plain, clear layouts that suit national service applications.",
  },
};

/** The advice for a student's course, or null when they have not picked one. */
export function templateAdviceFor(courseSlug?: string, courseName?: string): TemplateAdvice | null {
  // A typed course we have no example for borrows the closest field's example
  const slug = courseName ? closestExample(courseName).slug : courseSlug;
  if (!slug) return null;
  const group = groupOf(slug);
  const entry = advice[group];
  const field = courseGroups.find((g) => g.id === group)?.label;
  return entry && field ? { field, ...entry } : null;
}

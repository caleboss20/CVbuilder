/**
 * Groups for the course list on the builder's start screen. With 28 courses a flat
 * list is slow to scan; a student looking for "Physics" should find it under
 * Sciences in one tap. This only affects the picker, not any CV content.
 *
 * Kept apart from the example data so adding a course is one line here.
 */

export type CourseGroup = { id: string; label: string };

/** In the order the chips appear. */
export const courseGroups: CourseGroup[] = [
  { id: "health", label: "Health" },
  { id: "engineering", label: "Engineering and built environment" },
  { id: "computing", label: "Computing and data" },
  { id: "business", label: "Business and finance" },
  { id: "sciences", label: "Sciences and agriculture" },
  { id: "social", label: "Law, social sciences and humanities" },
  { id: "education", label: "Education" },
  { id: "creative", label: "Creative and media" },
  { id: "service", label: "National service" },
];

/** Which group each example course belongs to, by slug. */
const groupBySlug: Record<string, string> = {
  medicine: "health",
  nursing: "health",
  midwifery: "health",
  pharmacy: "health",
  "medical-laboratory-science": "health",
  "public-health": "health",

  "civil-engineering": "engineering",
  "mechanical-engineering": "engineering",
  "electrical-engineering": "engineering",
  architecture: "engineering",

  "computer-science": "computing",
  "information-technology": "computing",
  "data-science": "computing",

  accounting: "business",
  banking: "business",
  "business-administration": "business",
  marketing: "business",
  economics: "business",
  "human-resource-management": "business",

  "biological-sciences": "sciences",
  physics: "sciences",
  "environmental-science": "sciences",
  agriculture: "sciences",

  law: "social",
  psychology: "social",
  english: "social",

  teaching: "education",

  "graphic-design": "creative",
  journalism: "creative",

  "national-service": "service",
};

/** The group a course is in. Unknown courses fall under business so they are never hidden. */
export const groupOf = (slug: string): string => groupBySlug[slug] ?? "business";

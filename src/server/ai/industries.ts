import "server-only";

import { industries } from "@/lib/industries";

/**
 * Turns the CV checker's industry list into a short hint for the prompt, so suggestions use the
 * words recruiters in that field expect. Returns an empty string for a field we do not know.
 */
export function industryHint(fieldOrId: string | undefined): string {
  if (!fieldOrId) return "";
  const wanted = fieldOrId.toLowerCase();
  const match = industries.find((i) => i.id === wanted || i.label.toLowerCase() === wanted);
  if (!match || match.keywords.length === 0) return "";
  return `The student works in ${match.label}. Recruiters there expect words like: ${match.keywords.join(", ")}. Use one only when it is true of what the student did.`;
}

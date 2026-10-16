import type { BuilderCv } from "./builder";

/*
 * A first draft of the summary, built from what the student has already typed
 * (their course, school, first job and top skills) plus what they are looking for.
 * It is a starting point to edit, not finished writing, and uses no AI.
 */

export type SummaryGoal = { id: string; label: string; phrase: string };

/** What the student wants next. `phrase` finishes the sentence "Looking for ...". */
export const summaryGoals: SummaryGoal[] = [
  { id: "internship", label: "An internship", phrase: "an internship where I can learn and contribute" },
  { id: "service", label: "National service", phrase: "a national service placement where I can contribute and grow" },
  { id: "job", label: "My first job", phrase: "my first full-time role where I can apply what I have learned" },
  { id: "study", label: "Further study", phrase: "a place on a postgraduate programme to deepen my research skills" },
];

const first = (s: string) => s.split(",")[0].trim();

/** "Nursing Student" -> "nursing student" for use mid-sentence. All-caps words (KNUST, BSc, IT) stay as written. */
const lowerWords = (s: string) =>
  s
    .split(/\s+/)
    .map((w) => (/^[A-Z]{2,}$/.test(w) || /[a-z][A-Z]/.test(w) ? w : w.toLowerCase()))
    .join(" ");

/** Joins items as "a", "a and b", or "a, b and c". */
function listOf(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
}

/** Builds a draft summary, or an empty string when there is not enough to say anything true. */
export function buildSummaryStarter(cv: BuilderCv, goal: SummaryGoal): string {
  const school = cv.education.find((e) => e.school.trim());
  const degree = cv.education.find((e) => e.degree.trim())?.degree.trim();

  // "Nursing Student" if they wrote a role, else "BSc Nursing student"
  const who = lowerWords(cv.role.trim() || (degree ? `${degree} student` : "student"));
  const article = /^[aeiou]/i.test(who) ? "an" : "a";
  const where = school ? ` at ${first(school.school)}` : "";

  const job = cv.experience.find((j) => j.title.trim());
  const experience = job ? ` with experience as ${/^[aeiou]/i.test(job.title.trim()) ? "an" : "a"} ${job.title.trim().toLowerCase()}${job.place.trim() ? ` at ${first(job.place)}` : ""}` : "";

  const skills = cv.skills
    .flatMap((g) => g.items.split(","))
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3);
  const strengths = skills.length ? ` Strong in ${listOf(skills)}.` : "";

  return `${article.charAt(0).toUpperCase() + article.slice(1)} ${who}${where}${experience}.${strengths} Looking for ${goal.phrase}.`;
}

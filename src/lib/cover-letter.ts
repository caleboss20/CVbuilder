import type { BuilderCv } from "./builder";
import { refineText } from "./refine";

export type LetterKind = "job" | "internship" | "service";

export type LetterInput = {
  kind: LetterKind;
  company: string;
  role: string;
  manager: string;
  why: string;
};

const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
const noDot = (s: string) => s.trim().replace(/[.!?]+$/, "");

/** Writes a first draft from the student's CV. They can edit every word after. */
export function draftLetter(cv: BuilderCv, input: LetterInput): string[] {
  const company = input.company.trim() || "your organisation";
  const role = input.role.trim();
  // What the student is applying for, worded to match the category they picked.
  // With no role typed we fall back to generic wording that still reads naturally
  // (the role is never spliced into a sentence as an empty or duplicated "the").
  const what = !role
    ? input.kind === "service"
      ? "a national service placement"
      : input.kind === "internship"
        ? "the advertised internship"
        : "the advertised position"
    : input.kind === "internship"
      ? /intern/i.test(role)
        ? `the ${role} position`
        : `the ${role} internship`
      : input.kind === "service"
        ? `a national service placement as ${role}`
        : `the ${role} position`;

  const school = cv.education.find((e) => e.school.trim());
  const who = cv.role.trim() || "student";
  const article = /^[aeiou]/i.test(who) ? "an" : "a";
  const intro = `I am writing to apply for ${what} at ${company}. I am ${article} ${who}${
    school ? ` at ${school.school.split(",")[0].trim()}` : ""
  }, and I believe I can make a real contribution to your team.`;

  const why = input.why.trim() ? refineText(input.why, "summary")[0] : "";
  const p1 = why ? `${intro} ${why}` : intro;

  const job = cv.experience.find((j) => j.title.trim() && j.bullets.some((b) => b.trim()));
  const bullets = job ? job.bullets.map((b) => noDot(b)).filter(Boolean) : [];
  const p2 = job
    ? `In my role as ${job.title.trim()}${job.place.trim() ? ` at ${job.place.split(",")[0].trim()}` : ""}, I ${lower(bullets[0])}.${
        bullets[1] ? ` I also ${lower(bullets[1])}.` : ""
      } This taught me to work carefully, take responsibility and deliver results.`
    : "";

  const skills = cv.skills
    .flatMap((g) => g.items.split(","))
    .map((s) => s.trim())
    .filter(Boolean)
    // Lower-case ordinary words mid-sentence, keep names like Excel or SQL
    .map((s) => (/^[A-Z][a-z]+(\s[a-z]+)+$/.test(s) ? lower(s) : s))
    .slice(0, 4);
  const project = cv.projects.find((p) => p.name.trim() && p.detail.trim());
  const skillText = skills.length
    ? `I bring skills in ${skills.slice(0, -1).join(", ")}${skills.length > 1 ? " and " : ""}${skills.at(-1)}.`
    : "";
  const projectText = project ? ` Through my ${project.name.trim()} project, I ${lower(noDot(project.detail))}.` : "";
  const p3 = (skillText + projectText).trim();

  const p4 = `I would welcome the opportunity to discuss how I can contribute to ${company}. Thank you for considering my application. I look forward to hearing from you.`;

  return [p1, p2, p3, p4].filter(Boolean);
}

export const letterKinds: { id: LetterKind; label: string }[] = [
  { id: "job", label: "Job" },
  { id: "internship", label: "Internship" },
  { id: "service", label: "National service" },
];

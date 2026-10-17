import "server-only";

import { generateJson } from "../gemini";
import { industryHint } from "../industries";
import { CV_RULES } from "../rules";
import { numbersComeFromInput } from "../validate";
import type { ImproveBulletResult } from "./improve-bullet";

/** Same shape as a bullet rewrite: the new text and one sentence on what changed. */
export type ImproveSummaryResult = ImproveBulletResult;

export type SummaryInput = {
  /** The student's own rough summary, if they wrote one. */
  draft: string;
  course: string;
  targetRole: string;
  field: string;
  skills: string;
  /** A few lines about what they have done, so the summary rests on real facts. */
  highlights: string;
};

const SCHEMA = {
  type: "OBJECT",
  properties: { improved: { type: "STRING" }, why: { type: "STRING" } },
  required: ["improved", "why"],
};

/** Extra rules for a summary. They override the "one line" rule that suits bullets. */
const SUMMARY_RULES = `For a CV summary: write 2 to 3 sentences, never fewer than 30 and never more than 60 words, in the first person without using "I" (for example "Final-year Accounting student with...").
Say who the student is, what they can do, and what they are looking for. Use only the facts given below.`;

/**
 * Writes or tidies a CV summary from whatever the student has: a rough draft, or just a course,
 * skills and highlights. Returns null when the answer breaks a rule, such as adding a number.
 */
export async function improveSummary(input: SummaryInput): Promise<ImproveSummaryResult | null> {
  const system = [CV_RULES, SUMMARY_RULES, industryHint(input.field)].filter(Boolean).join("\n\n");
  const facts = [
    input.course && `Course: ${input.course}`,
    input.targetRole && `Looking for: ${input.targetRole}`,
    input.skills && `Skills: ${input.skills}`,
    input.highlights && `What they have done: ${input.highlights}`,
  ].filter(Boolean);

  const prompt = [
    input.draft ? "Rewrite this summary and keep the student's meaning." : "Write a summary from the facts.",
    "In the why field, say in one plain sentence what you did or what to add.",
    ...facts,
    input.draft && `<student_text>${input.draft}</student_text>`,
  ]
    .filter(Boolean)
    .join("\n");

  const result = await generateJson<ImproveSummaryResult>({ system, prompt, schema: SCHEMA });
  const improved = result.improved?.trim();
  // Every number must come from something the student gave us, not only from the draft
  const given = [input.draft, input.course, input.skills, input.highlights].join(" ");
  if (!improved || !numbersComeFromInput(given, improved)) return null;
  return { improved, why: result.why?.trim() ?? "" };
}

import "server-only";

import { generateJson } from "../gemini";
import { industryHint } from "../industries";
import { CV_RULES } from "../rules";
import { numbersComeFromInput } from "../validate";
import type { ImproveBulletResult } from "./improve-bullet";

export type ProjectInput = {
  /** The project's title, as the student typed it. */
  name: string;
  /** Their own words on what it was and what it achieved. May be short or muddled. */
  detail: string;
  course: string;
  field: string;
};

const SCHEMA = {
  type: "OBJECT",
  properties: { improved: { type: "STRING" }, why: { type: "STRING" } },
  required: ["improved", "why"],
};

/** Extra rules for a project. They replace the "one line" rule that suits bullets. */
const PROJECT_RULES = `For a CV project description: write 1 or 2 sentences, 20 to 40 words.
Say what the project was and what it achieved or delivered, in that order. Name tools or methods only if the student mentioned them.
If the student never said what it achieved, describe what it was, and in the why note ask ONE short question that would let them add the result (for example: how many people used it?).`;

/**
 * Tidies the "what it was and what it achieved" box of a project. This is the box students find
 * hardest to explain, so the why note doubles as a nudge for the missing piece.
 * Returns null when the answer breaks a rule, such as adding a number.
 */
export async function improveProject(input: ProjectInput): Promise<ImproveBulletResult | null> {
  const system = [CV_RULES, PROJECT_RULES, industryHint(input.field)].filter(Boolean).join("\n\n");
  const prompt = [
    input.course && `Course: ${input.course}`,
    `Project name: ${input.name}`,
    "Rewrite the student's description of this project. In the why field, say in one plain sentence what you improved or what to add.",
    `<student_text>${input.detail}</student_text>`,
  ]
    .filter(Boolean)
    .join("\n");

  const result = await generateJson<ImproveBulletResult>({ system, prompt, schema: SCHEMA });
  const improved = result.improved?.trim();
  if (!improved || !numbersComeFromInput(`${input.name} ${input.detail}`, improved)) return null;
  return { improved, why: result.why?.trim() ?? "" };
}

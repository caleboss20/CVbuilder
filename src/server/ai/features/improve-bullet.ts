import "server-only";

import { generateJson } from "../gemini";
import { industryHint } from "../industries";
import { CV_RULES } from "../rules";
import { numbersComeFromInput } from "../validate";

export type ImproveBulletResult = {
  /** The rewritten line. */
  improved: string;
  /** One short sentence telling the student what changed and why. */
  why: string;
};

const SCHEMA = {
  type: "OBJECT",
  properties: { improved: { type: "STRING" }, why: { type: "STRING" } },
  required: ["improved", "why"],
};

/**
 * Rewrites one CV bullet. Returns null when the AI's answer breaks a rule (for example it added a
 * number the student never gave), so the caller can say "no suggestion" instead of showing a bad one.
 */
export async function improveBullet(input: { text: string; role?: string; field?: string }): Promise<ImproveBulletResult | null> {
  const system = [CV_RULES, industryHint(input.field)].filter(Boolean).join("\n\n");
  const prompt = [
    input.role ? `Role: ${input.role}` : "",
    "Rewrite this CV bullet. In the why field, say in one plain sentence what you improved.",
    `<student_text>${input.text}</student_text>`,
  ]
    .filter(Boolean)
    .join("\n");

  const result = await generateJson<ImproveBulletResult>({ system, prompt, schema: SCHEMA });
  const improved = result.improved?.trim();
  if (!improved || !numbersComeFromInput(input.text, improved)) return null;
  return { improved, why: result.why?.trim() ?? "" };
}

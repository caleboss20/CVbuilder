import "server-only";

/** Every number found in a piece of text, digits only, such as "GH₵ 1,200" -> "1200". */
function numbersIn(text: string): Set<string> {
  return new Set((text.match(/\d[\d,.]*/g) ?? []).map((n) => n.replace(/[,.]+$/, "").replace(/,/g, "")));
}

/**
 * Safety check on an AI rewrite: every number in the result must already be in what the student
 * wrote. The AI is told never to invent facts, but this catches the times it does anyway.
 */
export function numbersComeFromInput(input: string, output: string): boolean {
  const allowed = numbersIn(input);
  for (const n of numbersIn(output)) if (!allowed.has(n)) return false;
  return true;
}

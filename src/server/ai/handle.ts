import "server-only";

import { GeminiError, geminiConfigured } from "./gemini";
import { guardRequest } from "./guards";

/**
 * The shared skeleton of every AI route: is the AI on, is the caller allowed, is the body valid,
 * run the feature, and turn any failure into a calm message. A route file then only has to say
 * how to read its body and which feature to run.
 *
 * `parse` returns the clean input, or a string with the error to show the student.
 * `run` returns the JSON reply.
 */
export async function handleAiRequest<Input>(
  request: Request,
  name: string,
  parse: (body: Record<string, unknown>) => Input | string,
  run: (input: Input) => Promise<unknown>,
): Promise<Response> {
  if (!geminiConfigured) return Response.json({ error: "The AI is not switched on yet." }, { status: 503 });

  const guard = await guardRequest(request);
  if (!guard.ok) return Response.json({ error: guard.error }, { status: guard.status });

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body !== "object") return Response.json({ error: "Bad request." }, { status: 400 });

  const input = parse(body);
  if (typeof input === "string") return Response.json({ error: input }, { status: 400 });

  try {
    const result = await run(input);
    // Tell the browser how many free tries are left, so it can show "3 left today"
    return Response.json({ ...(result as object), remaining: guard.remaining });
  } catch (err) {
    await guard.refund();
    // Google's own per-minute limit: many students at once. Nothing is broken, so say so kindly
    if (err instanceof GeminiError && err.status === 429) {
      return Response.json({ error: "Lots of students are using the AI right now. Please try again in a minute." }, { status: 429 });
    }
    // Log the real cause for us; students only see a calm message
    console.error(`[ai] ${name} failed:`, err instanceof GeminiError ? err.message : err);
    return Response.json({ error: "The AI could not help just now. Please try again." }, { status: 502 });
  }
}

/** Reads a string field, trimmed and cut to a maximum length. Empty string when missing. */
export function textField(body: Record<string, unknown>, key: string, max: number): string {
  const v = body[key];
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

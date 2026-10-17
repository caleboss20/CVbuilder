import "server-only";

import { GEMINI_API_KEY, GEMINI_MODEL, LIMITS } from "./config";

/** Raised for any problem calling Gemini. The message is safe to log, never shown as-is to students. */
export class GeminiError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
  }
}

/** True when a key is set. Routes check this first and answer "AI is not switched on yet". */
export const geminiConfigured = Boolean(GEMINI_API_KEY);

type JsonSchema = Record<string, unknown>;

/**
 * Asks Gemini for a JSON answer that matches `schema` and returns it parsed.
 * The key travels in a header, not the URL, so it never lands in a log line.
 */
export async function generateJson<T>(opts: {
  system: string;
  prompt: string;
  schema: JsonSchema;
  /** Low = steady and factual (default), higher = more varied wording. */
  temperature?: number;
}): Promise<T> {
  if (!GEMINI_API_KEY) throw new GeminiError("GEMINI_API_KEY is not set");

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": GEMINI_API_KEY },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: opts.system }] },
      contents: [{ role: "user", parts: [{ text: opts.prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: opts.schema,
        temperature: opts.temperature ?? 0.3,
        maxOutputTokens: 800,
      },
    }),
    signal: AbortSignal.timeout(LIMITS.timeoutMs),
    cache: "no-store",
  }).catch((err: unknown) => {
    throw new GeminiError(err instanceof Error ? err.message : "network error");
  });

  if (!res.ok) throw new GeminiError(`Gemini answered ${res.status}`, res.status);

  const data = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new GeminiError("Gemini returned no text");
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new GeminiError("Gemini returned invalid JSON");
  }
}

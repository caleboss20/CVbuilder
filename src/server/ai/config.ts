import "server-only";

/**
 * Every AI setting in one place. Secrets come from environment variables
 * (.env.local on this computer, Project Settings > Environment Variables on Vercel)
 * and never reach the browser, because this folder is marked `server-only`.
 */

/** The Gemini key. Undefined until the owner adds one, and the AI then stays switched off. */
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * Which Gemini model to call. Flash-Lite is fast and has by far the biggest free allowance
 * (500 requests a day, against 20 for the full Flash model), and with the examples in rules.ts
 * it stays faithful to what the student wrote.
 */
export const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-3.5-flash-lite";

/**
 * Who may use the AI. "admin" while we test it, "everyone" once credits and payments exist.
 * Change it with the AI_ACCESS variable, no code change needed.
 */
export const AI_ACCESS: "admin" | "everyone" = process.env.AI_ACCESS === "everyone" ? "everyone" : "admin";

/**
 * Hard limits on what one request may send. The daily number of requests per person and per site
 * lives in the database (supabase/ai.sql, table ai_settings), so it can change without a deploy.
 */
export const LIMITS = {
  /** Longest bullet or summary we accept, in characters. */
  textChars: 600,
  /** Longest voice transcript we accept, in characters. */
  transcriptChars: 2000,
  /** Give up on Gemini after this long so a student is never left waiting. */
  timeoutMs: 15_000,
} as const;

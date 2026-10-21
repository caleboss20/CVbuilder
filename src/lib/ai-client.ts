/**
 * Browser-side helpers for the AI. The server does the real work in src/server/ai; this file only
 * sends the request with the signed-in student's token and tidies up the reply.
 */

export type AiKind = "improve-bullet" | "improve-project" | "improve-summary";

export type AiSuggestion = {
  /** The text to offer in place of what the student wrote. */
  improved: string;
  /** One sentence on what changed, or what the student could add. */
  why: string;
  /** Free tries left today, when the server says. */
  remaining?: number;
};

/** Either a suggestion, or a message that is safe to show the student. */
export type AiResult = { ok: true; suggestion: AiSuggestion } | { ok: false; message: string };

/** Asks one AI feature for a suggestion. Never throws. */
export async function askAi(kind: AiKind, body: Record<string, string>, token: string | undefined): Promise<AiResult> {
  try {
    const res = await fetch(`/api/ai/${kind}`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${token ?? ""}` },
      body: JSON.stringify(body),
    });
    const data = (await res.json()) as Partial<AiSuggestion> & { error?: string };
    if (!res.ok) return { ok: false, message: data.error ?? "The AI could not help just now." };
    if (!data.improved) return { ok: false, message: "No safe suggestion this time. Try adding a little more detail." };
    return { ok: true, suggestion: { improved: data.improved, why: data.why ?? "", remaining: data.remaining } };
  } catch {
    return { ok: false, message: "Could not reach CV11. Check your internet." };
  }
}

export type TranscriptChange = { heard: string; meant: string };

/** The result of checking a transcript for mishearings. */
export type TranscriptCheck =
  | { ok: true; corrected: string; changes: TranscriptChange[] }
  | { ok: false; message: string };

/** Asks the AI which words in a transcript were probably misheard. Never throws. */
export async function askTranscriptCheck(body: Record<string, string>, token: string | undefined): Promise<TranscriptCheck> {
  try {
    const res = await fetch("/api/ai/fix-transcript", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${token ?? ""}` },
      body: JSON.stringify(body),
    });
    const data = (await res.json()) as { corrected?: string; changes?: TranscriptChange[]; error?: string };
    if (!res.ok) return { ok: false, message: data.error ?? "The AI could not help just now." };
    return { ok: true, corrected: data.corrected ?? body.transcript, changes: data.changes ?? [] };
  } catch {
    return { ok: false, message: "Could not reach CV11. Check your internet." };
  }
}

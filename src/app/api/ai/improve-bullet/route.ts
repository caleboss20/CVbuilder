import { LIMITS } from "@/server/ai/config";
import { improveBullet } from "@/server/ai/features/improve-bullet";
import { GeminiError, geminiConfigured } from "@/server/ai/gemini";
import { guardRequest } from "@/server/ai/guards";

/**
 * POST /api/ai/improve-bullet
 * Body: { text: string, role?: string, field?: string }
 * Reply: { improved, why } or { suggestion: null } when nothing safe could be offered.
 */
export async function POST(request: Request) {
  if (!geminiConfigured) return Response.json({ error: "The AI is not switched on yet." }, { status: 503 });

  const guard = await guardRequest(request);
  if (!guard.ok) return Response.json({ error: guard.error }, { status: guard.status });

  const body = (await request.json().catch(() => null)) as { text?: unknown; role?: unknown; field?: unknown } | null;
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  if (!text) return Response.json({ error: "Type a line first." }, { status: 400 });
  if (text.length > LIMITS.textChars) return Response.json({ error: "That line is too long." }, { status: 413 });

  try {
    const result = await improveBullet({
      text,
      role: typeof body?.role === "string" ? body.role.slice(0, 100) : undefined,
      field: typeof body?.field === "string" ? body.field.slice(0, 50) : undefined,
    });
    return Response.json(result ?? { suggestion: null });
  } catch (err) {
    // Log the real cause for us; students only see a calm message
    console.error("[ai] improve-bullet failed:", err instanceof GeminiError ? err.message : err);
    return Response.json({ error: "The AI could not help just now. Please try again." }, { status: 502 });
  }
}

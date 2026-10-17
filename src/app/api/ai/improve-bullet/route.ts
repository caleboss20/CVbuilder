import { LIMITS } from "@/server/ai/config";
import { improveBullet } from "@/server/ai/features/improve-bullet";
import { handleAiRequest, textField } from "@/server/ai/handle";

/**
 * POST /api/ai/improve-bullet
 * Body: { text: string, role?: string, field?: string }
 * Reply: { improved, why } or { suggestion: null } when nothing safe could be offered.
 */
export function POST(request: Request) {
  return handleAiRequest(
    request,
    "improve-bullet",
    (body) => {
      const text = textField(body, "text", LIMITS.textChars + 1);
      if (!text) return "Type a line first.";
      if (text.length > LIMITS.textChars) return "That line is too long.";
      return { text, role: textField(body, "role", 100), field: textField(body, "field", 50) };
    },
    async (input) => (await improveBullet(input)) ?? { suggestion: null },
  );
}

import { LIMITS } from "@/server/ai/config";
import { improveProject } from "@/server/ai/features/improve-project";
import { handleAiRequest, textField } from "@/server/ai/handle";

/**
 * POST /api/ai/improve-project
 * Body: { name: string, detail: string, course?: string, field?: string }
 * Reply: { improved, why } or { suggestion: null } when nothing safe could be offered.
 */
export function POST(request: Request) {
  return handleAiRequest(
    request,
    "improve-project",
    (body) => {
      const detail = textField(body, "detail", LIMITS.textChars + 1);
      if (!detail) return "Describe the project first.";
      if (detail.length > LIMITS.textChars) return "That description is too long.";
      return { name: textField(body, "name", 100), detail, course: textField(body, "course", 100), field: textField(body, "field", 50) };
    },
    async (input) => (await improveProject(input)) ?? { suggestion: null },
  );
}

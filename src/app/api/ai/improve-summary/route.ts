import { LIMITS } from "@/server/ai/config";
import { improveSummary } from "@/server/ai/features/improve-summary";
import { handleAiRequest, textField } from "@/server/ai/handle";

/**
 * POST /api/ai/improve-summary
 * Body: { draft?: string, course?: string, targetRole?: string, field?: string, skills?: string, highlights?: string }
 * Reply: { improved, why } or { suggestion: null } when nothing safe could be offered.
 */
export function POST(request: Request) {
  return handleAiRequest(
    request,
    "improve-summary",
    (body) => {
      const input = {
        draft: textField(body, "draft", LIMITS.textChars + 1),
        course: textField(body, "course", 100),
        targetRole: textField(body, "targetRole", 100),
        field: textField(body, "field", 50),
        skills: textField(body, "skills", 300),
        highlights: textField(body, "highlights", 600),
      };
      if (input.draft.length > LIMITS.textChars) return "That summary is too long.";
      // Something to work from: their own draft, or at least a course and some skills or highlights
      if (!input.draft && !(input.course && (input.skills || input.highlights))) {
        return "Write a rough summary first, or add your course and a few skills.";
      }
      return input;
    },
    async (input) => (await improveSummary(input)) ?? { suggestion: null },
  );
}

import { LIMITS } from "@/server/ai/config";
import { fixTranscript } from "@/server/ai/features/fix-transcript";
import { handleAiRequest, textField } from "@/server/ai/handle";

/**
 * POST /api/ai/fix-transcript
 * Body: { transcript: string, course?: string, role?: string, field?: string }
 * Reply: { corrected, changes: [{ heard, meant }] }. `changes` is empty when nothing looked misheard.
 */
export function POST(request: Request) {
  return handleAiRequest(
    request,
    "fix-transcript",
    (body) => {
      const transcript = textField(body, "transcript", LIMITS.transcriptChars + 1);
      if (!transcript) return "Say or type something first.";
      if (transcript.length > LIMITS.transcriptChars) return "That is too long to check in one go.";
      return { transcript, course: textField(body, "course", 100), role: textField(body, "role", 100), field: textField(body, "field", 50) };
    },
    (input) => fixTranscript(input),
  );
}

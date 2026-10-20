import { bearerToken, userFromToken } from "@/server/supabase-rest";
import { confirmPayment } from "@/server/pay/confirm";
import { paymentsConfigured } from "@/server/pay/paystack";

/**
 * POST /api/pay/verify
 * Body: { reference: string }, signed in. Called by the page Paystack sends the student back to.
 * Reply: { paid: boolean }. The answer comes from Paystack itself, not from the browser.
 */
export async function POST(request: Request) {
  if (!paymentsConfigured) return Response.json({ error: "Payments are not switched on yet." }, { status: 503 });

  const token = bearerToken(request);
  if (!token || !(await userFromToken(token))) return Response.json({ error: "Please log in first." }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { reference?: unknown } | null;
  const reference = typeof body?.reference === "string" ? body.reference.slice(0, 100) : "";
  if (!reference) return Response.json({ error: "Bad request." }, { status: 400 });

  return Response.json({ paid: await confirmPayment(reference) });
}

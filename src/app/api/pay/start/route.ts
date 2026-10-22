import { callSupabase, bearerToken, userFromToken } from "@/server/supabase-rest";
import { initializeTransaction, paymentsConfigured } from "@/server/pay/paystack";

/**
 * POST /api/pay/start
 * Body: { cvId: string }, signed in. Reply: { url } the Paystack checkout page to send the student to.
 * The price comes from the database, never from the browser.
 */
export async function POST(request: Request) {
  if (!paymentsConfigured) return Response.json({ error: "Payments are not switched on yet." }, { status: 503 });

  const token = bearerToken(request);
  const user = token ? await userFromToken(token) : null;
  if (!token || !user) return Response.json({ error: "Please log in first." }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { cvId?: unknown; partner?: unknown } | null;
  const cvId = typeof body?.cvId === "string" ? body.cvId.slice(0, 100) : "";
  if (!cvId) return Response.json({ error: "Bad request." }, { status: 400 });
  // An optional partner code: letters and digits only, checked by the database
  const partner = typeof body?.partner === "string" ? body.partner.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12) : "";

  // The database creates the pending payment and decides the price
  const started = await callSupabase("/rest/v1/rpc/payment_start", { token, body: { p_cv_id: cvId, p_partner: partner || null } });
  if (!started?.ok) {
    const problem = ((await started?.json().catch(() => null)) as { message?: string } | null)?.message ?? "";
    if (problem.includes("unknown partner code")) return Response.json({ error: "That partner code is not valid. Check it, or leave it empty." }, { status: 400 });
    if (problem.includes("own code")) return Response.json({ error: "You cannot use your own partner code." }, { status: 400 });
    return Response.json({ error: "Could not start the payment. Please try again." }, { status: 502 });
  }
  const { reference, amount } = (await started.json()) as { reference: string; amount: number };

  const url = await initializeTransaction({
    email: user.email,
    amount,
    reference,
    callbackUrl: `${new URL(request.url).origin}/pay/return`,
    cvId,
  });
  if (!url) return Response.json({ error: "Could not reach the payment page. Please try again." }, { status: 502 });

  return Response.json({ url });
}

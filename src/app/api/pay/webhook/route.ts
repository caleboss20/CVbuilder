import { confirmPayment } from "@/server/pay/confirm";
import { webhookSignatureIsValid } from "@/server/pay/paystack";

/**
 * POST /api/pay/webhook
 * Paystack calls this itself when a payment succeeds, even if the student closed the page before
 * coming back. Set this URL in the Paystack dashboard under Settings > API Keys & Webhooks.
 * The signature proves the call is really from Paystack; the payment is then checked again with
 * Paystack before anything is unlocked.
 */
export async function POST(request: Request) {
  const raw = await request.text();
  if (!webhookSignatureIsValid(raw, request.headers.get("x-paystack-signature"))) {
    return new Response("Bad signature", { status: 401 });
  }

  const event = JSON.parse(raw) as { event?: string; data?: { reference?: string } };
  if (event.event === "charge.success" && event.data?.reference) {
    await confirmPayment(event.data.reference);
  }
  // Always answer 200 for a genuine call, so Paystack does not keep retrying
  return new Response("ok");
}

import "server-only";

import { callSupabase } from "../supabase-rest";
import { CONFIRM_SECRET, verifyTransaction } from "./paystack";

/**
 * Turns a successful Paystack payment into an unlocked CV. Used by both the return page and the
 * webhook, so it never trusts what the browser or the webhook body claims: it asks Paystack itself,
 * checks the money and currency, and only then calls the database function. Safe to run twice.
 * Returns true when the payment is recorded as paid.
 */
export async function confirmPayment(reference: string): Promise<boolean> {
  if (!CONFIRM_SECRET) return false;

  const tx = await verifyTransaction(reference);
  if (!tx || tx.status !== "success" || tx.currency !== "GHS" || tx.reference !== reference) return false;

  const res = await callSupabase("/rest/v1/rpc/payment_confirm", {
    body: { p_reference: reference, p_amount: tx.amount, p_secret: CONFIRM_SECRET },
  });
  return res?.ok === true && (await res.json()) === true;
}

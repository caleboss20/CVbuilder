import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

const API = "https://api.paystack.co";

/** The secret key. Undefined until the owner adds it, and payments then stay switched off. */
const SECRET = process.env.PAYSTACK_SECRET_KEY;

/** The secret our database function expects, so only our server can mark a payment as paid. */
export const CONFIRM_SECRET = process.env.PAYMENT_CONFIRM_SECRET;

/** True when everything needed to take payments is set. */
export const paymentsConfigured = Boolean(SECRET && CONFIRM_SECRET);

async function paystack<T>(path: string, init?: RequestInit): Promise<T | null> {
  if (!SECRET) return null;
  try {
    const res = await fetch(`${API}${path}`, {
      ...init,
      headers: { authorization: `Bearer ${SECRET}`, "content-type": "application/json" },
      signal: AbortSignal.timeout(15_000),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { status?: boolean; data?: T };
    return body.status ? (body.data ?? null) : null;
  } catch {
    return null;
  }
}

/** Starts a checkout. Returns the Paystack page the student should be sent to. Amount is in pesewas. */
export async function initializeTransaction(input: {
  email: string;
  amount: number;
  reference: string;
  callbackUrl: string;
  cvId: string;
}): Promise<string | null> {
  const data = await paystack<{ authorization_url: string }>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email: input.email,
      amount: input.amount,
      currency: "GHS",
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: { cv_id: input.cvId },
    }),
  });
  return data?.authorization_url ?? null;
}

export type VerifiedTransaction = { status: string; amount: number; currency: string; reference: string };

/** Asks Paystack directly what happened to a payment. This, not the browser, is the source of truth. */
export async function verifyTransaction(reference: string): Promise<VerifiedTransaction | null> {
  return paystack<VerifiedTransaction>(`/transaction/verify/${encodeURIComponent(reference)}`);
}

/** Checks that a webhook really came from Paystack: HMAC-SHA512 of the raw body with our secret key. */
export function webhookSignatureIsValid(rawBody: string, signature: string | null): boolean {
  if (!SECRET || !signature) return false;
  const expected = createHmac("sha512", SECRET).update(rawBody).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}

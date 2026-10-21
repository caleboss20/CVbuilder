"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { useUser } from "@/components/auth/use-user";
import { recordForVerify, verifyUrl } from "@/lib/cert-share";
import { stampVerifyQrs } from "@/lib/certificate-verify";

/** An error whose message is safe to show to the organiser as it is. */
export class VerifyError extends Error {}

/** The message to show for a failed download: the specific one for a verify problem, else null. */
export const verifyMessage = (err: unknown): string | null => (err instanceof VerifyError ? err.message : null);

type Stamp = (bytes: Uint8Array, forNames: string[]) => Promise<Uint8Array>;

/**
 * The "Add a verify QR" choice under the download buttons. Signed-in organisers can tick it: CV11 then
 * keeps the names, and each certificate gets a small QR that confirms it is genuine. Left unticked,
 * nothing leaves the device and the certificates have no QR.
 *
 * Call `prepare()` inside the download's try block. It returns a function that stamps a finished PDF
 * (the PDF it is given, unchanged, when the option is off).
 */
export function useVerifyOption({ title, issuer, names }: { title: string; issuer: string; names: string[] }): { node: ReactNode; prepare: () => Promise<Stamp> } {
  const { user, loading } = useUser();
  const [on, setOn] = useState(false);

  async function prepare(): Promise<Stamp> {
    if (!on || !user) return async (bytes) => bytes;
    const refs = await recordForVerify({ title: title.trim() || "Certificates", issuer, names }).catch((e: unknown) => {
      throw new VerifyError(e instanceof Error ? e.message : "We could not add the verify QR. Please try again.");
    });
    return (bytes, forNames) => stampVerifyQrs(bytes, forNames.map((n) => verifyUrl(refs.get(n) ?? "")));
  }

  const node = loading ? null : (
    <div className="rounded-lg border border-fg/10 p-3 text-sm">
      <label className={`flex items-start gap-2 ${user ? "" : "opacity-60"}`}>
        <input type="checkbox" checked={on && Boolean(user)} disabled={!user} onChange={(e) => setOn(e.target.checked)} className="mt-1" />
        <span className="text-fg/80">
          Add a verify QR to each certificate
          <span className="block text-xs text-fg/50">CV11 keeps these names so anyone who scans the QR can confirm the certificate is genuine.</span>
        </span>
      </label>
      {!user && (
        <p className="mt-2 text-xs text-fg/60">
          <Link href="/login" className="text-brand-300 underline">Log in</Link> (free) to use this.
        </p>
      )}
    </div>
  );

  return { node, prepare };
}

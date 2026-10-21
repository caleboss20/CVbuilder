"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { verifyCertificate, type Verified } from "@/lib/cert-share";

/** The page a certificate's QR code opens: it says whether the certificate is real, and for whom. */
export function VerifyCertificate() {
  const ref = useSearchParams().get("c") ?? "";
  // undefined while checking, null when the check could not be made
  const [result, setResult] = useState<Verified | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    (ref ? verifyCertificate(ref) : Promise.resolve({ valid: false } as Verified)).then((r) => {
      if (!cancelled) setResult(r);
    });
    return () => {
      cancelled = true;
    };
  }, [ref]);

  const box = "mx-auto max-w-xl rounded-xl border p-6 text-center";
  if (result === undefined) return <p className="text-center text-fg/60">Checking…</p>;
  if (result === null) return <p className="text-center text-fg/70">We could not check this right now. Please try again in a moment.</p>;
  if (!result.valid) {
    return (
      <div className={`${box} border-amber-300/40 bg-amber-300/5`} role="status">
        <p className="text-lg font-medium text-fg">We could not verify this certificate</p>
        <p className="mt-2 text-sm text-fg/65">It may have been removed by the organiser, or the link may be wrong. Ask the organiser to confirm it.</p>
      </div>
    );
  }
  return (
    <div className={`${box} border-emerald-400/40 bg-emerald-400/5`} role="status">
      <p className="text-lg font-medium text-emerald-300">✓ This certificate is genuine</p>
      <p className="mt-4 text-2xl text-fg">{result.name}</p>
      <p className="mt-2 text-fg/70">{result.title}</p>
      {result.issuer && <p className="mt-1 text-sm text-fg/55">Issued by {result.issuer}</p>}
      <p className="mt-1 text-sm text-fg/55">{new Date(result.issued).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
    </div>
  );
}

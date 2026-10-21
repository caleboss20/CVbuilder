import type { Metadata } from "next";
import { Suspense } from "react";
import { VerifyCertificate } from "@/components/tools/verify-certificate";

// A check page for one certificate: search engines should not list it
export const metadata: Metadata = {
  title: "Verify a Certificate",
  robots: { index: false, follow: false },
};

export default function VerifyPage() {
  return (
    <div className="pt-32 pb-24 sm:pt-40">
      <div className="mx-auto max-w-2xl px-6 sm:px-8">
        <h1 className="text-center text-3xl font-medium tracking-tight text-fg sm:text-4xl">Verify a certificate</h1>
        <div className="mt-8">
          <Suspense fallback={<p className="text-center text-fg/60">Checking…</p>}>
            <VerifyCertificate />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

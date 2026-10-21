import type { Metadata } from "next";
import { Suspense } from "react";
import { ClaimCertificate } from "@/components/tools/claim-certificate";

// Personal links should not be listed by search engines
export const metadata: Metadata = {
  title: "Get Your Certificate",
  robots: { index: false, follow: false },
};

export default function ClaimPage() {
  return (
    <div className="pt-32 pb-24 sm:pt-40">
      <div className="mx-auto max-w-2xl px-6 sm:px-8">
        <h1 className="text-center text-3xl font-medium tracking-tight text-fg sm:text-4xl">Get your certificate</h1>
        <div className="mt-8">
          <Suspense fallback={<p className="text-center text-fg/60">Loading…</p>}>
            <ClaimCertificate />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

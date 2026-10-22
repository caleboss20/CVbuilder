import type { Metadata } from "next";
import { AffiliatePanel } from "@/components/affiliates/affiliate-panel";

export const metadata: Metadata = {
  title: "Affiliate Dashboard",
  robots: { index: false, follow: false },
};

export default function AffiliateDashboardPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24">
      <h1 className="text-center text-3xl font-medium tracking-tight text-zinc-950 sm:text-4xl">Your affiliate dashboard</h1>
      <div className="mt-8">
        <AffiliatePanel />
      </div>
    </div>
  );
}

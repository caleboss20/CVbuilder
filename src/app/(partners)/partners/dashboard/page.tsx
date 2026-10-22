import type { Metadata } from "next";
import { PartnerPanel } from "@/components/partners/partner-panel";

export const metadata: Metadata = {
  title: "Partner Dashboard",
  robots: { index: false, follow: false },
};

export default function PartnerDashboardPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24">
      <h1 className="text-center text-3xl font-medium tracking-tight text-fg sm:text-4xl">Your partner dashboard</h1>
      <div className="mt-8">
        <PartnerPanel />
      </div>
    </div>
  );
}

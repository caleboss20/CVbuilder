import type { Metadata } from "next";
import { PartnerPanel } from "@/components/partners/partner-panel";

export const metadata: Metadata = {
  title: "Become a CV11 Partner",
  robots: { index: false, follow: true },
};

export default function JoinPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6 sm:py-24">
      <h1 className="text-center text-3xl font-medium tracking-tight text-fg sm:text-4xl">Become a partner</h1>
      <p className="mt-3 text-center text-fg/65">Free to join. Earn a reward for every CV the people you help pay for.</p>
      <div className="mt-8">
        <PartnerPanel />
      </div>
    </div>
  );
}

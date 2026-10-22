import type { Metadata } from "next";
import { AffiliatePanel } from "@/components/affiliates/affiliate-panel";

export const metadata: Metadata = {
  title: "Become a CV11 Affiliate",
  robots: { index: false, follow: true },
};

export default function JoinPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6 sm:py-24">
      <h1 className="text-center text-3xl font-medium tracking-tight text-zinc-950 sm:text-4xl">Become an affiliate</h1>
      <p className="mt-3 text-center text-zinc-600">Free to join. Earn a reward for every CV the people you help pay for.</p>
      <div className="mt-8">
        <AffiliatePanel />
      </div>
    </div>
  );
}

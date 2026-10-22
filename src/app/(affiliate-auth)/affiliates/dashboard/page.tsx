import type { Metadata } from "next";
import { AffiliateDashboard } from "@/components/affiliates/dashboard/affiliate-dashboard";

export const metadata: Metadata = {
  title: "Affiliate Dashboard",
  robots: { index: false, follow: false },
};

export default function AffiliateDashboardPage() {
  return <AffiliateDashboard />;
}

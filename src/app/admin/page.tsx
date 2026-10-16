import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin/dashboard";

// A private page for the site owner, kept out of search results
export const metadata: Metadata = {
  title: "Analytics",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminDashboard />;
}

import type { Metadata } from "next";
import { AiLab } from "@/components/admin/ai-lab";

// A private test bench for the site owner, kept out of search results
export const metadata: Metadata = {
  title: "AI lab",
  robots: { index: false, follow: false },
};

export default function AiLabPage() {
  return <AiLab />;
}

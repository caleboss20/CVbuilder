import type { Metadata } from "next";
import { VersionsMaker } from "@/components/builder/versions-maker";

export const metadata: Metadata = {
  title: "CV Versions",
  description: "Make your CV in several looks, one for each company you apply to.",
  // Personal to each visitor, so keep it out of search results
  robots: { index: false, follow: true },
};

export default function VersionsPage() {
  return <VersionsMaker />;
}

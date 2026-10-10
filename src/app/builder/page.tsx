import type { Metadata } from "next";
import { Builder } from "@/components/builder/builder";

export const metadata: Metadata = {
  title: "CV Builder",
  description: "Build your CV step by step with live preview, 13 templates and a free PDF download.",
  alternates: { canonical: "/builder" },
  // The editor is personal and changes per visitor, so keep it out of search results
  robots: { index: false, follow: true },
};

export default function BuilderPage() {
  return <Builder />;
}

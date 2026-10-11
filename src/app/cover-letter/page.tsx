import type { Metadata } from "next";
import { CoverLetterBuilder } from "@/components/builder/cover-letter";

export const metadata: Metadata = {
  title: "Cover Letter Builder",
  description: "Write a cover letter that matches your CV in minutes. Free for students in Ghana.",
  alternates: { canonical: "/cover-letter" },
  robots: { index: false, follow: true },
};

export default function CoverLetterPage() {
  return <CoverLetterBuilder />;
}

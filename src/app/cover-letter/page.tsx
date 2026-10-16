import type { Metadata } from "next";
import { CoverLetterBuilder } from "@/components/builder/cover-letter";

export const metadata: Metadata = {
  title: "Letter Writer",
  description:
    "Write a cover letter, scholarship letter, university application, reference request, thank-you or follow-up that matches your CV. Free for students in Ghana.",
  alternates: { canonical: "/cover-letter" },
  robots: { index: false, follow: true },
};

export default function CoverLetterPage() {
  return <CoverLetterBuilder />;
}

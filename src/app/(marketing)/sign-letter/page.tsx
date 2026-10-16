import type { Metadata } from "next";
import { SignLetter } from "@/components/tools/sign-letter";

export const metadata: Metadata = {
  title: "Text to PDF: Paste a Letter, Assignment or Code and Download a PDF",
  description:
    "Paste or type any text, such as a letter, an assignment or code, and download it as a PDF. Add a signature if you want one. Free, and your text never leaves your device.",
  alternates: { canonical: "/sign-letter" },
};

export default function SignLetterPage() {
  return (
    <div className="relative overflow-hidden pt-32 pb-24 sm:pt-40">
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-0 -z-10 h-[420px] w-[900px] -translate-x-1/2 rounded-full bg-brand-600/15 blur-[120px]"
      />
      <div className="mx-auto max-w-2xl px-6 sm:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-medium tracking-tight text-fg sm:text-5xl">Text to PDF</h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-fg/65 sm:text-lg">
            Paste or type anything: a letter, an assignment, notes or code. Download it as a PDF, ready to email. Add a signature if you need one. Your text stays on your device.
          </p>
        </div>
        <div className="mt-12">
          <SignLetter />
        </div>
      </div>
    </div>
  );
}

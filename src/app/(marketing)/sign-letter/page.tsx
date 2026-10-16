import type { Metadata } from "next";
import { SignLetter } from "@/components/tools/sign-letter";

export const metadata: Metadata = {
  title: "Write, Edit and Sign Your Letter: Free PDF Letter Maker",
  description:
    "Write a letter, or upload a PDF or Word letter and edit it, then add your signature under 'Yours faithfully' and download it as a PDF. Free, and your letter never leaves your device.",
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
          <h1 className="text-4xl font-medium tracking-tight text-fg sm:text-5xl">Write or sign your letter</h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-fg/65 sm:text-lg">
            Type a letter, or upload a PDF or Word file and change the words. Then add your signature and download it. Your letter stays on your device.
          </p>
        </div>
        <div className="mt-12">
          <SignLetter />
        </div>
      </div>
    </div>
  );
}

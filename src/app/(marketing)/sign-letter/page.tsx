import type { Metadata } from "next";
import { SignLetter } from "@/components/tools/sign-letter";

export const metadata: Metadata = {
  title: "Sign Your Letter: Add a Signature to a PDF for Free",
  description:
    "Already have an application letter? Draw your signature, drag it into place on your PDF or a photo of the letter, and download the signed copy. Free, and your letter never leaves your device.",
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
          <h1 className="text-4xl font-medium tracking-tight text-fg sm:text-5xl">Sign your letter</h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-fg/65 sm:text-lg">
            Already wrote your letter? Add your signature in three steps, with no printing or scanning. Your letter stays on your device.
          </p>
        </div>
        <div className="mt-12">
          <SignLetter />
        </div>
      </div>
    </div>
  );
}

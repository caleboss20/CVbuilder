import type { Metadata } from "next";
import { CvChecker } from "@/components/checker/cv-checker";

export const metadata: Metadata = {
  title: "Free CV Checker: Score Your CV for a Job",
  description:
    "Upload your CV, add the job you want and get a score out of 100 with practical fixes. Free for students and graduates in Ghana. Your CV never leaves your device.",
  alternates: { canonical: "/cv-checker" },
};

export default function CvCheckerPage() {
  return (
    <div className="relative overflow-hidden pt-32 pb-24 sm:pt-40">
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-0 -z-10 h-[420px] w-[900px] -translate-x-1/2 rounded-full bg-brand-600/15 blur-[120px]"
      />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-medium tracking-tight text-fg sm:text-5xl">Is your CV strong enough?</h1>
          <p className="mt-4 text-base text-fg/65 sm:text-lg">
            Upload your CV and tell us the job you want. You get a score out of 100 and clear steps to improve it before you
            apply.
          </p>
        </div>
        <div className="mt-12">
          <CvChecker />
        </div>
      </div>
    </div>
  );
}

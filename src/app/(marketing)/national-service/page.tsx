import type { Metadata } from "next";
import { NationalServiceChecklist } from "@/components/tracker/national-service-checklist";

export const metadata: Metadata = {
  title: "National Service Preparation Checklist",
  description:
    "A step-by-step checklist to get ready for national service: documents, CV, cover letter, referees and applications. Free, and saved on your device.",
  alternates: { canonical: "/national-service" },
};

export default function NationalServicePage() {
  return (
    <div className="relative overflow-hidden pt-32 pb-24 sm:pt-40">
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-0 -z-10 h-[420px] w-[900px] -translate-x-1/2 rounded-full bg-brand-600/15 blur-[120px]"
      />
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center">
          <h1 className="text-4xl font-medium tracking-tight text-fg sm:text-5xl">National service checklist</h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-fg/65 sm:text-lg">
            Everything to have ready before you apply, in order. Tick things off as you go. We save your progress on your phone.
          </p>
        </div>
        <div className="mt-12">
          <NationalServiceChecklist />
        </div>
      </div>
    </div>
  );
}

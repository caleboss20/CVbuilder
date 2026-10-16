import type { Metadata } from "next";
import { ApplicationTracker } from "@/components/tracker/application-tracker";

export const metadata: Metadata = {
  title: "Free Job Application Tracker for Students",
  description:
    "Keep track of every job, internship and national service application: the stage, the date and when to follow up. Free, and saved only on your device.",
  alternates: { canonical: "/tracker" },
};

export default function TrackerPage() {
  return (
    <div className="relative overflow-hidden pt-32 pb-24 sm:pt-40">
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-0 -z-10 h-[420px] w-[900px] -translate-x-1/2 rounded-full bg-brand-600/15 blur-[120px]"
      />
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center">
          <h1 className="text-4xl font-medium tracking-tight text-fg sm:text-5xl">Application tracker</h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-fg/65 sm:text-lg">
            Applying for many places? Keep them all in one list, see what needs a follow-up, and never lose track of who you wrote to.
          </p>
        </div>
        <div className="mt-12">
          <ApplicationTracker />
        </div>
      </div>
    </div>
  );
}

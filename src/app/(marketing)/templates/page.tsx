import type { Metadata } from "next";
import { TemplateGallery } from "@/components/marketing/template-gallery";

export const metadata: Metadata = {
  title: "Free CV Templates for Students",
  description:
    "13 free, professional CV templates for students and graduates in Ghana. Simple, photo and ATS-safe designs you can recolour and download as PDF.",
  alternates: { canonical: "/templates" },
};

export default function TemplatesPage() {
  return (
    <div className="relative overflow-hidden pt-32 pb-24 sm:pt-40">
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-0 -z-10 h-[420px] w-[900px] -translate-x-1/2 rounded-full bg-brand-600/15 blur-[120px]"
      />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-medium tracking-tight text-fg sm:text-5xl">CV templates</h1>
          <p className="mt-4 text-base text-fg/65 sm:text-lg">
            Professional designs made for students. Pick one, change the colour, and fill it in with
            your own details.
          </p>
        </div>
        <div className="mt-14">
          <TemplateGallery />
        </div>
      </div>
    </div>
  );
}

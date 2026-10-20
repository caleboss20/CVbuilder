import type { Metadata } from "next";
import { CertificatesTool } from "@/components/tools/certificates-tool";

export const metadata: Metadata = {
  title: "Bulk Certificate Maker: Make Certificates for Everyone at Once",
  description:
    "Paste a list of names, pick a design and download a certificate for every person in one go, as a ZIP of PDFs or one PDF to print. Made for events, workshops, clubs and schools in Ghana.",
  alternates: { canonical: "/certificates" },
};

export default function CertificatesPage() {
  return (
    <div className="relative overflow-hidden pt-32 pb-24 sm:pt-40">
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-0 -z-10 h-[420px] w-[900px] -translate-x-1/2 rounded-full bg-brand-600/15 blur-[120px]"
      />
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-medium tracking-tight text-fg sm:text-5xl">Certificates for everyone, at once</h1>
          <p className="mt-4 text-base text-fg/65 sm:text-lg">
            Paste your list of names, pick a design and download a certificate for each person. Made for events, workshops, clubs and schools.
          </p>
        </div>
        <div className="mt-12">
          <CertificatesTool />
        </div>
      </div>
    </div>
  );
}

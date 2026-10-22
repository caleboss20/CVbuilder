import type { ReactNode } from "react";
import { PartnersFooter, PartnersHeader } from "@/components/partners/partners-chrome";

/** The partner programme looks and feels like its own site, with its own header and footer, but lives inside CV11. */
export default function PartnersLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PartnersHeader />
      <main className="flex-1">{children}</main>
      <PartnersFooter />
    </>
  );
}

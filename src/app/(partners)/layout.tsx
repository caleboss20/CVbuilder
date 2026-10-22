import type { ReactNode } from "react";
import { PartnersFooter, PartnersHeader } from "@/components/partners/partners-chrome";

/** The partner programme looks like its own site, with its own navbar and footer, but lives inside CV11. */
export default function PartnersLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-white text-zinc-950">
      <PartnersHeader />
      <main className="flex-1">{children}</main>
      <PartnersFooter />
    </div>
  );
}

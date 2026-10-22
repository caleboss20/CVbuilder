import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AffiliatesFooter, AffiliatesHeader } from "@/components/affiliates/affiliates-chrome";

// Invite-only for now: reachable by link, but not listed by search engines. Remove this when the program opens to everyone.
export const metadata: Metadata = { robots: { index: false, follow: false } };

/** The affiliate program looks like its own site, with its own navbar and footer, but lives inside CV11. */
export default function AffiliatesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-white text-zinc-950">
      <AffiliatesHeader />
      <main className="flex-1">{children}</main>
      <AffiliatesFooter />
    </div>
  );
}

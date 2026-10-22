import type { Metadata } from "next";
import type { ReactNode } from "react";

// Invite-only for now, like the rest of the affiliate site. These screens have no navbar or footer of their own
// (the screen component draws everything), so this layout adds nothing but the search-engine rule.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AffiliateAuthLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

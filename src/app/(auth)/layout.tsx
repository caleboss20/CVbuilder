import type { ReactNode } from "react";

/**
 * The sign-in screens have no site menu or footer, so they live in their own group. This layout adds
 * nothing of its own: the page, theme and analytics still come from the root layout.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/ui/logo";

/**
 * A full-screen sign-in layout in the style of Vercel's own: no menu or footer, the logo on the left,
 * a button to switch between log in and sign up on the right, and one narrow column in the middle with
 * a large heading above the form. Used for log in, sign up and choosing a new password.
 */
export function AuthScreen({
  title,
  intro,
  switchTo,
  children,
}: {
  title: string;
  intro?: string;
  /** The button at the top right, such as "Sign Up" on the log-in screen. */
  switchTo?: { label: string; href: string };
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-ink-950 text-fg">
      <header className="flex items-center justify-between px-4 py-4 sm:px-6">
        <Logo />
        {switchTo && (
          <Link
            href={switchTo.href}
            className="inline-flex h-9 items-center rounded-md border border-fg/15 px-3.5 text-sm font-medium text-fg transition-colors hover:bg-fg/5"
          >
            {switchTo.label}
          </Link>
        )}
      </header>

      <main className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center px-4 pb-24">
        <h1 className="text-balance text-center text-[32px] leading-[1.25] text-fg">{title}</h1>
        {intro && <p className="mt-3 text-center text-sm leading-relaxed text-fg/55">{intro}</p>}
        <div className="mt-8">{children}</div>
      </main>

      <footer className="px-4 pb-6 text-center text-xs leading-relaxed text-fg/40">
        By continuing, you agree to our{" "}
        <Link href="/terms" className="underline underline-offset-2 hover:text-fg/70">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline underline-offset-2 hover:text-fg/70">
          Privacy Policy
        </Link>
        .
      </footer>
    </div>
  );
}

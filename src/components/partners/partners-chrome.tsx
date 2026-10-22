import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

/** The partner site's own header: its own name and menu, with a way back to CV11. */
export function PartnersHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-fg/10 bg-ink-950/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        {/* The logo is already a link to the CV11 homepage; the badge beside it goes to the partner site */}
        <div className="flex items-center gap-2.5">
          <Logo />
          <Link href="/partners" className="rounded-full bg-emerald-400/15 px-2.5 py-0.5 text-xs font-medium text-emerald-300 ring-1 ring-emerald-400/30" aria-label="CV11 Partners home">
            Partners
          </Link>
        </div>
        <nav aria-label="Partners" className="ml-6 hidden items-center gap-6 text-sm text-fg/65 md:flex">
          <a href="/partners#how" className="hover:text-fg">How it works</a>
          <a href="/partners#earn" className="hover:text-fg">Earnings</a>
          <a href="/partners#faq" className="hover:text-fg">FAQ</a>
          <Link href="/partners/terms" className="hover:text-fg">Terms</Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link href="/" className="hidden text-sm text-fg/60 hover:text-fg sm:block">
            Back to CV11
          </Link>
          <Link href="/partners/dashboard" className="hidden h-10 items-center rounded-md px-3.5 text-sm text-fg/80 ring-1 ring-fg/20 hover:bg-fg/5 sm:inline-flex">
            My dashboard
          </Link>
          <ButtonLink href="/partners/join">Join now</ButtonLink>
        </div>
      </div>
    </header>
  );
}

export function PartnersFooter() {
  return (
    <footer className="border-t border-fg/10 bg-ink-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-sm text-fg/55 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>CV11 Partners is part of CV11, the CV builder and job-hunt toolkit for students in Ghana.</p>
        <nav aria-label="Partners footer" className="flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/partners/terms" className="hover:text-fg">Partner terms</Link>
          <Link href="/privacy" className="hover:text-fg">Privacy</Link>
          <Link href="/" className="hover:text-fg">cv11 home</Link>
        </nav>
      </div>
    </footer>
  );
}

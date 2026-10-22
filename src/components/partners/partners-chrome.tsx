import Link from "next/link";
import { LogoMark, Wordmark } from "@/components/ui/logo";
import { PromoBar } from "./promo-bar";

/**
 * The CV11 Partners top of page: a thin announcement bar, then the navbar on a deep blue-violet background
 * that carries straight into the hero. Laid out like a software affiliate page (logo left, links beside it,
 * "Login" and a call to action on the right). The text is Geist, the same font as the rest of CV11.
 */

/** The CV11 mark and wordmark, with the word "Partners" (dropped on very narrow phones to leave room). */
export function PartnersLogo() {
  return (
    <Link href="/partners" aria-label="CV11 Partners home" className="flex min-w-0 items-center gap-2">
      <LogoMark size={30} />
      <Wordmark className="text-white" size={22} />
      <span className="hidden whitespace-nowrap text-[15px] font-medium tracking-tight text-white/70 min-[420px]:inline">Partners</span>
    </Link>
  );
}

const links = [
  { label: "How it works", href: "/partners#how" },
  { label: "Earnings", href: "/partners#earn" },
  { label: "FAQ", href: "/partners#faq" },
  { label: "CV11", href: "/" },
];

/** The language menu. English is the only language for now, so it is a small list with one choice. */
function LanguageMenu() {
  return (
    <details className="group relative">
      <summary className="flex h-9 cursor-pointer list-none items-center gap-1.5 rounded-lg px-2.5 text-sm text-white/85 marker:hidden hover:bg-white/10 [&::-webkit-details-marker]:hidden">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z" />
        </svg>
        English
        <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="transition-transform group-open:rotate-180">
          <path d="M5 8l5 5 5-5" />
        </svg>
      </summary>
      <ul className="absolute right-0 top-full z-50 mt-1 w-40 rounded-lg bg-white py-1 text-sm shadow-lg">
        <li className="flex items-center justify-between px-3 py-2 font-medium text-zinc-950">
          English
          <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="#5b5fe0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4.5 10.5l3.5 3.5 7.5-8" />
          </svg>
        </li>
      </ul>
    </details>
  );
}

export function PartnersHeader() {
  return (
    <>
      {/* Announcement bar, with a close button */}
      <PromoBar />

      {/* Navbar */}
      <header className="relative z-30 bg-[#16145f]">
        <div className="mx-auto flex h-[72px] max-w-[1200px] items-center gap-3 px-4 sm:h-[84px] sm:gap-8 sm:px-8">
          <PartnersLogo />
          <nav aria-label="Partners" className="hidden items-center gap-7 text-sm text-white/85 lg:flex">
            {links.map((l) => (
              <a key={l.label} href={l.href} className="hover:text-white">
                {l.label}
              </a>
            ))}
          </nav>
          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-3">
            <div className="hidden sm:block">
              <LanguageMenu />
            </div>
            <Link href="/partners/dashboard" className="hidden px-2 text-sm text-white/90 hover:text-white sm:block">
              Login
            </Link>
            <Link href="/partners/join" className="inline-flex h-9 items-center whitespace-nowrap rounded-lg bg-white px-3.5 text-[13px] font-medium text-[#16145f] transition-colors hover:bg-[#e6e7ff] sm:h-10 sm:px-5 sm:text-sm">
              Join now
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}

export function PartnersFooter() {
  return (
    <footer className="bg-[#0c0b33] text-white/65">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-5 py-10 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div>
          <PartnersLogo />
          <p className="mt-3 max-w-sm">CV11 Partners is part of CV11, the CV builder and job-hunt toolkit for students in Ghana.</p>
        </div>
        <nav aria-label="Partners footer" className="flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/partners/terms" className="hover:text-white">Partner terms</Link>
          <Link href="/privacy" className="hover:text-white">Privacy</Link>
          <Link href="/" className="hover:text-white">cv11 home</Link>
        </nav>
      </div>
    </footer>
  );
}

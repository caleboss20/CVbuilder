import Link from "next/link";

/**
 * The CV11 Partners navbar and footer. Laid out like a retail partner site: the mark and name on the left,
 * and on the right a language menu, "Login" and a black "Join Now" button. The text is Geist, the same
 * font as the rest of CV11, and the colours are CV11's: black, violet and white.
 */

/** The CV11 mark with the word "Partners". */
export function PartnersLogo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/partners" aria-label="CV11 Partners home" className="flex items-center gap-2.5">
      <svg width="30" height="30" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <rect width="28" height="28" rx="8" fill={light ? "#ffffff" : "#09090b"} />
        <path d="M18.5 9.2A6 6 0 1 0 18.5 18.8" stroke={light ? "#09090b" : "#ffffff"} strokeWidth="3" strokeLinecap="round" />
        <circle cx="21" cy="7" r="2.2" fill="#7c80ff" />
      </svg>
      <span className={`whitespace-nowrap text-lg font-extrabold tracking-tight sm:text-xl ${light ? "text-white" : "text-zinc-950"}`}>
        CV11 <span className="font-extrabold">Partners</span>
      </span>
    </Link>
  );
}

/** The language menu. English is the only language for now, so it is a small list with one choice. */
function LanguageMenu() {
  return (
    <details className="group relative">
      <summary className="flex h-[37px] cursor-pointer list-none items-center gap-2 rounded-lg px-3 text-sm font-medium text-zinc-950 marker:hidden hover:bg-black/5 [&::-webkit-details-marker]:hidden">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z" />
        </svg>
        English
        <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="transition-transform group-open:rotate-180">
          <path d="M5 8l5 5 5-5" />
        </svg>
      </summary>
      <ul className="absolute right-0 top-full z-50 mt-1 w-40 rounded-lg bg-white py-1 text-sm shadow-lg ring-1 ring-black/10">
        <li className="flex items-center justify-between px-3 py-2 font-medium text-zinc-950">
          English
          <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="#7c80ff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4.5 10.5l3.5 3.5 7.5-8" />
          </svg>
        </li>
      </ul>
    </details>
  );
}

/** The navbar. It sits on top of the page's gradient, with no bar or border of its own. */
export function PartnersHeader() {
  return (
    <header className="relative z-30 h-[70px] w-full">
      <div className="flex h-full items-center justify-between px-5 sm:px-9 lg:pr-[50px]">
        <PartnersLogo />
        <div className="flex items-center gap-1 sm:gap-5">
          <div className="hidden sm:block">
            <LanguageMenu />
          </div>
          <Link href="/partners/dashboard" className="px-2 text-sm font-medium text-zinc-950 hover:underline">
            Login
          </Link>
          <Link href="/partners/join" className="inline-flex h-[38px] items-center whitespace-nowrap rounded-lg bg-zinc-950 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800 sm:px-5">
            Join Now
          </Link>
        </div>
      </div>
    </header>
  );
}

export function PartnersFooter() {
  return (
    <footer className="bg-zinc-950 text-zinc-400">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-9">
        <div>
          <PartnersLogo light />
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

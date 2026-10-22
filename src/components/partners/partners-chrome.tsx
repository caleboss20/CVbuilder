import Link from "next/link";

/**
 * The CV11 Partners site has its own look, separate from the main CV11 site: warm paper background, deep
 * green type and a gold accent. Colours are written out here on purpose so this site does not follow the
 * CV11 light and dark theme.
 */

/** The partners mark: a rounded green square holding a "C" arc and a gold dot, with the wordmark. */
export function PartnersLogo({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/partners" aria-label="CV11 Partners home" className="flex items-center gap-2.5">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect width="32" height="32" rx="9" fill={dark ? "#f4b400" : "#0f6b4a"} />
        <path d="M20.5 10.5A7 7 0 1 0 20.5 21.5" stroke={dark ? "#0b3d2e" : "#faf7f0"} strokeWidth="3.2" strokeLinecap="round" />
        <circle cx="23.5" cy="8.5" r="2.6" fill={dark ? "#ffffff" : "#f4b400"} />
      </svg>
      <span className={`whitespace-nowrap text-base font-semibold tracking-tight sm:text-lg ${dark ? "text-white" : "text-[#0d2b21]"}`}>
        CV11 <span className="font-normal opacity-70">Partners</span>
      </span>
    </Link>
  );
}

/** The partner site's header: its own name and menu, with a way back to CV11. */
export function PartnersHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b3d2e]">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <PartnersLogo dark />
        <nav aria-label="Partners" className="ml-8 hidden items-center gap-7 text-sm font-medium text-white/75 md:flex">
          <a href="/partners#how" className="hover:text-white">How it works</a>
          <a href="/partners#earn" className="hover:text-white">Earnings</a>
          <a href="/partners#faq" className="hover:text-white">FAQ</a>
          <Link href="/" className="hover:text-white">CV11 home</Link>
        </nav>
        <div className="ml-auto flex items-center gap-2 sm:gap-4">
          <Link href="/partners/dashboard" className="hidden text-sm font-medium text-white hover:underline sm:block">
            Log in
          </Link>
          <Link
            href="/partners/join"
            className="inline-flex h-10 items-center whitespace-nowrap rounded-full bg-[#f4b400] px-5 text-sm font-semibold text-[#0b3d2e] transition-colors hover:bg-[#ffc61a]"
          >
            <span className="sm:hidden">Join</span>
            <span className="hidden sm:inline">Become a partner</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

export function PartnersFooter() {
  return (
    <footer className="bg-[#0b3d2e] text-white/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <PartnersLogo dark />
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

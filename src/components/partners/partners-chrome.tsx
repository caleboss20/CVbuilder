import Link from "next/link";
import { LogoMark, Wordmark } from "@/components/ui/logo";
import { PromoBar } from "./promo-bar";
import { PartnersNav } from "./partners-nav";

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

/** The announcement bar, then the navbar that sticks to the top and turns white as the page scrolls. */
export function PartnersHeader() {
  return (
    <>
      <PromoBar />
      <PartnersNav />
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

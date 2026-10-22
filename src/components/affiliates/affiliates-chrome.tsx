import Link from "next/link";
import { LogoMark, Wordmark } from "@/components/ui/logo";
import { siteConfig, whatsappLink } from "@/lib/site";
import { PromoBar } from "./promo-bar";
import { AffiliatesNav } from "./affiliates-nav";

/**
 * The CV11 Affiliates top of page: a thin announcement bar, then the navbar on a deep blue-violet background
 * that carries straight into the hero. Laid out like a software affiliate page (logo left, links beside it,
 * "Login" and a call to action on the right). The text is Geist, the same font as the rest of CV11.
 */

/** The CV11 mark and wordmark, with the word "Affiliates" (dropped on very narrow phones to leave room). */
export function AffiliatesLogo() {
  return (
    <Link href="/affiliates" aria-label="CV11 Affiliates home" className="flex min-w-0 items-center gap-2">
      <LogoMark size={30} />
      <Wordmark className="text-white" size={22} />
      <span className="hidden whitespace-nowrap text-[15px] font-medium tracking-tight text-white/70 min-[420px]:inline">Affiliates</span>
    </Link>
  );
}

/** The announcement bar, then the navbar that sticks to the top and turns white as the page scrolls. */
export function AffiliatesHeader() {
  return (
    <>
      <PromoBar />
      <AffiliatesNav />
    </>
  );
}

/** Link columns for the footer: the affiliate program, then CV11 itself. */
const FOOTER_COLUMNS = [
  { title: "Affiliate program", links: [{ label: "How it works", href: "/affiliates#how" }, { label: "Who can join", href: "/affiliates#who" }, { label: "FAQ", href: "/affiliates#faq" }, { label: "Become an affiliate", href: "/affiliates/join" }] },
  { title: "CV11", links: [{ label: "Build a CV", href: "/" }, { label: "Templates", href: "/templates" }, { label: "Certificates", href: "/certificates" }, { label: "Pricing", href: "/pricing" }] },
  { title: "Legal", links: [{ label: "Affiliate terms", href: "/affiliates/terms" }, { label: "Terms of use", href: "/terms" }, { label: "Privacy policy", href: "/privacy" }] },
];

/**
 * The footer, in the manner of a big network: a deep violet block with the logo and a round white contact icon,
 * three columns of links, then a thin line and the legal row with the copyright.
 */
export function AffiliatesFooter() {
  const chat = whatsappLink("Hi CV11, I have a question about the affiliate program.");
  return (
    <footer className="bg-[#16145f] text-white">
      <div className="mx-auto max-w-[1110px] px-5 pb-8 pt-14 sm:px-8 sm:pt-16">
        <div className="flex flex-col gap-12 lg:flex-row lg:justify-between">
          <div className="max-w-xs">
            <AffiliatesLogo />
            <p className="mt-5 text-[15px] leading-6 text-white/70">The CV builder and job-hunt toolkit for students in Ghana.</p>
            {chat && (
              <div className="mt-8 flex items-center gap-4">
                <span className="text-lg font-semibold">Get in touch</span>
                <a href={chat} target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp" className="flex size-10 items-center justify-center rounded-full bg-white text-[#16145f] transition-colors hover:bg-[#e6e7ff]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.7 7.1L3 21l1.9-6.1A8 8 0 1 1 21 12Z" /></svg>
                </a>
              </div>
            )}
          </div>
          <nav aria-label="Affiliates footer" className="grid grid-cols-2 gap-x-12 gap-y-10 sm:grid-cols-3 lg:gap-x-20">
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="text-base font-semibold">{col.title}</p>
                <ul className="mt-4 space-y-3 text-[15px] text-white/70">
                  {col.links.map((l) => (
                    <li key={l.href}><Link href={l.href} className="transition-colors hover:text-white">{l.label}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
        <div className="mt-14 border-t border-white/20 pt-6 text-sm text-white/60">
          {siteConfig.name} © 2026. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

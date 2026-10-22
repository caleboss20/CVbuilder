"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LogoMark, Wordmark } from "@/components/ui/logo";

const links = [
  { label: "How it works", href: "/affiliates#how" },
  { label: "FAQ", href: "/affiliates#faq" },
  { label: "CV11", href: "/" },
];

/** The English-only language menu. `light` is for the white (scrolled) state. */
function LanguageMenu({ light }: { light: boolean }) {
  return (
    <details className="group relative">
      <summary
        className={`flex h-9 cursor-pointer list-none items-center gap-1.5 rounded-lg px-2.5 text-sm marker:hidden [&::-webkit-details-marker]:hidden ${
          light ? "text-zinc-700 hover:bg-zinc-100" : "text-white/85 hover:bg-white/10"
        }`}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z" />
        </svg>
        English
        <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="transition-transform group-open:rotate-180">
          <path d="M5 8l5 5 5-5" />
        </svg>
      </summary>
      <ul className="absolute right-0 top-full z-50 mt-1 w-40 rounded-lg bg-white py-1 text-sm shadow-lg ring-1 ring-black/5">
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

/**
 * The navbar. It is the second bar, under the announcement bar. When the visitor scrolls, the announcement bar
 * goes away and this bar stays stuck to the top of the screen, and turns white with a soft shadow, the logo and
 * links turn dark and the join button turns violet. It is taller than a plain navbar so it feels solid.
 */
export function AffiliatesNav() {
  const ref = useRef<HTMLElement>(null);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = ref.current;
      if (!el) return;
      // The bar is "stuck" once the page has been scrolled up to where the bar sits (or any scroll at all, when
      // the announcement bar above it has been closed)
      setStuck(window.scrollY > 8 && window.scrollY >= el.offsetTop - 1);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <header
      ref={ref}
      className={`sticky top-0 z-40 transition-[background-color,box-shadow] duration-300 ${
        stuck ? "bg-white shadow-[0_8px_28px_-14px_rgba(22,20,95,0.45)]" : "bg-[#16145f]"
      }`}
    >
      <div className="mx-auto flex h-[76px] max-w-[1200px] items-center gap-3 px-4 sm:h-[92px] sm:gap-8 sm:px-8">
        <Link href="/affiliates" aria-label="CV11 Affiliates home" className="flex min-w-0 items-center gap-2">
          <LogoMark size={30} />
          <Wordmark className={stuck ? "text-zinc-950" : "text-white"} size={22} />
          <span className={`hidden whitespace-nowrap text-[15px] font-medium tracking-tight min-[420px]:inline ${stuck ? "text-zinc-500" : "text-white/70"}`}>Affiliates</span>
        </Link>

        <nav aria-label="Affiliates" className={`hidden items-center gap-7 text-sm lg:flex ${stuck ? "text-zinc-700" : "text-white/85"}`}>
          {links.map((l) => (
            <a key={l.label} href={l.href} className={stuck ? "hover:text-zinc-950" : "hover:text-white"}>
              {l.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-3">
          <div className="hidden sm:block">
            <LanguageMenu light={stuck} />
          </div>
          <Link href="/affiliates/login" className={`hidden px-2 text-sm font-medium sm:block ${stuck ? "text-zinc-800 hover:text-zinc-950" : "text-white/90 hover:text-white"}`}>
            Login
          </Link>
          <Link
            href="/affiliates/join"
            className={`inline-flex h-10 items-center whitespace-nowrap rounded-full px-4 text-[13px] font-medium transition-colors sm:h-11 sm:px-5 sm:text-sm ${
              stuck ? "bg-[#5b5fe0] text-white hover:bg-[#4a4ed0]" : "bg-white text-[#16145f] hover:bg-[#e6e7ff]"
            }`}
          >
            <span className="sm:hidden">Join now</span>
            <span className="hidden sm:inline">{stuck ? "Become an affiliate" : "Join now"}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

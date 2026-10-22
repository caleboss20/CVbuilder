"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LogoMark, Wordmark } from "@/components/ui/logo";

const links = [
  { label: "How it works", href: "/partners#how" },
  { label: "Earnings", href: "/partners#earn" },
  { label: "FAQ", href: "/partners#faq" },
  { label: "CV11", href: "/" },
];

/** How far down the page (in pixels) before the white bar slides in, and how far back up before it leaves. */
const SHOW_AT = 140;
const HIDE_AT = 70;

/**
 * The white bar that slides down from the top as soon as the visitor starts to scroll, like on a software
 * partner page. It carries the logo, the menu and, on the right, the one button that matters, so the way
 * to join is always in reach. The blue navbar above it scrolls away as usual.
 */
export function ScrollBar() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      // Two thresholds, so it does not flicker around a single line
      setShown((was) => (was ? y > HIDE_AT : y > SHOW_AT));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      aria-hidden={!shown}
      className={`fixed inset-x-0 top-0 z-50 bg-white shadow-[0_6px_24px_-12px_rgba(22,20,95,0.35)] transition-all duration-300 ease-out ${
        shown ? "translate-y-0 opacity-100" : "pointer-events-none invisible -translate-y-full opacity-0"
      }`}
    >
      <div className="mx-auto flex h-[64px] max-w-[1200px] items-center gap-3 px-4 sm:gap-8 sm:px-8">
        <Link href="/partners" tabIndex={shown ? 0 : -1} aria-label="CV11 Partners home" className="flex min-w-0 items-center gap-2">
          <LogoMark size={28} />
          <Wordmark className="text-zinc-950" size={21} />
          <span className="hidden whitespace-nowrap text-[15px] font-medium tracking-tight text-zinc-500 min-[420px]:inline">Partners</span>
        </Link>
        <nav aria-label="Partners shortcuts" className="hidden items-center gap-7 text-sm text-zinc-700 lg:flex">
          {links.map((l) => (
            <a key={l.label} href={l.href} tabIndex={shown ? 0 : -1} className="hover:text-zinc-950">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-4">
          <Link href="/partners/dashboard" tabIndex={shown ? 0 : -1} className="hidden text-sm font-medium text-zinc-800 hover:text-zinc-950 sm:block">
            Login
          </Link>
          <Link
            href="/partners/join"
            tabIndex={shown ? 0 : -1}
            className="inline-flex h-10 items-center whitespace-nowrap rounded-lg bg-[#5b5fe0] px-4 text-[13px] font-medium text-white transition-colors hover:bg-[#4a4ed0] sm:px-5 sm:text-sm"
          >
            Join the programme
          </Link>
        </div>
      </div>
    </div>
  );
}

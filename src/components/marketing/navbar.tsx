"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { siteConfig } from "@/lib/site";
import { Logo } from "@/components/ui/logo";
import { ButtonLink } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <nav
        aria-label="Main"
        className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
      >
        <Logo />

        <ul className="hidden items-center gap-8 lg:flex">
          {siteConfig.nav.map((item) => {
            const active = item.href === pathname;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`text-sm transition-colors ${
                    active ? "text-fg" : "text-fg/55 hover:text-fg"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="hidden items-center gap-5 lg:flex">
          <ThemeToggle />
          <Link
            href="/login"
            className="text-sm font-medium text-fg transition-colors hover:text-brand-300"
          >
            Log in
          </Link>
          <ButtonLink href="/builder">Try for free</ButtonLink>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
        <ThemeToggle />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          className="grid size-10 place-items-center rounded-lg text-fg ring-1 ring-fg/15 lg:hidden"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
            {open ? (
              <path
                d="M5 5l10 10M15 5L5 15"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M3 6h14M3 10h14M3 14h14"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
        </div>
      </nav>

      {open && (
        <div
          id="mobile-menu"
          className="mx-4 rounded-2xl border border-fg/10 bg-ink-900/95 p-4 backdrop-blur-xl lg:hidden"
        >
          <ul className="flex flex-col">
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm text-fg/75 hover:bg-fg/5 hover:text-fg"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex gap-3 border-t border-fg/10 pt-4">
            <ButtonLink href="/login" variant="ghost" className="flex-1">
              Log in
            </ButtonLink>
            <ButtonLink href="/builder" className="flex-1">
              Try for free
            </ButtonLink>
          </div>
        </div>
      )}
    </header>
  );
}

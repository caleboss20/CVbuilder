import Link from "next/link";
import type { ReactNode } from "react";
import { LogoMark, Wordmark } from "@/components/ui/logo";

/**
 * The sign-up and log-in screen of the affiliate site, in the manner of a big network's own: no navbar and no
 * footer, a dark violet page, the logo at the top left, and one narrow column holding a large heading, a line of
 * text and the form (email and password, with a pill button in the affiliate blue). Only a small line of terms
 * sits at the bottom.
 */
export function AffiliateAuthScreen({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#0c0b33] text-white">
      <header className="px-5 py-6 sm:px-10 sm:py-8">
        <Link href="/affiliates" aria-label="CV11 Affiliates home" className="inline-flex items-center gap-2">
          <LogoMark size={32} />
          <Wordmark className="translate-y-[2px] text-white" size={24} />
          <span className="translate-y-[2px] text-base font-medium tracking-tight text-white/70">Affiliates</span>
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center px-5 pb-20 sm:px-0">
        <h1 className="text-balance text-[2.25rem] font-semibold leading-[1.1] tracking-[-0.03em] sm:text-[40px]">{title}</h1>
        <p className="mt-3 text-lg leading-7 text-white/65">{intro}</p>
        <div className="mt-8">{children}</div>
      </main>

      <footer className="px-5 pb-6 text-center text-xs leading-relaxed text-white/45">
        By continuing, you agree to the{" "}
        <Link href="/affiliates/terms" className="underline underline-offset-2 hover:text-white/80">Affiliate terms</Link> and the{" "}
        <Link href="/privacy" className="underline underline-offset-2 hover:text-white/80">Privacy policy</Link>.
      </footer>
    </div>
  );
}

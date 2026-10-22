import Link from "next/link";
import { siteConfig } from "@/lib/site";

/**
 * The CV11 mark: a page with a folded corner (a CV) in violet, with a "C" on it. Like a good app icon it
 * works alone at small sizes. Used by the logo below and by the partner site.
 */
export function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size * 0.875} height={size} viewBox="0 0 28 32" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="cv11-mark" x1="2" y1="1" x2="26" y2="31" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9a9dff" />
          <stop offset="1" stopColor="#5459e8" />
        </linearGradient>
      </defs>
      <path d="M5 1h12.5L27 10.5V27a4 4 0 0 1-4 4H5a4 4 0 0 1-4-4V5a4 4 0 0 1 4-4Z" fill="url(#cv11-mark)" />
      <path d="M17.5 1v6.5a3 3 0 0 0 3 3H27L17.5 1Z" fill="#ffffff" fillOpacity="0.38" />
      <path d="M18.6 18.2a5.9 5.9 0 1 0 0 7.8" stroke="#ffffff" strokeWidth="2.9" strokeLinecap="round" />
    </svg>
  );
}

/**
 * The wordmark: lowercase, heavy and tightly spaced, in the manner of a modern commerce brand, beside the
 * mark. `className` colours the word (it follows the theme by default).
 */
export function Wordmark({ className = "text-fg", size = 22 }: { className?: string; size?: number }) {
  return (
    <span className={`font-extrabold lowercase leading-none tracking-[-0.045em] ${className}`} style={{ fontSize: size }}>
      {siteConfig.name}
    </span>
  );
}

export function Logo() {
  return (
    <Link href="/" aria-label={`${siteConfig.name} home`} className="flex items-center gap-2">
      <LogoMark />
      <Wordmark />
    </Link>
  );
}

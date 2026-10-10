import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function Logo() {
  return (
    <Link
      href="/"
      aria-label={`${siteConfig.name} home`}
      className="flex items-center gap-2 text-lg font-semibold tracking-tight text-fg"
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        aria-hidden="true"
      >
        <rect width="28" height="28" rx="8" className="fill-fg" />
        <path
          d="M18.5 9.2A6 6 0 1 0 18.5 18.8"
          className="stroke-ink-950"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="21" cy="7" r="2.2" fill="#7c80ff" />
      </svg>
      {siteConfig.name}
    </Link>
  );
}

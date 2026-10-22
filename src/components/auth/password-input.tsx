"use client";

import { useState } from "react";

const BASE = "h-12 w-full rounded-md border pl-3.5 pr-12 text-[15px] focus:outline-none";
const SITE = "border-fg/15 bg-fg/[0.03] text-fg placeholder:text-fg/40 focus:border-fg/50";
// Plain black and white, for the admin page
const LIGHT = "border-zinc-300 bg-white text-zinc-950 placeholder:text-zinc-400 focus:border-[#5b5fe0]";
const NEUTRAL = "border-afg/15 bg-afg/[0.03] text-afg placeholder:text-afg/35 focus:border-afg/60";

/**
 * A password box with an eye button to show what was typed, so a mistyped password on a small
 * phone keyboard is easy to spot. It starts hidden every time.
 */
export function PasswordInput({
  value,
  onChange,
  autoComplete,
  placeholder = "At least 8 characters",
  neutral = false,
  light = false,
}: {
  value: string;
  onChange: (value: string) => void;
  autoComplete: "current-password" | "new-password";
  placeholder?: string;
  neutral?: boolean;
  light?: boolean;
}) {
  const [shown, setShown] = useState(false);

  return (
    <span className="relative block">
      <input
        type={shown ? "text" : "password"}
        autoComplete={autoComplete}
        required
        minLength={8}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${BASE} ${neutral ? NEUTRAL : light ? LIGHT : SITE}`}
      />
      <button
        type="button"
        onClick={() => setShown((s) => !s)}
        aria-label={shown ? "Hide password" : "Show password"}
        aria-pressed={shown}
        // Sits inside the box, at its right edge
        className={`absolute inset-y-0 right-0 grid w-12 place-items-center ${neutral ? "text-afg/55 hover:text-afg" : light ? "text-zinc-500 hover:text-zinc-950" : "text-fg/55 hover:text-fg"}`}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {shown ? (
            // Eye with a line through it: tap to hide
            <>
              <path d="M3 3l18 18" />
              <path d="M10.6 6.2A9.6 9.6 0 0 1 12 6c5 0 8.5 4 9.5 6a13 13 0 0 1-2.4 3.2M6.7 7.6A13 13 0 0 0 2.5 12c1 2 4.5 6 9.5 6a9.5 9.5 0 0 0 4.2-1" />
              <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
            </>
          ) : (
            // Open eye: tap to show
            <>
              <path d="M2.5 12C3.5 10 7 6 12 6s8.5 4 9.5 6c-1 2-4.5 6-9.5 6s-8.5-4-9.5-6z" />
              <circle cx="12" cy="12" r="3" />
            </>
          )}
        </svg>
      </button>
    </span>
  );
}

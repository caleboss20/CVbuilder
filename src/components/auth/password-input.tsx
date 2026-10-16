"use client";

import { useState } from "react";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-fg/12 bg-fg/[0.03] py-3 pl-3.5 pr-12 text-[15px] text-fg placeholder:text-fg/35 focus:border-brand-400/70 focus:outline-none";

/**
 * A password box with an eye button to show what was typed, so a mistyped password on a small
 * phone keyboard is easy to spot. It starts hidden every time.
 */
export function PasswordInput({
  value,
  onChange,
  autoComplete,
  placeholder = "At least 8 characters",
}: {
  value: string;
  onChange: (value: string) => void;
  autoComplete: "current-password" | "new-password";
  placeholder?: string;
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
        className={inputClass}
      />
      <button
        type="button"
        onClick={() => setShown((s) => !s)}
        aria-label={shown ? "Hide password" : "Show password"}
        aria-pressed={shown}
        // Sits inside the box, centred on the input itself (the label above it adds space)
        className="absolute bottom-0 right-0 top-1.5 grid w-12 place-items-center text-fg/55 hover:text-fg"
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

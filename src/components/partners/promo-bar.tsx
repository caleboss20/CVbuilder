"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const KEY = "cv11-partners-bar-closed";

/** The thin announcement bar above the navbar. It can be closed, and stays closed on this device. */
export function PromoBar() {
  // Shown until we know it was closed before (storage is read after the page loads)
  const [open, setOpen] = useState(true);

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of a saved choice
      if (localStorage.getItem(KEY) === "1") setOpen(false);
    } catch {}
  }, []);

  if (!open) return null;

  function close() {
    setOpen(false);
    try {
      localStorage.setItem(KEY, "1");
    } catch {}
  }

  return (
    <div className="relative bg-[#0c0b33] px-10 py-3 text-center text-sm text-white/90">
      Now inviting our first partners.{" "}
      <Link href="/partners/join" className="font-medium text-white underline underline-offset-4 hover:text-[#c7c9ff]">
        Apply today
      </Link>
      <button
        type="button"
        onClick={close}
        aria-label="Close this message"
        className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-md text-white/70 hover:bg-white/10 hover:text-white"
      >
        <svg viewBox="0 0 14 14" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          <path d="M2 2l10 10M12 2L2 12" />
        </svg>
      </button>
    </div>
  );
}

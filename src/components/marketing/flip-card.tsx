"use client";

import { useState, type ReactNode } from "react";

/**
 * Flips on hover with a mouse, and on tap (or Enter/Space) everywhere,
 * so phone users get the same reveal as desktop users.
 */
export function FlipCard({ front, back, label }: { front: ReactNode; back: ReactNode; label: string }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setFlipped((f) => !f)}
      aria-pressed={flipped}
      aria-label={`${label}: ${flipped ? "show the problem" : "see how we fix it"}`}
      className="group/flip relative block h-full w-full cursor-pointer rounded-xl text-left outline-none [perspective:1200px] focus-visible:ring-2 focus-visible:ring-brand-400"
    >
      <span
        className={`relative block h-full transition-transform duration-700 [transform-style:preserve-3d] [@media(hover:hover)]:group-hover/flip:[transform:rotateY(180deg)] ${
          flipped ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        <span className="absolute inset-0 block [backface-visibility:hidden]">{front}</span>
        <span className="absolute inset-0 block [backface-visibility:hidden] [transform:rotateY(180deg)]">{back}</span>
      </span>
    </button>
  );
}

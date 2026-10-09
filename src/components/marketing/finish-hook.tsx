"use client";

import { useEffect, useRef, useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Magnetic } from "@/components/ui/magnetic";

const FINAL_SECONDS = 9 * 60 + 42; // 09:42
const RUN_MS = 1800;

/** Closing hook for "How it works": a timer that races to 09:42, then CTAs. */
export function FinishHook() {
  const ref = useRef<HTMLDivElement>(null);
  const [seconds, setSeconds] = useState(0);
  const done = seconds >= FINAL_SECONDS;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;

    const run = () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setSeconds(FINAL_SECONDS);
        return;
      }
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - start) / RUN_MS, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        setSeconds(Math.round(FINAL_SECONDS * eased));
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          run();
          io.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div ref={ref} className="relative mt-20 text-center lg:mt-28">
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 -z-10 h-64 w-[640px] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-600/20 blur-[100px]"
      />

      <div
        className={`mx-auto inline-flex items-center gap-3 rounded-full border px-4 py-2 transition-colors duration-500 ${
          done
            ? "border-emerald-400/40 bg-emerald-400/10"
            : "border-white/15 bg-white/[0.04]"
        }`}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
          className={done ? "text-emerald-300" : "text-brand-300"}
        >
          <circle cx="12" cy="13" r="8" />
          <path d="M12 9v4l2.5 2.5M9 2h6" />
        </svg>
        <span className="font-mono text-lg tabular-nums text-white" aria-hidden="true">
          {mm}:{ss}
        </span>
        <span
          className={`text-sm transition-all duration-500 ${
            done ? "text-emerald-300 opacity-100" : "w-0 overflow-hidden opacity-0"
          }`}
        >
          ✓ CV ready
        </span>
      </div>

      <p className="mt-8 text-4xl font-medium tracking-tight text-balance text-white/50 sm:text-5xl lg:text-6xl">
        Your CV, done in{" "}
        <span className="bg-linear-to-b from-white to-white/70 bg-clip-text text-transparent">
          under 10 minutes.
        </span>
      </p>
      <p className="mx-auto mt-5 max-w-xl text-lg text-white/65 sm:text-xl">
        Build your student CV smarter, faster, better.
      </p>

      <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Magnetic className="w-full sm:w-auto">
          <ButtonLink href="/builder" size="lg" className="w-full">
            Build my CV
          </ButtonLink>
        </Magnetic>
        <Magnetic className="w-full sm:w-auto">
          <ButtonLink href="/templates" variant="ghost" size="lg" className="w-full">
            Browse templates
          </ButtonLink>
        </Magnetic>
      </div>
      <p className="mt-4 text-xs text-white/40">Free for students · No sign-up needed</p>
    </div>
  );
}

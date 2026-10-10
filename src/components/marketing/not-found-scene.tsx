"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { cvExamples } from "@/lib/cv-examples";
import { CvIcon } from "@/components/cv/cv-icon";
import { ButtonLink } from "@/components/ui/button";
import { Magnetic } from "@/components/ui/magnetic";
import { HeroCursorField } from "./hero-cursor-field";

const css = `
@keyframes cv11-blink { 0%, 92%, 100% { transform: scaleY(1); } 95% { transform: scaleY(.08); } }
@keyframes cv11-look {
  0%, 100% { transform: translate(0, 0); }
  20% { transform: translate(-22px, -6px); }
  45% { transform: translate(20px, 4px); }
  70% { transform: translate(-6px, 16px); }
}
@keyframes cv11-float { 0%, 100% { transform: translateY(0) rotate(-2deg); } 50% { transform: translateY(-10px) rotate(2deg); } }
.cv11-eye { animation: cv11-blink 4.5s ease-in-out infinite; transform-origin: center; }
.cv11-idle { animation: cv11-look 7s ease-in-out infinite; }
.cv11-four { animation: cv11-float 6s ease-in-out infinite; }
.cv11-four.late { animation-delay: -3s; }
@media (prefers-reduced-motion: reduce) { .cv11-eye, .cv11-idle, .cv11-four { animation: none; } }
`;

/** Interactive 404: the "0" is an eye that follows the cursor (or finger) and blinks. */
export function NotFoundScene() {
  const eyeRef = useRef<HTMLDivElement>(null);
  const [pupil, setPupil] = useState<{ x: number; y: number } | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let frame = 0;
    let idleTimer: ReturnType<typeof setTimeout>;
    const look = (cx: number, cy: number) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const eye = eyeRef.current;
        if (!eye) return;
        const r = eye.getBoundingClientRect();
        const dx = cx - (r.left + r.width / 2);
        const dy = cy - (r.top + r.height / 2);
        const dist = Math.hypot(dx, dy) || 1;
        const reach = Math.min(1, dist / 220) * (r.width * 0.22);
        setPupil({ x: (dx / dist) * reach, y: (dy / dist) * reach });
      });
      clearTimeout(idleTimer);
      // Drift back to looking around if the visitor stops moving
      idleTimer = setTimeout(() => setPupil(null), 3500);
    };
    const onMove = (e: PointerEvent) => look(e.clientX, e.clientY);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
      cancelAnimationFrame(frame);
      clearTimeout(idleTimer);
    };
  }, []);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? cvExamples.filter((e) => e.course.toLowerCase().includes(q)) : cvExamples;
    return list.slice(0, 6);
  }, [query]);

  return (
    <section className="relative isolate flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center overflow-hidden px-4 pb-20 pt-28 text-center">
      <style>{css}</style>
      <div aria-hidden="true" className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,black,transparent)]" />
      <div aria-hidden="true" className="absolute left-1/2 top-1/3 -z-10 h-[420px] w-[820px] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-600/20 blur-[120px]" />
      <HeroCursorField />

      <h1 className="sr-only">Page not found (404)</h1>
      <div aria-hidden="true" className="flex select-none items-center justify-center gap-3 sm:gap-6">
        <span className="cv11-four bg-linear-to-b from-fg to-fg/40 bg-clip-text text-[120px] font-semibold leading-none tracking-tighter text-transparent sm:text-[200px]">
          4
        </span>

        {/* The eye */}
        <div
          ref={eyeRef}
          className="relative grid h-[130px] w-[96px] place-items-center rounded-[50%] bg-white shadow-[0_0_0_10px_rgb(var(--fg-rgb)/0.9),0_0_60px_rgb(124_128_255/0.6)] sm:h-[200px] sm:w-[150px] sm:shadow-[0_0_0_14px_rgb(var(--fg-rgb)/0.9),0_0_80px_rgb(124_128_255/0.6)]"
        >
          <div className="cv11-eye grid size-full place-items-center overflow-hidden rounded-[50%]">
            <div
              className={pupil ? "transition-transform duration-150 ease-out" : "cv11-idle"}
              style={pupil ? { transform: `translate(${pupil.x}px, ${pupil.y}px)` } : undefined}
            >
              <div className="relative grid size-[54px] place-items-center rounded-full bg-[radial-gradient(circle_at_40%_35%,#7c80ff,#2f32b0_60%,#141a52)] sm:size-[82px]">
                <div className="size-[24px] rounded-full bg-[#04051a] sm:size-[36px]" />
                <div className="absolute left-[30%] top-[22%] size-[9px] rounded-full bg-white sm:size-[14px]" />
              </div>
            </div>
          </div>
        </div>

        <span className="cv11-four late bg-linear-to-b from-fg to-fg/40 bg-clip-text text-[120px] font-semibold leading-none tracking-tighter text-transparent sm:text-[200px]">
          4
        </span>
      </div>

      <p className="mt-10 text-2xl font-medium tracking-tight text-fg sm:text-3xl">We looked everywhere for this page.</p>
      <p className="mx-auto mt-3 max-w-md text-base text-fg/60">
        It might have moved, or the link has a typo. Your CV is safe though. Let’s get you somewhere useful.
      </p>

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <Magnetic>
          <ButtonLink href="/builder" size="lg">
            Build my CV
          </ButtonLink>
        </Magnetic>
        <Magnetic>
          <ButtonLink href="/" variant="ghost" size="lg">
            Back to home
          </ButtonLink>
        </Magnetic>
      </div>

      <div className="mt-12 w-full max-w-xl rounded-2xl border border-fg/10 bg-fg/[0.03] p-5 text-left backdrop-blur sm:p-6">
        <label htmlFor="nf-search" className="text-sm font-medium text-fg">
          Looking for a CV example?
        </label>
        <input
          id="nf-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type your course, e.g. Nursing"
          className="mt-3 w-full rounded-lg border border-fg/12 bg-ink-950/60 px-3.5 py-2.5 text-[15px] text-fg placeholder:text-fg/35 focus:border-brand-400/70 focus:outline-none"
        />
        <ul className="mt-4 flex flex-wrap gap-2">
          {matches.map((e) => (
            <li key={e.slug}>
              <Link
                href={`/cv-examples/${e.slug}`}
                className="flex items-center gap-2 rounded-full border border-fg/10 bg-fg/[0.04] py-1 pl-1 pr-3.5 text-sm text-fg/80 transition-colors hover:border-brand-400/60 hover:text-fg"
              >
                <span className="grid size-7 place-items-center rounded-full bg-brand-500/15 text-brand-300">
                  <CvIcon name={e.icon} size={14} />
                </span>
                {e.course} CV
              </Link>
            </li>
          ))}
          {matches.length === 0 && <li className="text-sm text-fg/50">No match. Try another course, or browse all examples.</li>}
        </ul>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-fg/10 pt-4 text-sm">
          <Link href="/templates" className="text-brand-300 hover:text-fg">Templates →</Link>
          <Link href="/cv-examples" className="text-brand-300 hover:text-fg">All CV examples →</Link>
          <Link href="/#faq" className="text-brand-300 hover:text-fg">FAQ →</Link>
        </div>
      </div>
    </section>
  );
}

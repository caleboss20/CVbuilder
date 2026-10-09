"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { SectionHeading } from "./section-heading";
import {
  DownloadVisual,
  FillDetailsVisual,
  PickTemplateVisual,
} from "./how-it-works-visuals";

const steps: { title: string; body: string; visual: ReactNode }[] = [
  {
    title: "Pick a template",
    body: "Choose from clean designs made for students. Every one is built to pass hiring software, and you can switch any time without losing your content.",
    visual: <PickTemplateVisual />,
  },
  {
    title: "Fill in your details",
    body: "Answer simple questions about your course, projects and activities. Stuck on what to say? The AI suggests stronger lines as you type.",
    visual: <FillDetailsVisual />,
  },
  {
    title: "Download your PDF",
    body: "Get a clean PDF with no watermark. Send it to recruiters, upload it to job portals or print it for the next career fair.",
    visual: <DownloadVisual />,
  },
];

export function HowItWorks() {
  const [active, setActive] = useState(-1);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);

  // The step crossing the middle of the screen becomes active
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.step));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    stepRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section
      id="how-it-works"
      aria-labelledby="how-heading"
      className="relative scroll-mt-20 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="how-heading"
          eyebrow="How it works"
          title={
            <>
              From blank page to <em>ready to send</em> in three steps
            </>
          }
          description="No design skills and no Word headaches. Most students finish their first CV in under 15 minutes."
        />

        <div className="mt-16 grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Steps */}
          <ol className="relative">
            {/* Progress rail */}
            <span
              aria-hidden="true"
              className="absolute bottom-10 left-5 top-10 hidden w-px bg-white/10 lg:block"
            />
            <span
              aria-hidden="true"
              className="absolute left-5 top-10 hidden w-px bg-linear-to-b from-brand-400 to-brand-600 transition-[height] duration-700 lg:block"
              style={{ height: `calc((100% - 5rem) * ${Math.max(active, 0) / (steps.length - 1)})` }}
            />

            {steps.map((s, i) => {
              const isActive = active === i;
              return (
                <li
                  key={s.title}
                  ref={(el) => {
                    stepRefs.current[i] = el;
                  }}
                  data-step={i}
                  className="relative flex flex-col justify-center py-6 lg:min-h-[60vh] lg:py-0"
                >
                  <div className="flex gap-5">
                    <span
                      className={`relative z-10 grid size-10 shrink-0 place-items-center rounded-full border text-sm font-medium transition-all duration-500 ${
                        isActive
                          ? "border-brand-400 bg-brand-600 text-white shadow-[0_0_24px_rgb(124_128_255/0.7)]"
                          : "border-white/15 bg-ink-950 text-white/50"
                      }`}
                    >
                      0{i + 1}
                    </span>
                    <div
                      className={`transition-opacity duration-500 lg:opacity-40 ${isActive ? "lg:opacity-100" : ""}`}
                    >
                      <h3 className="text-2xl font-medium text-white">{s.title}</h3>
                      <p className="mt-3 max-w-md text-base leading-relaxed text-white/60">{s.body}</p>
                    </div>
                  </div>

                  {/* Mobile: visual sits under its own step */}
                  <div
                    data-active={isActive}
                    aria-hidden="true"
                    className="group mt-8 h-72 lg:hidden"
                  >
                    {s.visual}
                  </div>
                </li>
              );
            })}
          </ol>

          {/* Desktop: one sticky stage that swaps visuals */}
          <div className="hidden lg:block">
            <div
              aria-hidden="true"
              className="sticky top-[calc(50vh-210px)] h-[420px] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]"
            >
              <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
              <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-600/20 blur-3xl" />
              {steps.map((s, i) => (
                <div
                  key={s.title}
                  data-active={active === i}
                  className={`group absolute inset-0 p-8 transition-opacity duration-500 ${
                    active === i ? "opacity-100" : "pointer-events-none opacity-0"
                  }`}
                >
                  {s.visual}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

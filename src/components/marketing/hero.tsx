import Image from "next/image";
import { ButtonLink } from "@/components/ui/button";
import { Magnetic } from "@/components/ui/magnetic";
import { SparkleIcon } from "@/components/ui/sparkle-icon";
import { HeroCursorField } from "./hero-cursor-field";
import { HeroCvPreview } from "./hero-cv-preview";

const avatars = [
  "/images/avatars/student-1.webp",
  "/images/avatars/student-2.webp",
  "/images/avatars/student-4.webp",
];

const suggestions = [
  {
    label: "Try",
    text: "Led a team of 4 on our final-year project",
    className: "right-[4%] top-[17%] hidden xl:flex animate-float opacity-60",
  },
  {
    label: "Spelling",
    text: "Received",
    className: "left-[4%] top-[34%] hidden xl:flex animate-float-delayed opacity-60",
  },
  {
    label: "Try",
    text: "Improved page load speed by 35%",
    className: "right-[3%] bottom-[30%] hidden md:flex animate-float sm:right-[8%]",
  },
  {
    label: "Use",
    text: "“Coordinated…” for a stronger tone",
    className: "left-[3%] bottom-[20%] hidden md:flex animate-float-delayed sm:left-[10%]",
  },
];

export function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate overflow-hidden pt-36 pb-24 sm:pt-44"
    >
      {/* Background layers */}
      <div
        aria-hidden="true"
        className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_45%,black,transparent)]"
      />
      <div aria-hidden="true" className="bg-stars absolute inset-0 -z-10" />
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-0 -z-10 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-brand-600/20 blur-[120px]"
      />
      <HeroCursorField />

      {/* Floating AI suggestion chips */}
      {suggestions.map((s) => (
        <Magnetic
          key={s.text}
          strength={0.18}
          className={`absolute z-10 ${s.className}`}
        >
          <div
            aria-hidden="true"
            className="flex items-center gap-1.5 rounded-lg border border-fg/25 bg-ink-800/80 px-3 py-1.5 text-xs text-fg/85 shadow-[0_0_24px_-4px_rgb(124_128_255/0.7)] backdrop-blur"
          >
            <SparkleIcon className="text-brand-300" />
            <span className="text-fg/55">{s.label}:</span> {s.text}
          </div>
        </Magnetic>
      ))}

      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        <p className="animate-fade-up mx-auto inline-flex items-center gap-2 rounded-full border border-fg/10 bg-fg/[0.04] py-1 pl-1 pr-3 text-xs text-fg/70">
          <span className="flex -space-x-1.5" aria-hidden="true">
            {avatars.map((src) => (
              <Image
                key={src}
                src={src}
                alt=""
                width={40}
                height={40}
                className="size-6 rounded-full object-cover ring-2 ring-ink-950"
              />
            ))}
          </span>
          Free for students &amp; fresh graduates
        </p>

        <h1
          id="hero-heading"
          className="animate-fade-up mt-6 text-5xl font-medium tracking-tight text-balance [animation-delay:80ms] sm:text-6xl lg:text-7xl"
        >
          <span className="bg-linear-to-b from-fg to-fg/60 bg-clip-text text-transparent">
            Build your student CV
          </span>
          <br />
          <span className="bg-linear-to-b from-fg/80 to-fg/40 bg-clip-text text-transparent">
            smarter, faster, better
          </span>
        </h1>

        <p className="animate-fade-up mx-auto mt-6 max-w-xl text-base text-fg/65 [animation-delay:160ms] sm:text-lg">
          The free CV builder made for students. Pick a template, let AI help
          with your wording and download a professional PDF in minutes.
        </p>

        <div className="animate-fade-up relative z-10 mt-9 flex flex-col items-center justify-center gap-3 [animation-delay:240ms] sm:flex-row">
          <Magnetic className="w-full sm:w-auto">
            <ButtonLink href="/builder" size="lg" className="w-full">
              Build my CV
            </ButtonLink>
          </Magnetic>
          <Magnetic className="w-full sm:w-auto">
            <ButtonLink
              href="/templates"
              variant="ghost"
              size="lg"
              className="w-full"
            >
              Browse templates
            </ButtonLink>
          </Magnetic>
        </div>
      </div>

      <div className="animate-fade-up relative -mt-24 px-4 [animation-delay:320ms] sm:-mt-28">
        <HeroCvPreview />
        <p className="relative mt-6 text-center text-lg font-medium text-fg/90">
          <span className="text-brand-300">92%</span> ATS match
        </p>
        <p className="relative mt-2 text-center text-xs text-fg/40">
          No sign-up needed · No watermark · Unlimited PDF downloads
        </p>
      </div>
    </section>
  );
}

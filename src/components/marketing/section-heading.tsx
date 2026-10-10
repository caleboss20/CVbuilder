import type { ReactNode } from "react";
import { SparkleIcon } from "@/components/ui/sparkle-icon";

type SectionHeadingProps = {
  id: string;
  eyebrow: string;
  title: ReactNode;
  description?: string;
};

/** Eyebrow + h2 + optional intro, centered. Wrap words in <em> to highlight them. */
export function SectionHeading({ id, eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="inline-flex items-center gap-1.5 text-sm text-fg/70">
        <SparkleIcon className="text-brand-300" />
        {eyebrow}
      </p>
      <h2
        id={id}
        className="mt-3 text-3xl font-medium tracking-tight text-balance text-fg/50 sm:text-4xl lg:text-5xl [&_em]:not-italic [&_em]:text-fg"
      >
        {title}
      </h2>
      {description && (
        <p className="mx-auto mt-4 max-w-xl text-base text-fg/60 sm:text-lg">
          {description}
        </p>
      )}
    </div>
  );
}

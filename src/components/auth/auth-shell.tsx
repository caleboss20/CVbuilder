import type { ReactNode } from "react";

/** The shared frame for the sign-up, log-in, reset and account pages. */
export function AuthShell({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return (
    <div className="relative overflow-hidden pt-32 pb-24 sm:pt-40">
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-0 -z-10 h-[420px] w-[900px] -translate-x-1/2 rounded-full bg-brand-600/15 blur-[120px]"
      />
      <div className="mx-auto max-w-md px-6 sm:px-8">
        <h1 className="text-3xl font-medium tracking-tight text-fg sm:text-4xl">{title}</h1>
        {intro && <p className="mt-3 text-sm leading-relaxed text-fg/60 sm:text-base">{intro}</p>}
        <div className="mt-8 rounded-2xl border border-fg/10 bg-fg/[0.03] p-6 sm:p-7">{children}</div>
      </div>
    </div>
  );
}

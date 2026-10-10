import { ButtonLink } from "@/components/ui/button";
import { Magnetic } from "@/components/ui/magnetic";

export function FinalCta() {
  return (
    <section aria-labelledby="final-cta-heading" className="px-4 pb-24 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl border border-brand-400/30 bg-linear-to-b from-brand-600/30 via-ink-900 to-ink-950 px-6 py-16 text-center sm:px-12 sm:py-20">
        <div aria-hidden="true" className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-0 -z-10 h-64 w-[600px] max-w-full -translate-x-1/2 rounded-full bg-brand-500/30 blur-[100px]"
        />
        <h2
          id="final-cta-heading"
          className="text-3xl font-medium tracking-tight text-balance text-fg sm:text-5xl"
        >
          Ready to build your CV?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-fg/65 sm:text-lg">
          Pick a template, add your details and download a professional PDF. It’s free for
          students, and you can start right now.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Magnetic className="w-full sm:w-auto">
            <ButtonLink href="/builder" size="lg" className="w-full">
              Build my CV
            </ButtonLink>
          </Magnetic>
          <Magnetic className="w-full sm:w-auto">
            <ButtonLink href="/cv-examples" variant="ghost" size="lg" className="w-full">
              See CV examples
            </ButtonLink>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}

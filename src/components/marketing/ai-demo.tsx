import { AiDemoPlayer } from "./ai-demo-player";
import { SectionHeading } from "./section-heading";

export function AiDemo() {
  return (
    <section
      id="features"
      aria-labelledby="ai-demo-heading"
      className="relative scroll-mt-20 overflow-hidden py-24 sm:py-32"
    >
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 -z-10 h-[500px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-600/10 blur-[120px]"
      />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="ai-demo-heading"
          eyebrow="AI writing assistant"
          title={
            <>
              Type it <em>your way</em>. Get it <em>recruiter-ready</em>.
            </>
          }
          description="Describe what you did in plain words. CV11 rewrites it into a strong line and adds it straight to your CV."
        />
        <div className="mt-14">
          <AiDemoPlayer />
        </div>
      </div>
    </section>
  );
}

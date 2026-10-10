import { faqs } from "@/lib/faqs";
import { SectionHeading } from "./section-heading";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

/** FAQ accordion built on <details>, so it works without JavaScript and is fully crawlable. */
export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-heading" className="relative scroll-mt-20 py-24 sm:py-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
      />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="faq-heading"
          eyebrow="FAQ"
          title={
            <>
              Questions students <em>ask us</em>
            </>
          }
          description="Everything you need to know before you build your first CV."
        />

        <div className="mt-14 divide-y divide-white/10 rounded-xl border border-white/10 bg-white/[0.02]">
          {faqs.map((f, i) => (
            <details key={f.q} name="faq" open={i === 0} className="group px-5 sm:px-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left text-base font-medium text-white transition-colors hover:text-brand-300 [&::-webkit-details-marker]:hidden">
                {f.q}
                <span
                  aria-hidden="true"
                  className="grid size-7 shrink-0 place-items-center rounded-full border border-white/15 text-white/60 transition-transform duration-300 group-open:rotate-45 group-open:border-brand-400/60 group-open:text-brand-300"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
              </summary>
              <p className="pb-5 pr-10 text-[15px] leading-relaxed text-white/65">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

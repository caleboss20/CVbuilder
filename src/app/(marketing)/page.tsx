import { AiDemo } from "@/components/marketing/ai-demo";
import { CvExamplesMarquee } from "@/components/marketing/cv-examples-marquee";
import { Faq } from "@/components/marketing/faq";
import { FinalCta } from "@/components/marketing/final-cta";
import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { Problems } from "@/components/marketing/problems";
import { TemplatesSection } from "@/components/marketing/templates-section";
import { Testimonials } from "@/components/marketing/testimonials";
import { siteConfig } from "@/lib/site";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: siteConfig.name,
  url: siteConfig.url,
  description: siteConfig.description,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\u003c"),
        }}
      />
      <Hero />
      <Problems />
      <AiDemo />
      <HowItWorks />
      <TemplatesSection />
      <CvExamplesMarquee />
      <Testimonials />
      <Faq />
      <FinalCta />
    </>
  );
}

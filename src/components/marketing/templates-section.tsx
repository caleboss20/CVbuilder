import Link from "next/link";
import { SectionHeading } from "./section-heading";
import { TemplateGallery } from "./template-gallery";

export function TemplatesSection() {
  return (
    <section id="templates" aria-labelledby="templates-heading" className="relative scroll-mt-20 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <SectionHeading
            id="templates-heading"
            eyebrow="Templates"
            title={
              <>
                Find <em>your style</em>
              </>
            }
            description="Every template is a real, full CV. Filter by style, try a colour, and start with the one that feels like you."
          />
        </div>
        <div className="mt-12">
          <TemplateGallery layout="row" />
        </div>
        <div className="mt-6 text-center">
          <Link href="/templates" className="text-sm font-medium text-brand-300 hover:text-fg">
            See all templates →
          </Link>
        </div>
      </div>
    </section>
  );
}

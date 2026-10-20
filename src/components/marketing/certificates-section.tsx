import Image from "next/image";
import { ButtonLink } from "@/components/ui/button";
import { FREE_BATCH } from "@/lib/certificate-names";
import { DESIGNS } from "@/lib/certificate-designs";
import { SectionHeading } from "./section-heading";

/** Real previews of designs, made by the certificate maker itself. Landscape ones are 900x636, portrait ones 900x1273. */
const samples = [
  { id: "navyWaves", label: "Navy Waves", width: 900, height: 636 },
  { id: "tealDiagonal", label: "Teal Diagonal", width: 900, height: 1273 },
  { id: "blackSwoosh", label: "Black Swoosh", width: 900, height: 636 },
  { id: "ornateCream", label: "Ornate Cream", width: 900, height: 1273 },
  { id: "emerald", label: "Emerald", width: 900, height: 636 },
  { id: "navyPanel", label: "Navy Panel", width: 900, height: 636 },
];

const points = [
  {
    title: "Paste the list you already have",
    body: "Copy names from WhatsApp, Excel or a sign-in sheet. We tidy the capital letters, numbering and repeated names for you.",
  },
  {
    title: `${DESIGNS.length} designs, any colour`,
    body: "Classic, modern and gold, tall or wide. Pick one and match it to your school or club colours.",
  },
  {
    title: "Ready to send or print",
    body: "Get a ZIP with one PDF for each person, or a single file that prints them all at once.",
  },
  {
    title: "Just one certificate? Fine.",
    body: "There is no minimum. Make one for a single winner or a whole hall of guests.",
  },
];

/** Homepage section that introduces the bulk certificate maker, for people running events and programmes. */
export function CertificatesSection() {
  return (
    <section id="certificates" aria-labelledby="certificates-heading" className="relative scroll-mt-20 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="certificates-heading"
          eyebrow="For events and programmes"
          title={
            <>
              Certificates for <em>everyone who showed up</em>
            </>
          }
          description="Running a workshop, a club event or a training? Paste your list of names once and get a finished certificate for each person. It takes minutes, not a whole evening of retyping."
        />

        {/* A mix of wide and tall certificates, laid out like a pinboard */}
        <ul className="mx-auto mt-14 max-w-5xl columns-2 gap-4 sm:columns-3 sm:gap-5">
          {samples.map((s) => (
            <li key={s.id} className="mb-4 break-inside-avoid sm:mb-5">
              <Image
                src={`/images/certificates/${s.id}.jpg`}
                alt={`${s.label} certificate design`}
                width={s.width}
                height={s.height}
                sizes="(min-width: 1024px) 320px, (min-width: 640px) 30vw, 46vw"
                className="h-auto w-full rounded-md shadow-[0_18px_40px_-18px_rgb(0_0_0/0.6)] ring-1 ring-fg/10"
              />
            </li>
          ))}
        </ul>
        <p className="mt-2 text-center text-sm text-fg/50">And {DESIGNS.length - samples.length} more designs inside.</p>

        <ul className="mx-auto mt-14 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {points.map((p) => (
            <li key={p.title} className="rounded-xl border border-fg/10 bg-fg/[0.03] p-5">
              <h3 className="text-[15px] font-medium text-fg">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-fg/60">{p.body}</p>
            </li>
          ))}
        </ul>

        <div className="mt-10 text-center">
          <ButtonLink href="/certificates" size="lg">
            Make certificates
          </ButtonLink>
          <p className="mt-3 text-sm text-fg/50">Free for up to {FREE_BATCH} certificates at a time, no sign-up. Your list of names stays on your device.</p>
        </div>
      </div>
    </section>
  );
}

/**
 * Decorative sample CV rendered in 3D perspective under the hero CTAs.
 * Purely visual, so it is hidden from assistive tech.
 */
export function HeroCvPreview() {
  return (
    <div aria-hidden="true" className="relative mx-auto w-full max-w-[600px]">
      {/* Glow under the card */}
      <div className="absolute inset-x-[8%] -bottom-10 h-28 rounded-[100%] bg-brand-500/60 blur-3xl" />
      {/* Bright lit edge along the bottom of the card */}
      <div className="absolute inset-x-0 bottom-0 z-10 h-px bg-linear-to-r from-transparent via-brand-300 to-transparent" />
      <div className="absolute inset-x-[10%] -bottom-1 z-10 h-2 bg-brand-400/80 blur-md" />

      <div className="[perspective:900px]">
        <div className="origin-bottom [transform:rotateX(42deg)] [mask-image:linear-gradient(to_bottom,transparent_0%,rgb(0_0_0/0.35)_30%,black_70%)]">
          <div className="grid grid-cols-[0.8fr_1.2fr] gap-5 rounded-t-xl bg-linear-to-b from-[#e9eaff] to-white px-7 pb-7 pt-14 text-left text-[9px] leading-relaxed text-slate-600 shadow-[0_-20px_60px_-20px_rgb(124_128_255/0.6)] sm:text-[10px]">
            <div className="space-y-4">
              <div>
                <p className="text-[15px] font-bold leading-tight text-slate-900 sm:text-[17px]">
                  Ama Mensah
                </p>
                <p className="font-medium text-brand-600">
                  Computer Science Student
                </p>
              </div>
              <Section title="Contact">
                <p>+233 24 000 0000</p>
                <p>ama.mensah@email.com</p>
                <p>Accra, Ghana</p>
              </Section>
              <Section title="Skills">
                <div className="flex flex-wrap gap-1">
                  {["React", "Python", "SQL", "Figma", "Git"].map((s) => (
                    <span
                      key={s}
                      className="rounded bg-brand-500/10 px-1.5 py-0.5 text-brand-700"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </Section>
              <Section title="Activities">
                <p>Vice President, Tech Club</p>
                <p>Volunteer, Code for Ghana</p>
              </Section>
            </div>

            <div className="space-y-4">
              <Section title="Education">
                <p className="font-semibold text-slate-800">
                  BSc Computer Science
                </p>
                <p>KNUST · 2022 – 2026</p>
                <p>First Class (CGPA 3.8 / 4.0)</p>
              </Section>
              <Section title="Experience">
                <p className="font-semibold text-slate-800">
                  Software Engineering Intern
                </p>
                <p className="mb-1">Hubtel · Jun – Aug 2025</p>
                <ul className="list-disc space-y-0.5 pl-3">
                  <li>Built dashboard features used by 2,000+ merchants.</li>
                  <li className="rounded bg-brand-500/15 px-1 text-brand-700">
                    Improved page load speed by 35% with code splitting.
                  </li>
                  <li>Wrote unit tests raising coverage to 80%.</li>
                </ul>
              </Section>
              <Section title="Projects">
                <p className="font-semibold text-slate-800">
                  Campus Marketplace App
                </p>
                <p>Led a team of 4 to ship an app with 500+ student users.</p>
              </Section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-900 sm:text-[11px]">
        {title}
      </p>
      {children}
    </div>
  );
}

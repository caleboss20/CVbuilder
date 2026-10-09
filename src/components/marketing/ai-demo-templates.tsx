import Image from "next/image";
import type { ReactNode } from "react";
import type { DemoLine, DemoPersona, DemoSection } from "@/lib/ai-demo";
import { SparkleIcon } from "@/components/ui/sparkle-icon";

export type Phase = "typing" | "ready" | "thinking" | "writing" | "done";

/** Everything a template needs to draw the line the AI is writing. */
export type DemoTemplateProps = {
  persona: DemoPersona;
  current: DemoLine;
  filled: Partial<Record<DemoSection, DemoLine>>;
  phase: Phase;
  words: string[];
  written: number;
};

/** The line shown in a section: the active one while writing, or the saved one. */
function lineFor(section: DemoSection, p: DemoTemplateProps) {
  const active = p.current.section === section;
  const line = active ? p.current : p.filled[section];
  const showMeta = !!line?.meta && (!active || (p.phase !== "typing" && p.phase !== "ready"));
  return { active, line, meta: showMeta ? line?.meta : undefined };
}

function LineBody({
  section,
  bullet,
  p,
}: {
  section: DemoSection;
  bullet: boolean;
  p: DemoTemplateProps;
}) {
  const { active } = lineFor(section, p);

  if (active && p.phase === "thinking") {
    return (
      <div className="flex items-center gap-2 text-[11px] text-brand-600">
        <SparkleIcon className="animate-pulse" />
        AI is writing…
        <span className="h-3 flex-1 animate-pulse rounded bg-brand-500/15" />
      </div>
    );
  }

  let content: ReactNode = null;
  if (active && (p.phase === "writing" || p.phase === "done")) {
    content = (
      <span
        className={`-mx-1 rounded px-1 py-0.5 transition-colors duration-700 ${
          p.phase === "writing" ? "bg-brand-500/15 text-slate-900" : "bg-brand-500/5"
        }`}
      >
        {p.words.slice(0, p.written).join(" ")}
        {p.phase === "writing" && (
          <span className="ml-0.5 inline-block h-3 w-0.5 translate-y-0.5 animate-pulse bg-brand-500" />
        )}
      </span>
    );
  } else if (p.filled[section]) {
    content = p.filled[section]?.output;
  }

  if (!content) {
    return (
      <div className="space-y-1.5 py-1" aria-hidden="true">
        <span className="block h-1.5 w-full rounded bg-slate-200 sm:h-2" />
        <span className="block h-1.5 w-3/4 rounded bg-slate-200 sm:h-2" />
      </div>
    );
  }

  return bullet ? (
    <ul className="list-disc pl-4">
      <li>{content}</li>
    </ul>
  ) : (
    <p className="text-justify">{content}</p>
  );
}

/* ------------------------------------------------------------------ */
/* Template 1: grey sidebar with round photo (Ama)                     */
/* ------------------------------------------------------------------ */

export function SidebarTemplate(p: DemoTemplateProps) {
  const { persona } = p;
  const sections: DemoSection[] = ["summary", "experience", "activities", "projects"];

  return (
    <div className="grid grid-cols-[34%_1fr] overflow-hidden rounded-md bg-white text-slate-700">
      <aside className="space-y-5 bg-slate-100 px-2.5 py-6 sm:px-5 sm:py-8">
        {persona.photo && (
          <Image
            src={persona.photo}
            alt=""
            width={120}
            height={120}
            className="mx-auto size-16 rounded-full object-cover grayscale sm:size-24"
          />
        )}
        <SideBlock title="Contact">
          <ContactRow icon={<path d="M5 4h4l2 5-3 2a11 11 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />}>
            +233 24 000 0000
          </ContactRow>
          <ContactRow icon={<path d="M3 6h18v12H3zM3 6l9 7 9-7" />}>ama@email.com</ContactRow>
          <ContactRow icon={<path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11zM12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4" />}>
            Kumasi, Ghana
          </ContactRow>
        </SideBlock>
        <SideBlock title="Education">
          <p className="font-semibold text-slate-800">KNUST</p>
          <p>BSc Computer Science</p>
          <p className="text-slate-500">2022 – 2026</p>
          <p className="mt-2 font-semibold text-slate-800">Wesley Girls’ SHS</p>
          <p>WASSCE</p>
          <p className="text-slate-500">2018 – 2021</p>
        </SideBlock>
        <SideBlock title="Skills">
          <ul className="list-disc space-y-0.5 pl-3.5">
            {["React", "Python", "SQL", "Figma", "Teamwork"].map((k) => (
              <li key={k}>{k}</li>
            ))}
          </ul>
        </SideBlock>
        <SideBlock title="Language">
          <ul className="list-disc space-y-0.5 pl-3.5">
            <li>English</li>
            <li>Twi</li>
          </ul>
        </SideBlock>
      </aside>

      <div className="px-4 py-6 sm:px-7 sm:py-8">
        <p className="text-lg font-bold uppercase leading-tight tracking-[0.25em] text-slate-900 sm:text-2xl sm:tracking-[0.3em]">
          {persona.name}
        </p>
        <p className="mt-1 text-[11px] tracking-[0.2em] text-slate-600 sm:text-sm">{persona.role}</p>

        <div className="mt-5 space-y-4 text-[11px] leading-relaxed sm:mt-7 sm:text-[13px]">
          {sections.map((s) => {
            const { meta } = lineFor(s, p);
            return (
              <div key={s}>
                <p className="mb-2 border-y border-slate-400 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-900 sm:text-xs">
                  {persona.labels[s]}
                </p>
                {meta && (
                  <div className="mb-1">
                    <p className="font-semibold text-slate-800">{meta.title}</p>
                    <p className="text-slate-600">
                      {meta.place} · <span className="italic">{meta.date}</span>
                    </p>
                  </div>
                )}
                <LineBody section={s} bullet={!!meta} p={p} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SideBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="text-[9px] leading-relaxed text-slate-600 sm:text-[11px]">
      <p className="mb-2 border-y border-slate-400 py-1 text-[9px] font-bold uppercase tracking-[0.25em] text-slate-900 sm:text-[11px]">
        {title}
      </p>
      {children}
    </div>
  );
}

function ContactRow({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <p className="flex items-center gap-1 whitespace-nowrap sm:gap-1.5">
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="shrink-0 text-slate-800"
      >
        {icon}
      </svg>
      {children}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* Template 2: single column, navy headings, square photo (Osborn)     */
/* ------------------------------------------------------------------ */

const NAVY = "text-[#1e3a5f]";

export function ClassicTemplate(p: DemoTemplateProps) {
  const { persona } = p;

  return (
    <div className="rounded-md bg-white px-4 py-6 text-[11px] leading-relaxed text-slate-700 sm:px-8 sm:py-8 sm:text-[13px]">
      <header className="flex items-start gap-4 sm:gap-6">
        {persona.photo && (
          <Image
            src={persona.photo}
            alt=""
            width={112}
            height={130}
            className="h-[78px] w-[66px] shrink-0 object-cover sm:h-[118px] sm:w-[100px]"
          />
        )}
        <div className="min-w-0">
          <p className={`text-lg font-bold uppercase tracking-wide sm:text-2xl ${NAVY}`}>
            {persona.name}
          </p>
          <dl className="mt-1.5 grid grid-cols-[auto_1fr] gap-x-3 text-[10px] sm:mt-2 sm:gap-x-6 sm:text-[13px]">
            <dt className="font-semibold text-slate-800">Address:</dt>
            <dd>Kumasi, Ghana</dd>
            <dt className="font-semibold text-slate-800">Phone:</dt>
            <dd>+233 20 000 0000</dd>
            <dt className="font-semibold text-slate-800">Email:</dt>
            <dd>osborn@email.com</dd>
          </dl>
        </div>
      </header>

      <div className="mt-5 space-y-4 sm:mt-6">
        <ClassicSection title={persona.labels.summary}>
          <LineBody section="summary" bullet={false} p={p} />
        </ClassicSection>

        <ClassicSection title={persona.labels.experience}>
          <ClassicEntry section="experience" p={p} />
        </ClassicSection>

        <ClassicSection title="Education">
          <div className="flex justify-between gap-3 font-semibold text-slate-800">
            <span>BSc Electrical and Electronic Engineering</span>
            <span className="shrink-0">2021 – 2025</span>
          </div>
          <p>KNUST</p>
          <ul className="list-disc pl-4">
            <li>Second Class Upper. Thesis on solar microgrids for rural communities.</li>
          </ul>
        </ClassicSection>

        <ClassicSection title={persona.labels.projects}>
          <ClassicEntry section="projects" p={p} />
        </ClassicSection>

        <ClassicSection title={persona.labels.activities}>
          <ClassicEntry section="activities" p={p} />
        </ClassicSection>

        <ClassicSection title="Additional Information">
          <ul className="list-disc space-y-0.5 pl-4">
            <li>
              <span className="font-semibold text-slate-800">Technical Skills:</span> AutoCAD,
              MATLAB, PLC programming, solar PV design
            </li>
            <li>
              <span className="font-semibold text-slate-800">Languages:</span> English, Twi, Ga
            </li>
          </ul>
        </ClassicSection>
      </div>
    </div>
  );
}

function ClassicSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p
        className={`mb-1.5 border-b border-[#1e3a5f]/60 pb-0.5 text-xs font-bold uppercase sm:text-sm ${NAVY}`}
      >
        {title}
      </p>
      {children}
    </div>
  );
}

function ClassicEntry({ section, p }: { section: DemoSection; p: DemoTemplateProps }) {
  const { meta } = lineFor(section, p);
  return (
    <>
      {meta && (
        <div className="flex justify-between gap-3 font-semibold text-slate-800">
          <span>
            {meta.title}
            <span className="font-normal text-slate-600">, {meta.place}</span>
          </span>
          <span className="shrink-0">{meta.date}</span>
        </div>
      )}
      <LineBody section={section} bullet={!!meta} p={p} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Template 3: elegant serif, no photo, ruled headings (Caleb)         */
/* ------------------------------------------------------------------ */

export function SerifTemplate(p: DemoTemplateProps) {
  const { persona } = p;

  return (
    <div className="rounded-md bg-white px-5 py-7 font-serif text-[11px] leading-relaxed text-slate-700 sm:px-10 sm:py-10 sm:text-[13px]">
      <header>
        <p className="text-xl font-bold uppercase tracking-wide text-slate-900 sm:text-3xl">
          {persona.name}
        </p>
        <p className="mt-1 text-[10px] text-slate-600 sm:text-xs">
          Kumasi, Ghana <Dot /> +233 55 000 0000 <Dot /> caleb@email.com
        </p>
        <p className="mt-0.5 text-[10px] text-slate-600 sm:text-xs">
          <span className="inline-flex items-center gap-1">
            <BrandIcon d="M4 9h3v11H4zM5.5 4a1.75 1.75 0 1 1 0 3.5 1.75 1.75 0 0 1 0-3.5M10 9h3v1.6c.5-.9 1.7-1.8 3.4-1.8 3.3 0 3.6 2.2 3.6 5V20h-3v-5.4c0-1.3 0-3-1.8-3s-2.2 1.4-2.2 2.9V20h-3z" />
            <span className="underline decoration-slate-300 underline-offset-2">linkedin.com/in/calebantwi</span>
          </span>
          <Dot />
          <span className="inline-flex items-center gap-1">
            <BrandIcon d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.6-1.4-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.6 9.6 0 0 1 5 0c1.9-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.3 4.7-4.6 5 .4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5A10 10 0 0 0 12 2" />
            <span className="underline decoration-slate-300 underline-offset-2">github.com/caleboss20</span>
          </span>
        </p>
      </header>

      <div className="mt-6 space-y-5 sm:mt-8">
        <SerifSection title={persona.labels.summary}>
          <LineBody section="summary" bullet={false} p={p} />
        </SerifSection>

        <SerifSection title={persona.labels.experience}>
          <SerifEntry section="experience" p={p} />
        </SerifSection>

        <SerifSection title={persona.labels.projects}>
          <SerifEntry section="projects" p={p} />
        </SerifSection>

        <SerifSection title="Education">
          <div className="flex justify-between gap-3 text-slate-800">
            <span>BSc Computer Science</span>
            <span className="shrink-0">2021 – 2025</span>
          </div>
          <p className="text-slate-500">Kwame Nkrumah University of Science and Technology, Kumasi</p>
        </SerifSection>

        <SerifSection title={persona.labels.activities}>
          <SerifEntry section="activities" p={p} />
        </SerifSection>

        <SerifSection title="Skills">
          <p>Languages: TypeScript, JavaScript, Dart, Python</p>
          <p>Frameworks: React Native, Next.js, Node.js, Tailwind CSS</p>
          <p>Tools: Git, Firebase, Supabase, Figma</p>
        </SerifSection>
      </div>
    </div>
  );
}

function Dot() {
  return <span className="mx-1 text-slate-400">•</span>;
}

function BrandIcon({ d }: { d: string }) {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="shrink-0 text-slate-700">
      <path d={d} />
    </svg>
  );
}

function SerifSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="border-b-2 border-slate-800 pb-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 sm:text-xs">
        {title}
      </p>
      <div className="mt-2 sm:pl-6">{children}</div>
    </div>
  );
}

function SerifEntry({ section, p }: { section: DemoSection; p: DemoTemplateProps }) {
  const { meta } = lineFor(section, p);
  return (
    <>
      {meta && (
        <div className="mb-1">
          <div className="flex justify-between gap-3 text-slate-900">
            <span className="text-[10px] uppercase tracking-wide sm:text-xs">{meta.title}</span>
            <span className="shrink-0">{meta.date}</span>
          </div>
          <p className="font-semibold text-slate-700">{meta.place}</p>
        </div>
      )}
      <LineBody section={section} bullet={!!meta} p={p} />
    </>
  );
}

import type { ReactNode } from "react";
import { demoPersonas, type DemoPersona } from "@/lib/ai-demo";
import {
  ClassicTemplate,
  SidebarTemplate,
  type DemoTemplateProps,
} from "./ai-demo-templates";

/** Props that render a demo template fully filled in, with nothing animating. */
function completed(persona: DemoPersona): DemoTemplateProps {
  return {
    persona,
    current: persona.examples[0],
    filled: Object.fromEntries(persona.examples.map((e) => [e.section, e])),
    phase: "typing",
    words: [],
    written: 0,
  };
}

/**
 * Renders a full-size CV page (600px wide) shrunk down to a thumbnail,
 * so the text is real rather than placeholder bars.
 */
export function ScaledPage({ children }: { children: ReactNode }) {
  return (
    <div className="h-[146px] w-[104px] overflow-hidden rounded-[3px] bg-white sm:h-[212px] sm:w-[150px]">
      <div className="w-[600px] origin-top-left scale-[0.1733] sm:scale-[0.25]">{children}</div>
    </div>
  );
}

export function MonochromeThumb() {
  return <SidebarTemplate {...completed(demoPersonas[0])} />;
}

export function ClassicBlueThumb() {
  return <ClassicTemplate {...completed(demoPersonas[1])} />;
}

/* ------------------------------------------------------------------ */
/* ATS Classic: centered name, centered ruled headings, no photo       */
/* ------------------------------------------------------------------ */

const jobs = [
  {
    title: "Clinical Rotation Student",
    place: "Komfo Anokye Teaching Hospital, Kumasi",
    date: "Jan 2025 – present",
    bullets: [
      "Assisted nurses with patient admissions, vital signs and medication rounds on a 30-bed surgical ward.",
      "Updated patient charts accurately during day and night shifts.",
      "Explained discharge instructions to patients and families in English and Twi.",
    ],
  },
  {
    title: "Volunteer Health Educator",
    place: "Ghana Red Cross Society, Kumasi",
    date: "Jun 2023 – Dec 2024",
    bullets: [
      "Ran malaria and hygiene awareness sessions in 6 community schools.",
      "Supported free blood pressure screening at monthly health walks.",
    ],
  },
];

export function AtsClassicThumb() {
  return (
    <div className="bg-white px-10 py-10 text-[13px] leading-relaxed text-slate-700">
      <header className="text-center">
        <p className="text-[26px] font-medium uppercase tracking-[0.12em] text-slate-900">
          Abena Owusu
        </p>
        <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.15em] text-slate-700">
          Kumasi, Ghana <Dot /> 024 000 0000 <Dot /> abena.owusu@email.com
        </p>
      </header>

      <AtsSection title="Professional Profile">
        <p className="text-justify">
          Final-year Nursing student at KNUST with hands-on ward experience at Komfo Anokye
          Teaching Hospital. Calm under pressure, careful with records and confident explaining
          care to patients. Looking for a rotation nurse role where I can keep learning.
        </p>
      </AtsSection>

      <AtsSection title="Work Experience">
        <div className="space-y-4">
          {jobs.map((j) => (
            <div key={j.title}>
              <div className="flex justify-between gap-4 text-[11px] uppercase tracking-[0.12em] text-slate-900">
                <span>{j.title}</span>
                <span className="normal-case tracking-normal">{j.date}</span>
              </div>
              <p className="font-semibold text-slate-800">{j.place}</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-5">
                {j.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </AtsSection>

      <AtsSection title="Education">
        <div className="flex justify-between gap-4 font-semibold text-slate-800">
          <span>BSc Nursing</span>
          <span className="font-normal">2022 – 2026</span>
        </div>
        <p>Kwame Nkrumah University of Science and Technology, Kumasi</p>
      </AtsSection>

      <AtsSection title="Skills">
        <p>Languages: English (fluent), Twi (native)</p>
        <p>Clinical: vital signs, wound dressing, patient education, infection control</p>
        <p>Computer skills: MS Office, electronic health records</p>
      </AtsSection>
    </div>
  );
}

function AtsSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-6">
      <p className="border-b-2 border-slate-800 pb-1 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-900">
        {title}
      </p>
      <div className="mt-2.5">{children}</div>
    </section>
  );
}

function Dot() {
  return <span className="mx-1.5">•</span>;
}

import type { ReactNode } from "react";
import type { CvDoc } from "@/lib/cv-examples";
import { extraLists, ProjectsList, ReferencesGrid } from "./cv-parts";

/**
 * Clean single-column CV: centered name, ruled centered headings, no photo.
 * Plain text structure so it reads well for both people and ATS software.
 */
export function AtsCv({ doc, role }: { doc: CvDoc; role?: string }) {
  return (
    <div className="h-full bg-white px-6 py-8 text-[13px] leading-relaxed text-slate-700 sm:px-10 sm:py-10">
      <header className="text-center">
        <p className="text-2xl font-medium uppercase tracking-[0.12em] text-slate-900 sm:text-[26px]">
          {doc.name}
        </p>
        {role && <p className="mt-0.5 text-sm text-slate-600">{role}</p>}
        <p className="mt-1 flex flex-wrap justify-center gap-y-0.5 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-700">
          {doc.contact.map((c, i) => (
            <span key={c} className="whitespace-nowrap">
              {i > 0 && <span className="mx-1.5">•</span>}
              <span className={c.includes("@") || c.includes(".com/") || c.includes(".net/") ? "normal-case tracking-normal" : ""}>
                {c}
              </span>
            </span>
          ))}
        </p>
      </header>

      <AtsSection title="Professional Profile">
        <p className="text-justify">{doc.summary}</p>
      </AtsSection>

      <AtsSection title="Experience">
        <div className="space-y-4">
          {doc.experience.map((j) => (
            <div key={j.title + j.place}>
              <div className="flex justify-between gap-4 text-[11px] uppercase tracking-[0.12em] text-slate-900">
                <span>{j.title}</span>
                <span className="shrink-0 normal-case tracking-normal">{j.date}</span>
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
        {doc.education.map((e) => (
          <div key={e.degree}>
            <div className="flex justify-between gap-4 font-semibold text-slate-800">
              <span>{e.degree}</span>
              <span className="shrink-0 font-normal">{e.date}</span>
            </div>
            <p>{e.school}</p>
          </div>
        ))}
      </AtsSection>

      {doc.projects?.length ? (
        <AtsSection title="Projects">
          <ProjectsList projects={doc.projects} />
        </AtsSection>
      ) : null}

      <AtsSection title="Skills">
        {doc.skills.map((s) => (
          <p key={s}>{s}</p>
        ))}
        {extraLists(doc).map((l) => (
          <p key={l.title}>
            {l.title}: {l.items.join(", ")}
          </p>
        ))}
      </AtsSection>

      {doc.references?.length ? (
        <AtsSection title="References">
          <ReferencesGrid refs={doc.references} />
        </AtsSection>
      ) : null}
    </div>
  );
}

function AtsSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-6">
      <h3 className="border-b-2 border-slate-800 pb-1 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-900">
        {title}
      </h3>
      <div className="mt-2.5">{children}</div>
    </section>
  );
}

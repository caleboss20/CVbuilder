import Image from "next/image";
import type { ReactNode } from "react";
import type { CvDoc, CvExample, CvJob, CvTemplateName } from "@/lib/cv-examples";
import { AtsCv } from "./ats-cv";
import {
  Bullets,
  ContactIcon,
  contactKind,
  extraLists,
  ProjectsList,
  ReferencesGrid,
  skillGroups,
} from "./cv-parts";
import {
  AccentPortraitCv,
  BlueDiagonalCv,
  DarkHeaderCv,
  MonoSplitCv,
  NavyPanelCv,
  NavyRingCv,
  SimpleBoldCv,
  SlateBandCv,
} from "./cv-templates-more";
import { CleanRuleCv, GreyHeaderCv, SageCv, SoftBarsCv, TealHeaderCv } from "./cv-templates-single";

export type TemplateProps = { doc: CvDoc; role: string; photo?: string };

/** Renders a CV in any template. Used by the examples, the gallery and the builder. */
export function CvTemplateView({
  template,
  doc,
  role,
  photo,
}: {
  template: CvTemplateName;
  doc: CvDoc;
  role: string;
  photo?: string;
}) {
  const props: TemplateProps = { doc, role, photo };
  switch (template) {
    case "elegant":
      return <ElegantCv {...props} />;
    case "band":
      return <BandCv {...props} />;
    case "timeline":
      return <TimelineCv {...props} />;
    case "photo":
      return <PhotoCv {...props} />;
    case "simple":
      return <SimpleBoldCv {...props} />;
    case "darkHeader":
      return <DarkHeaderCv {...props} />;
    case "accent":
      return <AccentPortraitCv {...props} />;
    case "mono":
      return <MonoSplitCv {...props} />;
    case "navyPanel":
      return <NavyPanelCv {...props} />;
    case "navyRing":
      return <NavyRingCv {...props} />;
    case "blueDiagonal":
      return <BlueDiagonalCv {...props} />;
    case "slateBand":
      return <SlateBandCv {...props} />;
    case "sage":
      return <SageCv {...props} />;
    case "softBars":
      return <SoftBarsCv {...props} />;
    case "tealHeader":
      return <TealHeaderCv {...props} />;
    case "cleanRule":
      return <CleanRuleCv {...props} />;
    case "greyHeader":
      return <GreyHeaderCv {...props} />;
    default:
      return <AtsCv doc={doc} role={role} />;
  }
}

/** Renders a course example in its assigned template design. */
export function CvTemplate({ example }: { example: CvExample }) {
  return (
    <CvTemplateView template={example.template} doc={example.cv} role={example.role} photo={example.photo} />
  );
}

/* ------------------------------------------------------------------ */
/* Elegant Line: thin centered name, gold rule, divided columns        */
/* ------------------------------------------------------------------ */

function ElegantCv({ doc, role }: TemplateProps) {
  const [first, ...rest] = doc.name.split(" ");
  return (
    <div className="flex h-full flex-col bg-[#fbfaf8] px-6 py-10 text-[12.5px] leading-relaxed text-slate-600 @xl:px-10">
      <header className="text-center">
        <p className="text-[28px] font-light uppercase tracking-[0.3em] text-slate-900 @xl:text-[34px]">
          {first} <span className="font-normal">{rest.join(" ")}</span>
        </p>
        <p className="mt-2 text-[11px] uppercase tracking-[0.35em] text-slate-500">{role}</p>
      </header>
      <div className="mt-7 h-[3px] bg-[var(--cv-accent,#b59a72)]" />

      <div className="mt-7 grid flex-1 gap-7 @xl:grid-cols-[34%_1fr] @xl:gap-0">
        <aside className="space-y-7 @xl:border-r @xl:border-slate-300 @xl:pr-6">
          <div className="space-y-2.5">
            {doc.contact.map((c) => (
              <p key={c} className="flex items-center gap-3 break-words text-[11.5px]">
                <ContactIcon kind={contactKind(c)} className="text-slate-800" />
                {c}
              </p>
            ))}
          </div>
          <div>
            <ElegantHeading>Education</ElegantHeading>
            <div className="mt-3 space-y-3 text-[11.5px]">
              {doc.education.map((e) => (
                <div key={e.degree}>
                  <p className="font-semibold text-slate-800">{e.school}</p>
                  <p>{e.degree}</p>
                  <p>{e.date}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <ElegantHeading>Skills</ElegantHeading>
            <ul className="mt-3 space-y-1.5 text-[11.5px]">
              {skillGroups(doc.skills).flatMap((g) => g.items).map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
          {extraLists(doc, ["Awards"]).map((l) => (
            <div key={l.title}>
              <ElegantHeading>{l.title}</ElegantHeading>
              <ul className="mt-3 space-y-1.5 text-[11.5px]">
                {l.items.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          ))}
        </aside>

        <main className="flex flex-col [&>*:last-child]:mt-auto space-y-7 @xl:pl-7">
          <div>
            <ElegantHeading>Profile</ElegantHeading>
            <p className="mt-3 text-justify">{doc.summary}</p>
          </div>
          <div>
            <ElegantHeading>Work Experience</ElegantHeading>
            <div className="mt-3 space-y-5">
              {doc.experience.map((j) => (
                <div key={j.title + j.place}>
                  <p className="text-[11px] font-semibold uppercase text-slate-800">{j.title}</p>
                  <p className="text-slate-500">
                    {j.place} | {j.date}
                  </p>
                  <Bullets items={j.bullets} className="mt-1" />
                </div>
              ))}
            </div>
          </div>
          {doc.projects?.length ? (
            <div>
              <ElegantHeading>Projects</ElegantHeading>
              <ProjectsList projects={doc.projects} className="mt-3" />
            </div>
          ) : null}
          {doc.awards?.length ? (
            <div>
              <ElegantHeading>Achievements</ElegantHeading>
              <Bullets items={doc.awards ?? []} className="mt-3" />
            </div>
          ) : null}
          {doc.references?.length ? (
            <div>
              <ElegantHeading>References</ElegantHeading>
              <div className="mt-3">
                <ReferencesGrid refs={doc.references} />
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}

function ElegantHeading({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-[15px] font-normal uppercase tracking-[0.25em] text-slate-900">{children}</h3>
  );
}

/* ------------------------------------------------------------------ */
/* Soft Band: big light name, grey contact/summary band                */
/* ------------------------------------------------------------------ */

function BandCv({ doc, role }: TemplateProps) {
  const [first, ...rest] = doc.name.split(" ");
  const groups = skillGroups(doc.skills);
  return (
    <div className="flex h-full flex-col bg-linear-to-b from-white to-[#f1f1f1] text-[12.5px] leading-relaxed text-slate-600">
      <header className="flex flex-wrap items-end justify-between gap-4 px-6 pt-10 pb-8 @xl:px-10">
        <p className="font-serif text-[30px] font-light uppercase leading-tight tracking-[0.18em] text-slate-800 @xl:text-[38px]">
          {first}
          <br />
          {rest.join(" ")}
        </p>
        <p className="pb-2 text-[11px] uppercase tracking-[0.45em] text-slate-600">{role}</p>
      </header>

      <div className="grid gap-6 bg-[#e8e8e8] px-6 py-7 @xl:grid-cols-[34%_1fr] @xl:gap-0 @xl:px-10">
        <div className="@xl:border-r @xl:border-slate-300 @xl:pr-6">
          <BandHeading>Contact</BandHeading>
          <div className="mt-3 space-y-1.5 text-[11.5px]">
            {doc.contact.map((c) => (
              <p key={c} className="flex items-center gap-3 break-words">
                <ContactIcon kind={contactKind(c)} className="text-slate-700" />
                {c}
              </p>
            ))}
          </div>
        </div>
        <div className="@xl:pl-7">
          <BandHeading>Summary</BandHeading>
          <p className="mt-3 text-justify">{doc.summary}</p>
        </div>
      </div>

      <div className="grid flex-1 gap-7 px-6 py-8 @xl:grid-cols-[34%_1fr] @xl:gap-0 @xl:px-10">
        <aside className="space-y-6 @xl:border-r @xl:border-slate-300 @xl:pr-6">
          <div>
            <BandHeading>Education</BandHeading>
            {doc.education.map((e) => (
              <div key={e.degree} className="mt-3 text-[11.5px]">
                <p className="font-semibold uppercase text-slate-800">{e.school}</p>
                <p>{e.degree}</p>
                <p>{e.date}</p>
              </div>
            ))}
          </div>
          {[...groups.map((g) => ({ title: g.label || "Skills", items: g.items })), ...extraLists(doc, ["Awards"])].map(
            (g, i) => (
              <div key={g.title + i}>
                <BandHeading>{g.title}</BandHeading>
                <ul className="mt-3 space-y-1.5 text-[11.5px]">
                  {g.items.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            ),
          )}
        </aside>
        <main className="flex flex-col [&>*:last-child]:mt-auto space-y-6 @xl:pl-7">
          <div>
            <BandHeading>Relevant Experience</BandHeading>
            <div className="mt-3 space-y-4">
              {doc.experience.map((j) => (
                <div key={j.title + j.place}>
                  <p className="font-semibold uppercase text-slate-800">{j.title}</p>
                  <p>
                    {j.place} | {j.date}
                  </p>
                  <Bullets items={j.bullets} className="mt-1" />
                </div>
              ))}
            </div>
          </div>
          {doc.projects?.length ? (
            <div className="border-t border-slate-300 pt-5">
              <BandHeading>Projects</BandHeading>
              <ProjectsList projects={doc.projects} className="mt-3" />
            </div>
          ) : null}
          {doc.awards?.length ? (
            <div className="border-t border-slate-300 pt-5">
              <BandHeading>Achievements</BandHeading>
              <Bullets items={doc.awards ?? []} className="mt-3" />
            </div>
          ) : null}
          {doc.references?.length ? (
            <div className="border-t border-slate-300 pt-5">
              <BandHeading>References</BandHeading>
              <div className="mt-3">
                <ReferencesGrid refs={doc.references} nameClass="font-semibold uppercase text-slate-800" />
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}

function BandHeading({ children }: { children: ReactNode }) {
  return <h3 className="text-[11.5px] uppercase tracking-[0.4em] text-[color:var(--cv-accent,#334155)]">{children}</h3>;
}

/* ------------------------------------------------------------------ */
/* Bold Timeline: heavy name, bold ruled headings, timeline dots       */
/* ------------------------------------------------------------------ */

function TimelineCv({ doc, role }: TemplateProps) {
  return (
    <div className="flex h-full flex-col bg-white px-6 py-10 text-[12.5px] leading-relaxed text-slate-600 @xl:px-10">
      <header>
        <p className="text-[34px] font-black uppercase leading-none tracking-tight text-slate-950 @xl:text-[42px]">
          {doc.name}
        </p>
        <p className="mt-2 text-[17px] uppercase text-slate-800 @xl:text-[19px]">{role}</p>
      </header>

      <div className="mt-9 grid flex-1 gap-8 @xl:grid-cols-[35%_1fr]">
        <aside className="space-y-8">
          <div>
            <BoldHeading>Contact</BoldHeading>
            <div className="mt-3 space-y-2.5">
              {doc.contact.map((c) => (
                <p key={c} className="flex items-center gap-3 break-words text-[12px]">
                  <ContactIcon kind={contactKind(c)} className="text-slate-900" />
                  {c}
                </p>
              ))}
            </div>
          </div>
          <div>
            <BoldHeading>Education</BoldHeading>
            {doc.education.map((e) => (
              <div key={e.degree} className="mt-3">
                <p className="font-semibold text-slate-700">{e.date}</p>
                <p className="font-semibold uppercase text-slate-700">{e.school}</p>
                <Bullets items={[e.degree]} />
              </div>
            ))}
          </div>
          <div>
            <BoldHeading>Skills</BoldHeading>
            <Bullets items={skillGroups(doc.skills).flatMap((g) => g.items)} className="mt-3" />
          </div>
          {extraLists(doc, ["Awards"]).map((l) => (
            <div key={l.title}>
              <BoldHeading>{l.title}</BoldHeading>
              <Bullets items={l.items} className="mt-3" />
            </div>
          ))}
        </aside>

        <main className="flex flex-col [&>*:last-child]:mt-auto space-y-8">
          <div>
            <BoldHeading rule>Profile</BoldHeading>
            <p className="mt-3 text-justify">{doc.summary}</p>
          </div>
          <div>
            <BoldHeading rule>Work Experience</BoldHeading>
            <ol className="relative mt-4 space-y-6 border-l-2 border-[color:var(--cv-accent,#334155)] pl-6">
              {doc.experience.map((j) => (
                <TimelineItem key={j.title + j.place} job={j} />
              ))}
            </ol>
          </div>
          {doc.projects?.length ? (
            <div>
              <BoldHeading rule>Projects</BoldHeading>
              <ProjectsList projects={doc.projects} className="mt-3" />
            </div>
          ) : null}
          {doc.awards?.length ? (
            <div>
              <BoldHeading rule>Achievements</BoldHeading>
              <Bullets items={doc.awards ?? []} className="mt-3" />
            </div>
          ) : null}
          {doc.references?.length ? (
            <div>
              <BoldHeading rule>Reference</BoldHeading>
              <div className="mt-3">
                <ReferencesGrid refs={doc.references} nameClass="text-[14px] font-semibold text-slate-700" />
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}

function TimelineItem({ job }: { job: CvJob }) {
  return (
    <li className="relative">
      <span className="absolute -left-[31px] top-1.5 size-2.5 rounded-full bg-[var(--cv-accent,#1e293b)]" />
      <div className="flex justify-between gap-3">
        <p className="text-[14px] font-semibold text-slate-700">{job.place}</p>
        <p className="shrink-0 text-[11.5px] uppercase text-slate-600">{job.date}</p>
      </div>
      <p className="text-[13px] text-slate-600">{job.title}</p>
      <Bullets items={job.bullets} className="mt-2" />
    </li>
  );
}

function BoldHeading({ children, rule = false }: { children: ReactNode; rule?: boolean }) {
  return (
    <h3
      className={`text-[17px] font-extrabold uppercase tracking-[0.12em] text-[color:var(--cv-accent,#020617)] ${
        rule ? "border-b-2 border-[color:var(--cv-accent,#1e293b)] pb-1" : ""
      }`}
    >
      {children}
    </h3>
  );
}

/* ------------------------------------------------------------------ */
/* Modern Photo: light/bold split name, round photo, ring markers      */
/* ------------------------------------------------------------------ */

function PhotoCv({ doc, role, photo }: TemplateProps) {
  const parts = doc.name.split(" ");
  const last = parts.pop();
  return (
    <div className="flex h-full flex-col bg-white px-6 py-10 text-[12.5px] leading-relaxed text-slate-600 @xl:px-10">
      <header className="flex items-start justify-between gap-5">
        <div>
          <p className="text-[30px] font-light uppercase leading-none text-slate-500 @xl:text-[38px]">
            {parts.join(" ")}
          </p>
          <p className="text-[34px] font-extrabold uppercase leading-tight text-slate-950 @xl:text-[44px]">
            {last}
          </p>
          <p className="mt-1 text-[13px] font-bold uppercase tracking-wide text-slate-500">{role}</p>
        </div>
        {photo && (
          <Image
            src={photo}
            alt=""
            width={140}
            height={140}
            className="size-20 shrink-0 rounded-full object-cover @xl:size-28"
          />
        )}
      </header>

      <div className="mt-9 grid flex-1 gap-8 @xl:grid-cols-[38%_1fr]">
        <aside className="space-y-8">
          <div>
            <PhotoHeading>Contact</PhotoHeading>
            <div className="mt-4 space-y-3">
              {doc.contact.map((c) => (
                <p key={c} className="flex items-center gap-3 break-all text-[12px]">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full border-2 border-slate-800">
                    <ContactIcon kind={contactKind(c)} className="text-slate-900" />
                  </span>
                  {c}
                </p>
              ))}
            </div>
          </div>
          {[...skillGroups(doc.skills).map((g) => ({ title: g.label || "Skills", items: g.items })), ...extraLists(doc)].map(
            (g, i) => (
              <div key={g.title + i}>
                <PhotoHeading>{g.title}</PhotoHeading>
                <ul className="mt-4 space-y-2">
                  {g.items.map((s) => (
                    <li key={s} className="flex items-start gap-3">
                      <span className="mt-1.5 size-2 shrink-0 rounded-full border-2 border-slate-600" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            ),
          )}
        </aside>

        <main className="flex flex-col [&>*:last-child]:mt-auto space-y-8">
          <div>
            <PhotoHeading>Profile</PhotoHeading>
            <p className="mt-4">{doc.summary}</p>
          </div>
          <div>
            <PhotoHeading>Experience</PhotoHeading>
            <div className="mt-4 space-y-6">
              {doc.experience.map((j) => (
                <div key={j.title + j.place}>
                  <p className="flex items-center gap-3 text-[15px] font-medium text-slate-700">
                    <span className="size-3.5 shrink-0 rounded-full border-2 border-slate-500" />
                    {j.title}
                  </p>
                  <div className="ml-1.5 mt-2 border-l-2 border-slate-500 pl-5">
                    <p className="font-medium text-slate-800">
                      {j.place} · {j.date}
                    </p>
                    <Bullets items={j.bullets} className="mt-1.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <PhotoHeading>Education</PhotoHeading>
            {doc.education.map((e) => (
              <div key={e.degree} className="mt-4">
                <p className="font-semibold text-slate-800">{e.degree}</p>
                <p>
                  {e.school} · <span className="text-slate-500">{e.date}</span>
                </p>
              </div>
            ))}
          </div>
          {doc.projects?.length ? (
            <div>
              <PhotoHeading>Projects</PhotoHeading>
              <ProjectsList projects={doc.projects} className="mt-4" />
            </div>
          ) : null}
          {doc.references?.length ? (
            <div>
              <PhotoHeading>References</PhotoHeading>
              <div className="mt-4">
                <ReferencesGrid refs={doc.references} />
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}

function PhotoHeading({ children }: { children: ReactNode }) {
  return <h3 className="text-[17px] font-bold uppercase text-[color:var(--cv-accent,#020617)]">{children}</h3>;
}

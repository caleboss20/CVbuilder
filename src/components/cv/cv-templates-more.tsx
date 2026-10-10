import Image from "next/image";
import type { ReactNode } from "react";
import type { TemplateProps } from "./cv-templates";
import {
  Bullets,
  ContactIcon,
  contactKind,
  extraLists,
  ProjectsList,
  ReferencesGrid,
  skillGroups,
} from "./cv-parts";

/* ================================================================== */
/* 1. Simple Bold: plain one column, bold name, thick rule (ATS-safe)  */
/* ================================================================== */

export function SimpleBoldCv({ doc, role }: TemplateProps) {
  return (
    <div className="h-full bg-white px-6 py-10 text-[13px] leading-relaxed text-slate-700 @xl:px-12">
      <header>
        <p className="text-[32px] font-extrabold uppercase leading-none tracking-tight text-slate-950 @xl:text-[38px]">
          {doc.name}
        </p>
        <p className="mt-2 text-[18px] uppercase text-slate-800 @xl:text-[20px]">{role}</p>
        <div className="mt-2 h-[3px] bg-[var(--cv-accent,#0f172a)]" />
        <p className="mt-2 text-[12px] text-slate-700">{doc.contact.join(" | ")}</p>
      </header>

      <SimpleSection title="Profile">
        <p className="text-justify">{doc.summary}</p>
      </SimpleSection>

      <SimpleSection title="Professional Experience">
        <div className="space-y-4">
          {doc.experience.map((j) => (
            <div key={j.title + j.place}>
              <div className="flex justify-between gap-4 text-[12.5px] font-bold uppercase text-slate-900">
                <span>
                  {j.title} - {j.place}
                </span>
                <span className="shrink-0 normal-case">{j.date}</span>
              </div>
              <Bullets items={j.bullets} className="mt-1" />
            </div>
          ))}
        </div>
      </SimpleSection>

      <SimpleSection title="Education">
        <div className="space-y-2">
          {doc.education.map((e) => (
            <div key={e.degree}>
              <div className="flex justify-between gap-4 font-bold text-slate-900">
                <span>{e.degree}</span>
                <span className="shrink-0">{e.date}</span>
              </div>
              <p>{e.school}</p>
            </div>
          ))}
        </div>
      </SimpleSection>

      {doc.projects?.length ? (
        <SimpleSection title="Projects">
          <ProjectsList projects={doc.projects} />
        </SimpleSection>
      ) : null}

      <SimpleSection title="Professional Skills">
        <Bullets items={skillGroups(doc.skills).flatMap((g) => g.items)} />
      </SimpleSection>

      <SimpleSection title="Additional Information">
        <ul className="list-disc space-y-0.5 pl-5">
          {extraLists(doc).map((l) => (
            <li key={l.title}>
              <span className="font-bold text-slate-900">{l.title}:</span> {l.items.join(", ")}
            </li>
          ))}
          <li>
            <span className="font-bold text-slate-900">References:</span>{" "}
            {doc.references?.map((r) => `${r.name} (${r.role})`).join("; ") ?? "Available upon request"}
          </li>
        </ul>
      </SimpleSection>
    </div>
  );
}

function SimpleSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-6">
      <h3 className="border-b border-[color:var(--cv-accent,#334155)] pb-0.5 text-[15px] font-semibold uppercase text-[color:var(--cv-accent,#0f172a)]">
        {title}
      </h3>
      <div className="mt-2">{children}</div>
    </section>
  );
}

/* ================================================================== */
/* 2. Dark Header: charcoal band, round grey photo, grey sidebar       */
/* ================================================================== */

export function DarkHeaderCv({ doc, role, photo }: TemplateProps) {
  return (
    <div className="flex h-full flex-col bg-white text-[12.5px] leading-relaxed text-slate-600">
      <header className="grid bg-[var(--cv-accent,#3b3b3b)] px-6 pb-32 pt-10 @xl:grid-cols-[40%_1fr] @xl:px-0 @xl:py-12">
        <div />
        <div className="@xl:pr-10">
          <p className="text-[32px] font-bold uppercase leading-none tracking-wide text-white @xl:text-[40px]">
            {doc.name}
          </p>
          <div className="mt-4 h-px bg-white/70" />
          <p className="mt-4 text-[15px] tracking-[0.3em] text-white/90">{role}</p>
        </div>
      </header>

      <div className="grid flex-1 @xl:grid-cols-[40%_1fr]">
        <aside className="relative bg-[#f1f1f1] px-6 pb-10 pt-28 @xl:px-8">
          {photo && (
            <Image
              src={photo}
              alt=""
              width={200}
              height={200}
              className="absolute -top-28 left-1/2 size-48 -translate-x-1/2 rounded-full object-cover ring-[7px] ring-[color:var(--cv-accent,#3b3b3b)] grayscale"
            />
          )}
          <div className="space-y-8">
            <DarkBlock title="Contact">
              <div className="space-y-2.5">
                {doc.contact.map((c) => (
                  <p key={c} className="flex items-center gap-3 break-all">
                    <ContactIcon kind={contactKind(c)} className="text-slate-700" />
                    {c}
                  </p>
                ))}
              </div>
            </DarkBlock>
            <DarkBlock title="Skills">
              <Bullets items={skillGroups(doc.skills).flatMap((g) => g.items)} />
            </DarkBlock>
            <DarkBlock title="Education">
              <div className="space-y-3">
                {doc.education.map((e) => (
                  <div key={e.degree}>
                    <p className="font-semibold text-slate-800">{e.degree}</p>
                    <p>{e.school}</p>
                    <p>{e.date}</p>
                  </div>
                ))}
              </div>
            </DarkBlock>
            {extraLists(doc, ["Awards"]).map((l) => (
              <DarkBlock key={l.title} title={l.title}>
                <Bullets items={l.items} />
              </DarkBlock>
            ))}
          </div>
        </aside>

        <main className="flex flex-col [&>*:last-child]:mt-auto space-y-9 px-6 py-10 @xl:px-9">
          <DarkBlock title="About Me">
            <p className="text-justify">{doc.summary}</p>
          </DarkBlock>
          <DarkBlock title="Work Experience">
            <ol className="relative space-y-6 border-l border-slate-300 pl-6">
              {doc.experience.map((j) => (
                <li key={j.title + j.place} className="relative">
                  <span className="absolute -left-[29px] top-1.5 size-2.5 rounded-full bg-slate-400" />
                  <p className="text-[14px] font-bold text-slate-700">{j.title}</p>
                  <p className="border-b border-slate-300 pb-2">
                    {j.place} | {j.date}
                  </p>
                  <Bullets items={j.bullets} className="mt-2" />
                </li>
              ))}
            </ol>
          </DarkBlock>
          {doc.projects?.length ? (
            <DarkBlock title="Projects">
              <ProjectsList projects={doc.projects} />
            </DarkBlock>
          ) : null}
          {doc.awards?.length ? (
            <DarkBlock title="Achievements">
              <Bullets items={doc.awards ?? []} />
            </DarkBlock>
          ) : null}
          {doc.references?.length ? (
            <DarkBlock title="References">
              <ReferencesGrid refs={doc.references} />
            </DarkBlock>
          ) : null}
        </main>
      </div>
    </div>
  );
}

function DarkBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="border-b border-slate-300 pb-2 text-[16px] font-bold uppercase tracking-[0.15em] text-slate-700">
        {title}
      </h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

/* ================================================================== */
/* 3. Accent Portrait: tall grey portrait, yellow accent, split name   */
/* ================================================================== */

const YELLOW = "bg-[var(--cv-accent,#f2b705)]";

export function AccentPortraitCv({ doc, role, photo }: TemplateProps) {
  const parts = doc.name.split(" ");
  const last = parts.pop();
  const groups = skillGroups(doc.skills);
  return (
    <div className="h-full bg-[#fafafa] px-6 py-10 text-[12.5px] leading-relaxed text-slate-600 @xl:px-10">
      <header className="grid gap-6 @xl:grid-cols-[30%_1fr]">
        <div className="relative hidden h-[270px] overflow-hidden bg-slate-200 @xl:block">
          {photo && (
            <Image src={photo} alt="" fill sizes="220px" className="object-cover object-top grayscale" />
          )}
          <span
            className={`absolute bottom-0 left-0 size-14 ${YELLOW} [clip-path:polygon(0_0,100%_100%,0_100%)]`}
          />
        </div>
        <div>
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="flex items-center gap-2 text-[22px] font-medium text-slate-900">
                <span className={`inline-block h-7 w-2 -skew-x-12 ${YELLOW}`} />
                {parts.join(" ")}
              </p>
              <p className="text-[40px] font-extrabold leading-none text-slate-950 @xl:text-[46px]">{last}</p>
              <p className="mt-4 border-l-2 border-slate-700 pl-4 text-[14px] uppercase tracking-wide text-slate-800">
                {role}
              </p>
            </div>
            <div className="space-y-1 border-l border-slate-800 pl-4 text-[11.5px]">
              {doc.contact.map((c) => {
                const k = contactKind(c);
                const label = { phone: "P", email: "E", link: "W", location: "A" }[k];
                return (
                  <p key={c} className="break-all">
                    <span className="font-bold text-slate-900">{label}:</span> {c}
                  </p>
                );
              })}
            </div>
          </div>
          <p className="mt-6 text-justify">{doc.summary}</p>
        </div>
      </header>

      <div className="mt-10 grid gap-8 @xl:grid-cols-[30%_1fr]">
        <aside className="space-y-7">
          <div>
            <AccentHeading>Skills</AccentHeading>
            {groups.map((g, i) => (
              <div key={g.label || i} className="mt-3">
                <p className="text-[11px] font-bold uppercase text-slate-900">{"// "}{g.label || "Skills"}</p>
                <Bullets items={g.items} className="mt-1" />
              </div>
            ))}
          </div>
          <div>
            <AccentHeading>Education</AccentHeading>
            <div className="mt-3 space-y-3">
              {doc.education.map((e) => (
                <div key={e.degree}>
                  <p className="text-[11.5px] font-bold uppercase text-slate-900">{e.degree}</p>
                  <p>{e.school}</p>
                  <p>{e.date}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <main className="flex flex-col [&>*:last-child]:mt-auto space-y-7 @xl:border-l @xl:border-slate-800 @xl:pl-8">
          <div>
            <AccentHeading>Work Experience</AccentHeading>
            <div className="mt-3 space-y-5">
              {doc.experience.map((j) => (
                <div key={j.title + j.place} className="relative">
                  <span className="absolute -left-[37px] top-2 hidden h-px w-3 bg-slate-800 @xl:block" />
                  <p className="text-[14.5px] font-medium text-slate-900">{j.title}</p>
                  <p className="italic text-slate-700">
                    {j.place} | {j.date}
                  </p>
                  <Bullets items={j.bullets} className="mt-1" />
                </div>
              ))}
            </div>
          </div>
          {doc.projects?.length ? (
            <div>
              <AccentHeading>Projects</AccentHeading>
              <ProjectsList projects={doc.projects} className="mt-3" />
            </div>
          ) : null}
        </main>
      </div>

      <div className="mt-10 grid gap-6 border-t border-slate-200 pt-6 @xl:grid-cols-3">
        {doc.references?.length ? (
          <div>
            <AccentHeading>References</AccentHeading>
            <div className="mt-3 space-y-3">
              {doc.references.map((r) => (
                <div key={r.name}>
                  <p className="font-semibold uppercase text-slate-900">
                    {r.name} - {r.phone}
                  </p>
                  <p className="italic">{r.role}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
        {extraLists(doc)
          .slice(0, 2)
          .map((l) => (
            <div key={l.title}>
              <AccentHeading>{l.title}</AccentHeading>
              <ul className="mt-3 space-y-1">
                {l.items.map((s) => (
                  <li key={s} className="flex items-start gap-2.5">
                    <span className={`mt-2 size-1.5 shrink-0 rounded-full ${YELLOW}`} />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          ))}
      </div>
    </div>
  );
}

function AccentHeading({ children }: { children: ReactNode }) {
  return <h3 className="text-[16px] font-semibold uppercase tracking-wide text-slate-950">{children}</h3>;
}

/* ================================================================== */
/* 4. Mono Split: black bar, underlined contacts, photo right column   */
/* ================================================================== */

export function MonoSplitCv({ doc, role, photo }: TemplateProps) {
  const parts = doc.name.split(" ");
  const last = parts.pop();
  return (
    <div className="relative h-full bg-white px-6 py-12 text-[12.5px] leading-relaxed text-slate-600 @xl:pl-14 @xl:pr-10">
      <span className="absolute left-0 top-20 hidden h-36 w-4 bg-[var(--cv-accent,#020617)] @xl:block" />
      <header className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="text-[30px] font-light uppercase leading-tight text-slate-900 @xl:text-[34px]">
            {parts.join(" ")}
          </p>
          <p className="text-[34px] font-bold uppercase leading-none text-slate-950 @xl:text-[40px]">{last}</p>
          <p className="mt-3 text-[13px] uppercase tracking-[0.35em] text-slate-800">{role}</p>
        </div>
        <div className="w-full space-y-1.5 @xl:w-auto @xl:min-w-[230px]">
          {doc.contact.map((c) => (
            <p key={c} className="flex items-center gap-3">
              <ContactIcon kind={contactKind(c)} className="text-slate-900" />
              <span className="flex-1 border-b border-slate-700 pb-0.5 break-all">{c}</span>
            </p>
          ))}
        </div>
      </header>

      <div className="mt-10 grid gap-10 @xl:grid-cols-[1fr_32%]">
        <main className="flex flex-col [&>*:last-child]:mt-auto space-y-8">
          <div>
            <MonoHeading>Summary</MonoHeading>
            <p className="mt-3 border-l border-slate-500 pl-4 text-justify">{doc.summary}</p>
          </div>
          <div>
            <MonoHeading underline>Work Experience</MonoHeading>
            <div className="mt-5 space-y-6">
              {doc.experience.map((j) => (
                <div key={j.title + j.place}>
                  <p className="font-semibold uppercase text-slate-900">{j.title}</p>
                  <p className="text-slate-800">
                    {j.place} | {j.date}
                  </p>
                  <Bullets items={j.bullets} className="mt-2" />
                </div>
              ))}
            </div>
          </div>
          {doc.projects?.length ? (
            <div>
              <MonoHeading>Projects</MonoHeading>
              <ProjectsList projects={doc.projects} className="mt-3" />
            </div>
          ) : null}
          {doc.awards?.length ? (
            <div>
              <MonoHeading>Achievements</MonoHeading>
              <Bullets items={doc.awards ?? []} className="mt-3" />
            </div>
          ) : null}
          {doc.references?.length ? (
            <div>
              <MonoHeading>References</MonoHeading>
              <div className="mt-3">
                <ReferencesGrid refs={doc.references} />
              </div>
            </div>
          ) : null}
        </main>

        <aside className="space-y-8">
          {photo && (
            <Image
              src={photo}
              alt=""
              width={240}
              height={260}
              className="aspect-[1/1.05] w-full object-cover grayscale"
            />
          )}
          <MonoSide title="Education">
            <div className="space-y-3">
              {doc.education.map((e) => (
                <div key={e.degree}>
                  <p className="font-medium text-slate-900">{e.degree}</p>
                  <p>{e.school}</p>
                  <p className="italic text-slate-500">{e.date}</p>
                </div>
              ))}
            </div>
          </MonoSide>
          <MonoSide title="Skills">
            {skillGroups(doc.skills).map((g, i) => (
              <div key={g.label || i} className="mb-3">
                <p className="font-medium text-slate-900">{g.label || "Skills"}</p>
                <Bullets items={g.items} className="mt-1" />
              </div>
            ))}
            {extraLists(doc, ["Awards"]).map((l) => (
              <div key={l.title} className="mb-3">
                <p className="font-medium text-slate-900">{l.title}</p>
                <Bullets items={l.items} className="mt-1" />
              </div>
            ))}
          </MonoSide>
        </aside>
      </div>
    </div>
  );
}

function MonoHeading({ children, underline = false }: { children: ReactNode; underline?: boolean }) {
  return (
    <h3
      className={`text-[16px] font-bold uppercase tracking-wide text-[color:var(--cv-accent,#020617)] ${
        underline ? "inline-block border-b border-slate-800 pb-1 pr-10" : ""
      }`}
    >
      {children}
    </h3>
  );
}

function MonoSide({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="flex items-center gap-3 text-[16px] font-bold uppercase tracking-wide text-[color:var(--cv-accent,#020617)]">
        {title}
        <span className="h-px flex-1 bg-slate-800" />
      </h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

/* ================================================================== */
/* 5. Navy Panel: rounded navy photo panel, contact pill, navy sidebar */
/* ================================================================== */

const NAVY = "var(--cv-accent,#2c3a55)";

export function NavyPanelCv({ doc, role, photo }: TemplateProps) {
  const [first, ...rest] = doc.name.split(" ");
  return (
    <div className="flex h-full flex-col bg-white text-[12.5px] leading-relaxed text-slate-600">
      <header className="grid @xl:grid-cols-[38%_1fr]">
        <div className="flex items-center justify-center rounded-br-[44px] bg-[var(--cv-accent,#2c3a55)] px-6 py-8">
          {photo && (
            <Image
              src={photo}
              alt=""
              width={180}
              height={180}
              className="size-36 rounded-full object-cover ring-4 ring-white/30 @xl:size-40"
            />
          )}
        </div>
        <div className="flex flex-col justify-center px-6 py-8 @xl:px-10">
          <p className="font-serif text-[30px] font-black uppercase leading-tight text-[color:var(--cv-accent,#2c3a55)] @xl:text-[38px]">
            {first}
            <br />
            {rest.join(" ")}
          </p>
          <p className="mt-2 text-[14px] uppercase tracking-[0.2em] text-slate-700">{role}</p>
        </div>
      </header>

      <div className="mx-4 mt-2 flex flex-wrap justify-around gap-x-6 gap-y-2 rounded-full bg-[var(--cv-accent,#2c3a55)] px-6 py-3 text-[11px] text-white @xl:mx-6">
        {doc.contact.map((c) => (
          <p key={c} className="flex items-center gap-2 break-all">
            <ContactIcon kind={contactKind(c)} className="text-white" />
            {c}
          </p>
        ))}
      </div>

      <div className="mt-6 grid flex-1 @xl:grid-cols-[38%_1fr]">
        <aside className="space-y-7 rounded-tr-[44px] bg-[var(--cv-accent,#2c3a55)] px-6 py-9 text-white/85 @xl:px-8">
          <NavySide title="Education">
            <div className="space-y-3">
              {doc.education.map((e) => (
                <div key={e.degree}>
                  <p className="font-semibold text-white">{e.degree}</p>
                  <p>{e.school}</p>
                  <p>{e.date}</p>
                </div>
              ))}
            </div>
          </NavySide>
          {doc.certifications?.length ? (
            <NavySide title="Certifications">
              <Bullets items={doc.certifications} />
            </NavySide>
          ) : null}
          <NavySide title="Skills">
            <ul className="space-y-1.5">
              {skillGroups(doc.skills).flatMap((g) => g.items).map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </NavySide>
          {doc.awards?.length ? (
            <NavySide title="Awards">
              <Bullets items={doc.awards} />
            </NavySide>
          ) : null}
          {doc.interests?.length ? (
            <NavySide title="Interests">
              <ul className="space-y-1.5">
                {doc.interests.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </NavySide>
          ) : null}
          {doc.languages?.length ? (
            <NavySide title="Language">
              <ul className="space-y-1.5">
                {doc.languages.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </NavySide>
          ) : null}
        </aside>

        <main className="flex flex-col [&>*:last-child]:mt-auto space-y-8 px-6 py-9 @xl:px-9">
          <NavyMain title="About me">
            <p className="text-justify">{doc.summary}</p>
          </NavyMain>
          <NavyMain title="Experience">
            <div className="space-y-5">
              {doc.experience.map((j) => (
                <div key={j.title + j.place}>
                  <div className="flex justify-between gap-3">
                    <p className="text-[14px] font-bold text-slate-900">{j.title}</p>
                    <p className="shrink-0 text-[11.5px]">{j.date}</p>
                  </div>
                  <p className="text-slate-700">{j.place}</p>
                  <Bullets items={j.bullets} className="mt-1" />
                </div>
              ))}
            </div>
          </NavyMain>
          {doc.projects?.length ? (
            <NavyMain title="Projects">
              <ProjectsList projects={doc.projects} />
            </NavyMain>
          ) : null}
          {doc.references?.length ? (
            <NavyMain title="Reference">
              <ReferencesGrid refs={doc.references} nameClass="font-semibold text-slate-900" />
            </NavyMain>
          ) : null}
        </main>
      </div>
    </div>
  );
}

function NavySide({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="border-b border-white/40 pb-1.5 text-[17px] font-semibold tracking-[0.12em] text-white">
        {title}
      </h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function NavyMain({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="border-b border-slate-400 pb-1.5 text-[18px] font-bold tracking-[0.12em]" style={{ color: NAVY }}>
        {title}
      </h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

/* ================================================================== */
/* 6. Navy Ring: big navy-ringed photo, heavy navy name, wave lines    */
/* ================================================================== */

export function NavyRingCv({ doc, role, photo }: TemplateProps) {
  return (
    <div className="relative h-full overflow-hidden bg-linear-to-br from-white via-[#f3f4f7] to-[#e9ebf0] px-6 pb-32 pt-10 text-[12.5px] leading-relaxed text-slate-700 @xl:px-10">
      {/* Decorative shapes and wave lines */}
      <span className="absolute -right-10 -top-6 h-10 w-72 -skew-x-[30deg] bg-[var(--cv-accent,#1c2b4a)]" />
      <span className="absolute right-24 top-0 h-6 w-56 -skew-x-[30deg] bg-slate-300" />
      <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full text-slate-300" preserveAspectRatio="none" viewBox="0 0 100 140">
        {[0, 3, 6, 9, 12].map((o) => (
          <path key={o} d={`M-5 ${118 + o} C 25 ${100 + o}, 55 ${135 + o}, 105 ${112 + o}`} fill="none" stroke="currentColor" strokeWidth="0.15" />
        ))}
      </svg>
      <span className="absolute -bottom-10 -left-10 h-24 w-[70%] rounded-[100%] bg-[var(--cv-accent,#1c2b4a)]" />

      <div className="relative grid gap-8 @xl:grid-cols-[42%_1fr]">
        <aside className="space-y-6">
          {photo && (
            <Image
              src={photo}
              alt=""
              width={220}
              height={220}
              className="mx-auto size-44 rounded-full border-[12px] border-[color:var(--cv-accent,#1c2b4a)] object-cover @xl:size-52"
            />
          )}
          <RingSide title="Contact">
            <div className="space-y-2.5">
              {doc.contact.map((c) => (
                <p key={c} className="flex items-center gap-3 break-all">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[var(--cv-accent,#1c2b4a)] text-white">
                    <ContactIcon kind={contactKind(c)} />
                  </span>
                  {c}
                </p>
              ))}
            </div>
          </RingSide>
          <hr className="border-slate-400" />
          <RingSide title="Education">
            <div className="space-y-3">
              {doc.education.map((e) => (
                <div key={e.degree}>
                  <p className="text-[14px] font-bold text-[color:var(--cv-accent,#1c2b4a)]">{e.degree}</p>
                  <p className="font-semibold text-[color:var(--cv-accent,#1c2b4a)]">{e.school}</p>
                  <p>{e.date}</p>
                </div>
              ))}
            </div>
          </RingSide>
          <hr className="border-slate-400" />
          <RingSide title="Expertise">
            <ul className="space-y-1">
              {skillGroups(doc.skills).flatMap((g) => g.items).map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </RingSide>
          {extraLists(doc, ["Awards"]).map((l) => (
            <RingSide key={l.title} title={l.title}>
              <ul className="space-y-1">
                {l.items.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </RingSide>
          ))}
        </aside>

        <main className="flex flex-col [&>*:last-child]:mt-auto space-y-7 @xl:border-l-2 @xl:border-slate-400 @xl:pl-8">
          <header className="pt-2 @xl:pt-16">
            <p className="text-[34px] font-black uppercase leading-none text-[color:var(--cv-accent,#1c2b4a)] @xl:text-[42px]">{doc.name}</p>
            <p className="mt-2 text-[17px] uppercase tracking-wide text-slate-800">{role}</p>
            <div className="mt-4 h-0.5 w-4/5 bg-slate-400" />
          </header>
          <RingSide title="Profile">
            <p>{doc.summary}</p>
          </RingSide>
          <RingSide title="Work Experience">
            <div className="space-y-5">
              {doc.experience.map((j) => (
                <div key={j.title + j.place}>
                  <p className="text-[14.5px] font-bold text-[color:var(--cv-accent,#1c2b4a)]">{j.place}</p>
                  <p className="text-[14px]">{j.title}</p>
                  <p>{j.date}</p>
                  <Bullets items={j.bullets} className="mt-1.5" />
                </div>
              ))}
            </div>
          </RingSide>
          {doc.projects?.length ? (
            <RingSide title="Projects">
              <ProjectsList projects={doc.projects} />
            </RingSide>
          ) : null}
          {doc.awards?.length ? (
            <RingSide title="Achievements">
              <Bullets items={doc.awards ?? []} />
            </RingSide>
          ) : null}
          {doc.references?.length ? (
            <RingSide title="References">
              <ReferencesGrid refs={doc.references} nameClass="font-bold text-[color:var(--cv-accent,#1c2b4a)]" />
            </RingSide>
          ) : null}
        </main>
      </div>
    </div>
  );
}

function RingSide({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="text-[22px] font-black uppercase text-[color:var(--cv-accent,#1c2b4a)]">{title}</h3>
      <div className="mt-2">{children}</div>
    </section>
  );
}

/* ================================================================== */
/* 7. Blue Diagonal: blue corner, name in sidebar, blue timelines      */
/* ================================================================== */

const BLUE = "var(--cv-accent,#0b4aa2)";

export function BlueDiagonalCv({ doc, role, photo }: TemplateProps) {
  const [first, ...rest] = doc.name.split(" ");
  return (
    <div className="grid h-full bg-white text-[12.5px] leading-relaxed text-slate-700 @xl:grid-cols-[38%_1fr]">
      <aside className="relative overflow-hidden bg-[#f4f5f7] px-6 pb-10 pt-8 @xl:px-7">
        <span className="absolute left-0 top-0 size-56 bg-[var(--cv-accent,#0b4aa2)] [clip-path:polygon(0_0,100%_0,0_100%)]" />
        {photo ? (
          <Image
            src={photo}
            alt=""
            width={200}
            height={200}
            className="relative mx-auto size-40 rounded-full border-[6px] border-white object-cover @xl:size-44"
          />
        ) : (
          // Keep the name clear of the blue corner when there is no photo
          <div className="h-36" />
        )}
        <div className="relative mt-4 text-center">
          <p className="text-[34px] font-medium leading-tight" style={{ color: BLUE }}>
            {first}
            <br />
            {rest.join(" ")}
          </p>
          <p className="mt-1 text-[15px] font-semibold text-slate-900">{role}</p>
        </div>

        <div className="relative mt-8 space-y-8">
          <BlueHeading icon="M5 4h4l2 5-3 2a11 11 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" title="Contact">
            <div className="space-y-2.5 text-[11.5px]">
              {doc.contact.map((c) => (
                <p key={c} className="flex items-center gap-3 break-all">
                  <span style={{ color: BLUE }}>
                    <ContactIcon kind={contactKind(c)} />
                  </span>
                  {c}
                </p>
              ))}
            </div>
          </BlueHeading>
          <BlueHeading icon="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M4 21a8 8 0 0 1 16 0" title="About Me">
            <p className="text-justify">{doc.summary}</p>
          </BlueHeading>
          <BlueHeading icon="M10 3h4v4h4v4h-2a2 2 0 1 0 0 4h2v4h-4v-2a2 2 0 1 0-4 0v2H6v-4h2a2 2 0 1 0 0-4H6V7h4z" title="Skills">
            <Bullets items={skillGroups(doc.skills).flatMap((g) => g.items)} />
          </BlueHeading>
          {extraLists(doc, ["Awards"])
            .slice(0, 2)
            .map((l) => (
              <BlueHeading key={l.title} icon="M5 12l5 5L20 7" title={l.title}>
                <Bullets items={l.items} />
              </BlueHeading>
            ))}
        </div>
      </aside>

      <main className="flex flex-col [&>*:last-child]:mt-auto space-y-9 px-6 py-10 @xl:px-9">
        <BlueHeading icon="M2 9l10-5 10 5-10 5zM6 11v5c3 2 9 2 12 0v-5" title="Education">
          <BlueTimeline
            items={doc.education.map((e) => ({
              key: e.degree,
              title: e.degree,
              sub: e.school,
              date: e.date,
            }))}
          />
        </BlueHeading>
        <BlueHeading icon="M3 8h18v12H3zM8 8V5h8v3M3 13h18" title="Experience">
          <BlueTimeline
            items={doc.experience.map((j) => ({
              key: j.title + j.place,
              title: j.title,
              sub: j.place,
              date: j.date,
              body: <Bullets items={j.bullets} className="mt-1" />,
            }))}
          />
        </BlueHeading>
        {doc.projects?.length ? (
          <BlueHeading icon="M4 5h16v14H4zM4 9h16" title="Projects">
            <ProjectsList projects={doc.projects} />
          </BlueHeading>
        ) : null}
        {doc.awards?.length ? (
          <BlueHeading icon="M4 5h16v14H4zM4 9h16" title="Achievements">
            <Bullets items={doc.awards ?? []} />
          </BlueHeading>
        ) : null}
        {doc.references?.length ? (
          <BlueHeading icon="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 21V5" title="References">
            <ReferencesGrid refs={doc.references} nameClass="text-[14px] font-semibold text-slate-800" />
          </BlueHeading>
        ) : null}
      </main>
    </div>
  );
}

function BlueHeading({ icon, title, children }: { icon: string; title: string; children: ReactNode }) {
  return (
    <section>
      <h3
        className="flex items-center gap-3 border-b pb-2 text-[20px] font-medium"
        style={{ color: BLUE, borderColor: BLUE }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d={icon} />
        </svg>
        {title}
      </h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function BlueTimeline({
  items,
}: {
  items: { key: string; title: string; sub: string; date: string; body?: ReactNode }[];
}) {
  return (
    <ol className="space-y-5 border-l-2 pl-6" style={{ borderColor: BLUE }}>
      {items.map((it) => (
        <li key={it.key} className="relative">
          <span className="absolute -left-[31px] top-1.5 size-3 rounded-full" style={{ background: BLUE }} />
          <p className="text-[14px] font-bold text-slate-900">{it.title}</p>
          <div className="flex justify-between gap-3">
            <p className="font-semibold italic text-slate-800">{it.sub}</p>
            <p className="shrink-0">{it.date}</p>
          </div>
          {it.body}
        </li>
      ))}
    </ol>
  );
}

/* ================================================================== */
/* 8. Slate Band: grey column, slate band with role, square markers    */
/* ================================================================== */

const SLATE = "var(--cv-accent,#5d7178)";

export function SlateBandCv({ doc, role, photo }: TemplateProps) {
  return (
    <div className="relative h-full bg-white text-[12.5px] leading-relaxed text-slate-600">
      {/* Grey column behind the sidebar, and the slate band across the top */}
      <span className="absolute bottom-0 left-6 top-0 hidden w-[31%] bg-[#d9d9d9] @xl:block" />
      <span className="absolute left-0 right-0 top-[118px] hidden h-9 @xl:block" style={{ background: SLATE }} />

      <header className="relative grid @xl:grid-cols-[37%_1fr]">
        <div className="flex justify-center bg-[#d9d9d9] pb-6 pt-8 @xl:bg-transparent @xl:pl-6">
          {photo && (
            <Image
              src={photo}
              alt=""
              width={180}
              height={180}
              className="relative z-10 size-40 rounded-full border-[7px] border-white object-cover"
            />
          )}
        </div>
        <div className="px-6 pt-6 text-center @xl:px-8 @xl:pt-12">
          <p className="text-[30px] font-extrabold uppercase leading-none @xl:text-[34px]" style={{ color: SLATE }}>
            {doc.name}
          </p>
          <p
            className="mt-3 py-2 text-[13px] uppercase tracking-[0.35em] text-white @xl:mt-5 @xl:bg-transparent"
            style={{ background: SLATE }}
          >
            {role}
          </p>
        </div>
      </header>

      <div className="relative grid gap-8 px-6 pb-10 pt-6 @xl:grid-cols-[37%_1fr] @xl:gap-10 @xl:px-0">
        <aside className="space-y-7 @xl:pl-12 @xl:pr-4">
          <SlateHeading>Contact</SlateHeading>
          <div className="-mt-4 space-y-2 text-[11.5px]">
            {doc.contact.map((c) => (
              <p key={c} className="flex items-center gap-2.5 break-all">
                <ContactIcon kind={contactKind(c)} className="text-slate-700" />
                {c}
              </p>
            ))}
          </div>
          <SlateHeading>Education</SlateHeading>
          <div className="-mt-4 space-y-3 text-[11.5px]">
            {doc.education.map((e) => (
              <div key={e.degree}>
                <p className="font-bold text-slate-700">{e.date}</p>
                <p className="font-bold uppercase text-slate-700">{e.school}</p>
                <Bullets items={[e.degree]} />
              </div>
            ))}
          </div>
          <SlateHeading>Skills</SlateHeading>
          <Bullets items={skillGroups(doc.skills).flatMap((g) => g.items)} className="-mt-4 text-[11.5px]" />
          {extraLists(doc, ["Awards"]).map((l) => (
            <div key={l.title} className="space-y-3">
              <SlateHeading>{l.title}</SlateHeading>
              <Bullets items={l.items} className="text-[11.5px]" />
            </div>
          ))}
        </aside>

        <main className="flex flex-col [&>*:last-child]:mt-auto space-y-7 @xl:pr-10">
          <div>
            <SlateHeading>Profile</SlateHeading>
            <p className="mt-2 text-justify">{doc.summary}</p>
          </div>
          <div>
            <SlateHeading>Work Experience</SlateHeading>
            <ol className="mt-3 space-y-5 border-l pl-5" style={{ borderColor: SLATE }}>
              {doc.experience.map((j) => (
                <li key={j.title + j.place} className="relative">
                  <span className="absolute -left-[25px] top-1.5 size-2 rotate-0" style={{ background: SLATE }} />
                  <div className="flex justify-between gap-3">
                    <p className="font-bold text-slate-800">{j.place}</p>
                    <p className="shrink-0 uppercase">{j.date}</p>
                  </div>
                  <p>{j.title}</p>
                  <Bullets items={j.bullets} className="mt-1" />
                </li>
              ))}
            </ol>
          </div>
          {doc.projects?.length ? (
            <div>
              <SlateHeading>Projects</SlateHeading>
              <ProjectsList projects={doc.projects} className="mt-2" />
            </div>
          ) : null}
          {doc.awards?.length ? (
            <div>
              <SlateHeading>Achievements</SlateHeading>
              <Bullets items={doc.awards ?? []} className="mt-2" />
            </div>
          ) : null}
          {doc.references?.length ? (
            <div>
              <SlateHeading>Reference</SlateHeading>
              <div className="mt-2">
                <ReferencesGrid refs={doc.references} nameClass="font-bold text-slate-800" />
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}

function SlateHeading({ children }: { children: ReactNode }) {
  return (
    <h3
      className="border-b border-slate-400 pb-1 text-[15px] font-bold uppercase tracking-[0.15em]"
      style={{ color: SLATE }}
    >
      {children}
    </h3>
  );
}

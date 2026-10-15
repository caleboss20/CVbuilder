import Image from "next/image";
import type { ReactNode } from "react";
import type { CvDoc, CvEducation, CvJob } from "@/lib/cv-examples";
import type { TemplateProps } from "./cv-templates";
import { Bullets, ContactIcon, contactKind, extraLists, skillGroups, type ContactKind } from "./cv-parts";

/*
 * Plain, recruiter-style CV layouts. Instead of one component per design, two
 * layout engines are driven by small config objects:
 *
 *   StackCv    one column: header + stacked sections (9 variants)
 *   SidebarCv  two columns: a narrow side column + a main column (7 variants)
 *
 * Adding another design means adding a config at the bottom of this file, not
 * writing new layout code. Every config reads its colour from `--cv-accent`, so
 * the colour picker, the PDF and the Word export keep working for all of them.
 *
 * Section headings are always an <h3> that is a direct child of its <section>.
 * HideEmptySections relies on that to hide sections the student has not filled.
 */

/** Accent colour with the picker override: falls back to the template's own colour. */
const A = (fallback: string) => `var(--cv-accent, ${fallback})`;

/** Splits "KNUST, Kumasi" into the organisation and the town. */
function splitPlace(place: string) {
  const [org, ...rest] = place.split(",");
  return { org: org.trim(), town: rest.join(",").trim() };
}

/** Human label for a contact line, used where contacts are shown as a small table. */
const contactLabel: Record<ContactKind, string> = {
  location: "Address",
  phone: "Phone",
  email: "Email",
  link: "Website",
};

/** Round-cornered square photo (these layouts are for CVs that choose to show one). */
function SquarePhoto({ src, width, height }: { src?: string; width: number; height: number }) {
  if (!src) return null;
  return (
    <Image src={src} alt="" width={width} height={height} style={{ width, height }} className="shrink-0 object-cover" />
  );
}

/** The skills of a CV as one flat list of items. */
const flatSkills = (doc: CvDoc) => skillGroups(doc.skills).flatMap((g) => g.items);

/* ================================================================== */
/* StackCv: one column                                                 */
/* ================================================================== */

type HeadingKind =
  | "rule" // accent-coloured text with a thin accent rule under it
  | "thick" // dark text with a heavy rule under it
  | "plain" // small dark text with a thin grey rule under it
  | "bar" // grey fading bar behind the text
  | "tint" // full-width tinted band behind the text
  | "divider"; // a rule above the text

type EntryStyle =
  | "role-first" // "Role, Organisation ........ dates"
  | "org-first" // "ORGANISATION, town ....... dates" then the role in italics
  | "date-column"; // dates and organisation in a left column, role and bullets on the right

type SkillsStyle =
  | "columns" // bullets in three columns
  | "groups" // one "Additional information" list: Label: items (extras folded in)
  | "sections" // every skill group is its own section, items joined with dashes
  | "inline"; // one section, items joined with dashes

type HeaderKind = "center" | "left" | "icons" | "photo";

type StackConfig = {
  /** Default accent colour; the colour picker overrides it. */
  accent: string;
  serif?: boolean;
  header: HeaderKind;
  /** Colour the name and role with the accent (otherwise they stay dark grey). */
  accentName?: boolean;
  /** center / left headers */
  nameClass?: string;
  roleClass?: string;
  /** Rule between the role and the contact line (center header). */
  rule?: "none" | "thin" | "thick";
  /** Separator between contact items on one line. */
  sep?: string;
  /** icons header: rules above and below the contact row */
  contactRules?: "bottom" | "both";
  heading: HeadingKind;
  entry: EntryStyle;
  skills: SkillsStyle;
  titles: { summary: string; experience: string; education: string; skills: string };
};

function SectionHeading({ kind, accent, title }: { kind: HeadingKind; accent: string; title: string }) {
  const base = "font-bold uppercase tracking-wide";
  switch (kind) {
    case "rule":
      return (
        <h3 className={`${base} border-b pb-1 text-[15px]`} style={{ color: A(accent), borderColor: A(accent) }}>
          {title}
        </h3>
      );
    case "thick":
      return <h3 className={`${base} border-b-2 border-slate-800 pb-1 text-[15px] text-slate-900`}>{title}</h3>;
    case "plain":
      return <h3 className={`${base} border-b border-slate-400 pb-1 text-[13px] text-slate-800`}>{title}</h3>;
    case "bar":
      return (
        <h3
          className={`${base} px-3 py-1.5 text-[14px] text-slate-900`}
          style={{
            background: `linear-gradient(to right, color-mix(in srgb, ${A(accent)} 35%, #e2e8f0), white)`,
          }}
        >
          {title}
        </h3>
      );
    case "tint":
      // Negative margins match the page padding so the band runs edge to edge
      return (
        <h3
          className={`${base} -mx-12 px-12 py-1.5 text-[15px] text-slate-900`}
          style={{ background: `color-mix(in srgb, ${A(accent)} 16%, white)` }}
        >
          {title}
        </h3>
      );
    case "divider":
      return <h3 className={`${base} border-t border-slate-800 pt-3 text-[15px] text-slate-900`}>{title}</h3>;
  }
}

function Jobs({ jobs, entry }: { jobs: CvJob[]; entry: EntryStyle }) {
  return (
    <div className="space-y-4">
      {jobs.map((j) => {
        const key = j.title + j.place + j.date;
        if (entry === "date-column") {
          return (
            <div key={key} className="grid grid-cols-[130px_1fr] gap-x-6">
              <div>
                <p className="font-bold text-slate-900">{j.date}</p>
                <p className="text-slate-500">{j.place}</p>
              </div>
              <div>
                <p className="font-bold text-slate-900">{j.title}</p>
                <Bullets items={j.bullets} className="mt-1" />
              </div>
            </div>
          );
        }
        if (entry === "org-first") {
          const { org, town } = splitPlace(j.place);
          return (
            <div key={key}>
              <div className="flex justify-between gap-4 text-slate-900">
                <p>
                  <b className="uppercase">{org}</b>
                  {town && <i> — {town}</i>}
                </p>
                <i className="shrink-0">{j.date}</i>
              </div>
              <p className="italic">{j.title}</p>
              <Bullets items={j.bullets} className="mt-1" />
            </div>
          );
        }
        return (
          <div key={key}>
            <div className="flex justify-between gap-4 text-slate-900">
              <p>
                <b>{j.title}</b>
                {j.place && <>, {j.place}</>}
              </p>
              <span className="shrink-0">{j.date}</span>
            </div>
            <Bullets items={j.bullets} className="mt-1" />
          </div>
        );
      })}
    </div>
  );
}

function Schools({ schools, entry }: { schools: CvEducation[]; entry: EntryStyle }) {
  return (
    <div className="space-y-3">
      {schools.map((e) => {
        const key = e.degree + e.school;
        if (entry === "date-column") {
          return (
            <div key={key} className="grid grid-cols-[130px_1fr] gap-x-6">
              <div>
                <p className="font-bold text-slate-900">{e.date}</p>
                <p className="text-slate-500">{e.school}</p>
              </div>
              <p className="font-bold text-slate-900">{e.degree}</p>
            </div>
          );
        }
        if (entry === "org-first") {
          return (
            <div key={key}>
              <div className="flex justify-between gap-4 text-slate-900">
                <b className="uppercase">{e.school}</b>
                <b className="shrink-0">{e.date}</b>
              </div>
              <p className="italic">{e.degree}</p>
            </div>
          );
        }
        return (
          <div key={key}>
            <div className="flex justify-between gap-4 text-slate-900">
              <b>{e.degree}</b>
              <span className="shrink-0">{e.date}</span>
            </div>
            <p>{e.school}</p>
          </div>
        );
      })}
    </div>
  );
}

function ContactRow({ doc, className = "" }: { doc: CvDoc; className?: string }) {
  return (
    <div className={`flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 ${className}`}>
      {doc.contact.map((c) => (
        <span key={c} className="inline-flex items-center gap-1.5 break-all">
          <ContactIcon kind={contactKind(c)} />
          {c}
        </span>
      ))}
    </div>
  );
}

function StackHeader({ cfg, doc, role, photo }: { cfg: StackConfig } & TemplateProps) {
  const sep = cfg.sep ?? "  |  ";

  if (cfg.header === "photo") {
    return (
      <header className="flex items-start gap-8">
        <SquarePhoto src={photo} width={106} height={112} />
        <div className="min-w-0">
          <p className="text-[30px] font-bold uppercase leading-tight" style={{ color: A(cfg.accent) }}>
            {doc.name}
          </p>
          {role && <p className="text-[15px] text-slate-600">{role}</p>}
          <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-6 gap-y-0.5 text-[14px]">
            {doc.contact.map((c) => (
              <div key={c} className="contents">
                <dt className="font-semibold text-slate-900">{contactLabel[contactKind(c)]}</dt>
                <dd className="break-all">{c}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>
    );
  }

  if (cfg.header === "left") {
    return (
      <header>
        <p className={cfg.nameClass ?? "text-[44px] font-light uppercase leading-none tracking-wide text-slate-900"}>
          {doc.name}
        </p>
        {role && <p className={cfg.roleClass ?? "mt-3 text-[22px] font-bold uppercase text-slate-900"}>{role}</p>}
        <p className="mt-2 text-[14px]">{doc.contact.join(sep)}</p>
        <div className="mt-5 border-t border-slate-800" />
      </header>
    );
  }

  if (cfg.header === "icons") {
    const both = cfg.contactRules === "both";
    return (
      <header className="text-center">
        <p className={cfg.nameClass ?? "text-[32px] font-bold uppercase tracking-wide text-slate-900"}>{doc.name}</p>
        {role && <p className={cfg.roleClass ?? "mt-0.5 text-[14px] italic text-slate-600"}>{role}</p>}
        <ContactRow
          doc={doc}
          className={`mt-4 py-3 text-[12.5px] ${both ? "border-y border-slate-700" : "border-b border-slate-300"}`}
        />
      </header>
    );
  }

  // center
  const nameColour = cfg.accentName ? { color: A(cfg.accent) } : undefined;
  return (
    <header className="text-center">
      <p className={cfg.nameClass ?? "text-[34px] font-bold uppercase tracking-wide text-slate-900"} style={nameColour}>
        {doc.name}
      </p>
      {role && (
        <p className={cfg.roleClass ?? "text-[18px] font-semibold text-slate-800"} style={nameColour}>
          {role}
        </p>
      )}
      {cfg.rule === "thick" && <div className="mx-0 mt-4 h-[3px]" style={{ background: A(cfg.accent) }} />}
      {cfg.rule === "thin" && <div className="mt-3 border-t border-slate-300" />}
      <p className="mt-3 text-[13.5px]">{doc.contact.join(sep)}</p>
    </header>
  );
}

/** Builds every section of a stacked CV, in reading order. */
function stackSections(cfg: StackConfig, doc: CvDoc): ReactNode[] {
  const { accent, heading, entry, titles } = cfg;
  const section = (key: string, title: string, body: ReactNode) => (
    <section key={key}>
      <SectionHeading kind={heading} accent={accent} title={title} />
      <div className="mt-2.5">{body}</div>
    </section>
  );

  const out: ReactNode[] = [];
  if (doc.summary) out.push(section("summary", titles.summary, <p className="text-justify">{doc.summary}</p>));
  if (doc.experience.length) out.push(section("experience", titles.experience, <Jobs jobs={doc.experience} entry={entry} />));
  if (doc.education.length) out.push(section("education", titles.education, <Schools schools={doc.education} entry={entry} />));
  if (doc.projects?.length) {
    out.push(
      section(
        "projects",
        "Projects",
        <ul className="list-disc space-y-1 pl-5">
          {doc.projects.map((p) => (
            <li key={p.name}>
              <b className="text-slate-900">{p.name}:</b> {p.detail}
            </li>
          ))}
        </ul>,
      ),
    );
  }

  const groups = skillGroups(doc.skills);
  const extras = extraLists(doc);

  if (cfg.skills === "groups") {
    // Skills and the short lists (languages, certifications...) share one list
    const lines = [
      ...groups.map((g) => ({ label: g.label || "Skills", items: g.items })),
      ...extras.map((x) => ({ label: x.title, items: x.items })),
    ];
    if (lines.length) {
      out.push(
        section(
          "additional",
          "Additional Information",
          <ul className="list-disc space-y-1 pl-5">
            {lines.map((l) => (
              <li key={l.label}>
                <b className="text-slate-900">{l.label}:</b> {l.items.join(", ")}
              </li>
            ))}
          </ul>,
        ),
      );
    }
  } else {
    if (cfg.skills === "columns" && groups.length) {
      out.push(
        section(
          "skills",
          titles.skills,
          <ul className="grid grid-cols-3 gap-x-6 gap-y-1">
            {flatSkills(doc).map((s) => (
              <li key={s} className="flex items-start gap-2">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-slate-700" />
                {s}
              </li>
            ))}
          </ul>,
        ),
      );
    } else if (cfg.skills === "sections") {
      groups.forEach((g) =>
        out.push(section(`skills-${g.label}`, g.label ? `${g.label} Skills` : titles.skills, <p>{g.items.join(" - ")}</p>)),
      );
    } else if (cfg.skills === "inline" && groups.length) {
      out.push(section("skills", titles.skills, <p className="italic">{flatSkills(doc).join(" - ")}</p>));
    }

    extras.forEach((x) =>
      out.push(
        section(
          x.title,
          x.title,
          cfg.skills === "columns" ? (
            <ul className="grid grid-cols-3 gap-x-6 gap-y-1">
              {x.items.map((i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-slate-700" />
                  {i}
                </li>
              ))}
            </ul>
          ) : (
            <p>{x.items.join(" - ")}</p>
          ),
        ),
      ),
    );
  }

  if (doc.references?.length) {
    out.push(
      section(
        "references",
        "References",
        <div className="grid grid-cols-2 gap-6">
          {doc.references.map((r) => (
            <div key={r.name}>
              <p className="font-bold text-slate-900">{r.name}</p>
              <p>{r.role}</p>
              <p className="text-[12px]">Phone: {r.phone}</p>
            </div>
          ))}
        </div>,
      ),
    );
  }
  return out;
}

function makeStack(cfg: StackConfig) {
  return function StackCv({ doc, role, photo }: TemplateProps) {
    return (
      <div className={`flex h-full flex-col bg-white text-[13px] leading-relaxed text-slate-700 ${cfg.serif ? "font-serif" : ""}`}>
        <div className="px-12 pt-10">
          <StackHeader cfg={cfg} doc={doc} role={role} photo={photo} />
        </div>
        {/* --cv-justify spreads the sections down the page once the CV is nearly complete */}
        <div className="flex flex-1 flex-col [justify-content:var(--cv-justify,space-between)] space-y-5 px-12 pb-10 pt-6">
          {stackSections(cfg, doc)}
        </div>
      </div>
    );
  };
}

/* ================================================================== */
/* SidebarCv: two columns                                              */
/* ================================================================== */

type SideSection =
  | "contact"
  | "summary"
  | "education"
  | "skills"
  | "languages" // just the languages list
  | "extras" // certifications, awards and interests
  | "experience"
  | "projects"
  | "references";

type SideConfig = {
  accent: string;
  /** left: name top-left · center: name centred · side: name inside the side column · band: tinted block · split: name left, contacts right */
  header: "left" | "center" | "side" | "band" | "split";
  side: SideSection[];
  main: SideSection[];
  sideWidth: number;
  /** Grey panel behind the side column. */
  sideBg?: boolean;
  /** Vertical rule between the columns. */
  vline?: boolean;
  /** Horizontal rules between sections. */
  rules?: boolean;
  /** Dots and a line down the experience (and education in the main column). */
  timeline?: boolean;
  /** Widely letter-spaced headings. */
  spaced?: boolean;
  /** Accent strips along the top and bottom edges. */
  stripe?: boolean;
  /** Heavy rule under main-column headings. */
  mainRule?: boolean;
  summaryTitle: string;
  experienceTitle: string;
};

function SideHeading({ cfg, title, where }: { cfg: SideConfig; title: string; where: "side" | "main" }) {
  return (
    <h3
      className={`text-[13px] font-bold uppercase text-slate-900 ${
        cfg.spaced ? "tracking-[0.28em]" : "tracking-[0.1em]"
      } ${cfg.mainRule && where === "main" ? "border-b-2 border-slate-900 pb-1.5" : ""}`}
    >
      {title}
    </h3>
  );
}

/** A list of entries, optionally hung off a vertical timeline line. */
function Entries({ children, timeline, accent }: { children: ReactNode[]; timeline?: boolean; accent: string }) {
  if (!timeline) return <div className="space-y-4">{children}</div>;
  return (
    <ol className="relative ml-1 space-y-4 border-l-2 border-slate-300 pl-5">
      {children.map((c, i) => (
        <li key={i} className="relative">
          <span className="absolute -left-[27px] top-1.5 size-2.5 rounded-full" style={{ background: A(accent) }} />
          {c}
        </li>
      ))}
    </ol>
  );
}

function sideSections(cfg: SideConfig, doc: CvDoc, where: "side" | "main", ids: SideSection[]): ReactNode[] {
  const out: ReactNode[] = [];
  const section = (key: string, title: string, body: ReactNode) =>
    out.push(
      <section
        key={key}
        className={cfg.rules ? "border-t border-slate-300 pt-5 first:border-t-0 first:pt-0" : undefined}
      >
        <SideHeading cfg={cfg} title={title} where={where} />
        <div className="mt-3">{body}</div>
      </section>,
    );

  for (const id of ids) {
    switch (id) {
      case "contact":
        if (doc.contact.length)
          section(
            "contact",
            "Contact",
            <ul className="space-y-2">
              {doc.contact.map((c) => (
                <li key={c} className="flex items-start gap-2 break-all">
                  <ContactIcon kind={contactKind(c)} className="mt-1" />
                  {c}
                </li>
              ))}
            </ul>,
          );
        break;
      case "summary":
        // Justified text leaves ugly gaps in a narrow column, so only the main column justifies
        if (doc.summary)
          section("summary", cfg.summaryTitle, <p className={where === "main" ? "text-justify" : ""}>{doc.summary}</p>);
        break;
      case "education":
        if (doc.education.length)
          section(
            "education",
            "Education",
            <Entries timeline={cfg.timeline && where === "main"} accent={cfg.accent}>
              {doc.education.map((e) => (
                <div key={e.degree + e.school}>
                  <p className="text-[12px] font-semibold tracking-wide text-slate-500">{e.date}</p>
                  <p className="font-bold uppercase text-slate-800">{e.school}</p>
                  <p>{e.degree}</p>
                </div>
              ))}
            </Entries>,
          );
        break;
      case "skills":
        if (doc.skills.length)
          section(
            "skills",
            "Skills",
            <ul className="list-disc space-y-1 pl-5">
              {flatSkills(doc).map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>,
          );
        break;
      case "languages":
      case "extras":
        // "languages" shows only the languages list; "extras" shows the other short lists
        extraLists(doc)
          .filter((x) => (id === "languages") === (x.title === "Languages"))
          .forEach((x) =>
          section(
            x.title,
            x.title,
            <ul className={`list-disc gap-y-1 pl-5 ${where === "main" ? "grid grid-cols-2 gap-x-8" : "space-y-1"}`}>
              {x.items.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>,
          ),
        );
        break;
      case "experience":
        if (doc.experience.length)
          section(
            "experience",
            cfg.experienceTitle,
            <Entries timeline={cfg.timeline} accent={cfg.accent}>
              {doc.experience.map((j) => (
                <div key={j.title + j.place + j.date}>
                  <div className="flex justify-between gap-3 text-slate-900">
                    <b>{j.title}</b>
                    <span className="shrink-0 text-[12px] uppercase text-slate-600">{j.date}</span>
                  </div>
                  <p className="text-slate-500">{j.place}</p>
                  <Bullets items={j.bullets} className="mt-1" />
                </div>
              ))}
            </Entries>,
          );
        break;
      case "projects":
        if (doc.projects?.length)
          section(
            "projects",
            "Projects",
            <ul className="list-disc space-y-1 pl-5">
              {doc.projects.map((p) => (
                <li key={p.name}>
                  <b className="text-slate-900">{p.name}:</b> {p.detail}
                </li>
              ))}
            </ul>,
          );
        break;
      case "references":
        if (doc.references?.length)
          section(
            "references",
            "References",
            <div className={where === "main" ? "grid grid-cols-2 gap-5" : "space-y-3"}>
              {doc.references.map((r) => (
                <div key={r.name}>
                  <p className="font-bold text-slate-900">{r.name}</p>
                  <p>{r.role}</p>
                  <p className="text-[12px]">Phone: {r.phone}</p>
                </div>
              ))}
            </div>,
          );
        break;
    }
  }
  return out;
}

function SidebarHeader({ cfg, doc, role }: { cfg: SideConfig; doc: CvDoc; role: string }) {
  const [first, ...rest] = doc.name.split(" ");

  if (cfg.header === "left") {
    return (
      <header className="px-12 pt-10">
        <p className="text-[38px] uppercase leading-none tracking-wide text-slate-900">
          <b className="font-extrabold">{first}</b> {rest.join(" ")}
        </p>
        {role && <p className="mt-3 text-[20px] uppercase text-slate-800">{role}</p>}
      </header>
    );
  }

  if (cfg.header === "center") {
    return (
      <header className={`px-12 pt-10 pb-6 text-center ${cfg.rules ? "border-b border-slate-300" : ""}`}>
        <p className="text-[34px] font-bold uppercase leading-tight tracking-[0.12em] text-slate-800">{doc.name}</p>
        {role && <p className="mt-1 text-[17px] tracking-[0.18em] text-slate-600">{role}</p>}
        <div className="mx-auto mt-3 h-[3px] w-9" style={{ background: A(cfg.accent) }} />
        <p className="mt-3 text-[13px]">{doc.contact.join("  |  ")}</p>
      </header>
    );
  }

  if (cfg.header === "band") {
    return (
      <header className="grid grid-cols-[1fr_auto] items-center gap-8 bg-slate-100 px-12 py-9">
        <div>
          <p className="text-[34px] font-light uppercase leading-tight tracking-[0.1em] text-slate-700">{doc.name}</p>
          {role && <p className="mt-2 text-[13px] font-bold uppercase tracking-[0.3em] text-slate-600">{role}</p>}
        </div>
        <ul className="space-y-1.5 text-[12.5px]">
          {doc.contact.map((c) => (
            <li key={c} className="flex items-center gap-2">
              <ContactIcon kind={contactKind(c)} />
              {c}
            </li>
          ))}
        </ul>
      </header>
    );
  }

  if (cfg.header === "split") {
    return (
      <header className="flex items-start justify-between gap-6 border-b border-slate-300 px-12 pb-6 pt-10">
        <div>
          <p className="text-[36px] font-light uppercase leading-none tracking-[0.12em] text-slate-800">{doc.name}</p>
          {role && <p className="mt-3 text-[13px] uppercase tracking-[0.3em] text-slate-600">{role}</p>}
        </div>
        <ul className="space-y-0.5 text-right text-[12px]">
          {doc.contact.map((c) => (
            <li key={c} className="break-all">
              {c}
            </li>
          ))}
        </ul>
      </header>
    );
  }

  return null;
}

function makeSidebar(cfg: SideConfig) {
  return function SidebarCv({ doc, role }: TemplateProps) {
    return (
      <div className="relative flex h-full flex-col bg-white text-[13px] leading-relaxed text-slate-700">
        {cfg.stripe && <div className="h-3 shrink-0" style={{ background: A(cfg.accent) }} />}
        <SidebarHeader cfg={cfg} doc={doc} role={role} />

        <div className="grid flex-1" style={{ gridTemplateColumns: `${cfg.sideWidth}px 1fr` }}>
          <aside
            className={`flex flex-col [justify-content:var(--cv-justify,space-between)] gap-6 px-8 py-8 ${cfg.sideBg ? "bg-slate-100" : ""} ${
              cfg.vline ? "border-r border-slate-300" : ""
            }`}
          >
            {cfg.header === "side" && (
              <div className="pb-2">
                <p className="text-[34px] font-light uppercase leading-[1.1] tracking-[0.1em] text-slate-800">
                  {doc.name.split(" ").map((w) => (
                    <span key={w} className="block">
                      {w}
                    </span>
                  ))}
                </p>
                {role && <p className="mt-3 text-[11px] uppercase tracking-[0.3em] text-slate-500">{role}</p>}
              </div>
            )}
            {sideSections(cfg, doc, "side", cfg.side)}
          </aside>
          <main className="flex flex-col [justify-content:var(--cv-justify,space-between)] gap-6 px-9 py-8">
            {sideSections(cfg, doc, "main", cfg.main)}
          </main>
        </div>
        {cfg.stripe && <div className="h-3 shrink-0" style={{ background: A(cfg.accent) }} />}
      </div>
    );
  };
}

/* ================================================================== */
/* The designs                                                         */
/* ================================================================== */

/** Photo at the top left, labelled contacts, navy ruled headings. */
export const PhotoClassicCv = makeStack({
  accent: "#0b3a63",
  header: "photo",
  heading: "rule",
  entry: "role-first",
  skills: "groups",
  titles: { summary: "Summary", experience: "Work Experience", education: "Education", skills: "Skills" },
});

/** Centred name and role, heavy black rules, organisation-first entries. */
export const RuledClassicCv = makeStack({
  accent: "#111827",
  header: "center",
  nameClass: "text-[34px] font-bold uppercase tracking-wide text-slate-900",
  roleClass: "text-[22px] font-bold text-slate-900",
  rule: "none",
  sep: "  ·  ",
  heading: "thick",
  entry: "org-first",
  skills: "groups",
  titles: { summary: "Summary", experience: "Professional Experience", education: "Education", skills: "Skills" },
});

/** Serif centred name, heavy rule, one section per skill group. */
export const SerifExecutiveCv = makeStack({
  accent: "#3f3f46",
  serif: true,
  header: "center",
  nameClass: "text-[48px] font-bold leading-tight text-zinc-700",
  roleClass: "text-[16px] font-bold text-zinc-700",
  rule: "thick",
  sep: "  |  ",
  heading: "plain",
  entry: "role-first",
  skills: "sections",
  titles: { summary: "Professional Summary", experience: "Professional Experience", education: "Education", skills: "Skills" },
});

/** The same serif layout in navy, with one italic expertise line. */
export const SerifNavyCv = makeStack({
  accent: "#3b4a8a",
  serif: true,
  accentName: true,
  header: "center",
  nameClass: "text-[48px] font-bold leading-tight",
  roleClass: "text-[16px] font-bold",
  rule: "thick",
  sep: "  |  ",
  heading: "rule",
  entry: "role-first",
  skills: "inline",
  titles: { summary: "Professional Summary", experience: "Professional Experience", education: "Education", skills: "Areas of Expertise" },
});

/** Soft grey fading bars behind each heading, skills in three columns. */
export const GreyBarsCv = makeStack({
  accent: "#64748b",
  header: "center",
  nameClass: "text-[40px] font-bold uppercase leading-tight text-slate-900",
  roleClass: "text-[15px] font-bold text-slate-900",
  rule: "thin",
  sep: " | ",
  heading: "bar",
  entry: "role-first",
  skills: "columns",
  titles: { summary: "Summary", experience: "Work Experience", education: "Education", skills: "Key Skills" },
});

/** Left-aligned light name, a thin rule above every section. */
export const DividedSimpleCv = makeStack({
  accent: "#0f172a",
  header: "left",
  heading: "divider",
  entry: "role-first",
  skills: "columns",
  titles: { summary: "Summary", experience: "Professional Experience", education: "Education", skills: "Technical Skills" },
});

/** Centred bold name with an icon contact row under it. */
export const IconLineCv = makeStack({
  accent: "#111827",
  header: "icons",
  heading: "plain",
  entry: "org-first",
  skills: "columns",
  titles: { summary: "Summary", experience: "Professional Experience", education: "Education", skills: "Skills" },
});

/** Dates in a left column, contacts between two rules. */
export const DateColumnCv = makeStack({
  accent: "#1f2937",
  header: "icons",
  contactRules: "both",
  nameClass: "text-[34px] font-extrabold uppercase tracking-wide text-slate-900",
  roleClass: "mt-1 text-[13px] uppercase tracking-[0.3em] text-slate-600",
  heading: "thick",
  entry: "date-column",
  skills: "columns",
  titles: { summary: "About Me", experience: "Experience", education: "Education", skills: "Skills" },
});

/** Serif spaced name, soft tinted bands behind headings. */
export const LavenderBandCv = makeStack({
  accent: "#6366f1",
  serif: false,
  header: "icons",
  nameClass: "text-[32px] font-semibold uppercase tracking-[0.3em] text-slate-800",
  roleClass: "mt-1 text-[16px] tracking-[0.15em] text-slate-600",
  heading: "tint",
  entry: "date-column",
  skills: "columns",
  titles: { summary: "Career Summary", experience: "Work Experience", education: "Education", skills: "Skills" },
});

/** Bold first name, side column with contacts and skills, experience on a timeline. */
export const SideTimelineCv = makeSidebar({
  accent: "#111827",
  header: "left",
  side: ["contact", "education", "skills", "languages"],
  main: ["summary", "experience", "projects", "extras", "references"],
  sideWidth: 250,
  timeline: true,
  spaced: true,
  mainRule: true,
  summaryTitle: "Profile",
  experienceTitle: "Work Experience",
});

/** Name inside a wide side column, accent strips top and bottom. */
export const SideStripeCv = makeSidebar({
  accent: "#64748b",
  header: "side",
  side: ["contact", "education", "skills", "languages"],
  main: ["summary", "experience", "projects", "extras", "references"],
  sideWidth: 285,
  vline: true,
  spaced: true,
  stripe: true,
  summaryTitle: "Profile",
  experienceTitle: "Experience",
});

/** Grey side panel with the name on it, timeline in the main column. */
export const SidePanelCv = makeSidebar({
  accent: "#475569",
  header: "side",
  side: ["contact", "skills", "extras"],
  main: ["summary", "experience", "education", "projects", "references"],
  sideWidth: 235,
  sideBg: true,
  timeline: true,
  summaryTitle: "Statement",
  experienceTitle: "Work Experience",
});

/** Light name with contacts on the right, thin side column with profile and skills. */
export const ThinSplitCv = makeSidebar({
  accent: "#334155",
  header: "split",
  side: ["summary", "skills", "education"],
  main: ["experience", "projects", "extras", "references"],
  sideWidth: 225,
  vline: true,
  spaced: true,
  summaryTitle: "Profile",
  experienceTitle: "Professional Experience",
});

/** Centred name with a short accent bar, ruled grid below. */
export const GridLeftCv = makeSidebar({
  accent: "#1f2937",
  header: "center",
  side: ["skills", "education", "languages"],
  main: ["summary", "experience", "projects", "extras", "references"],
  sideWidth: 245,
  vline: true,
  rules: true,
  spaced: true,
  summaryTitle: "Summary",
  experienceTitle: "Experience",
});

/** Tinted header block with icon contacts, ruled grid below. */
export const GridBandCv = makeSidebar({
  accent: "#475569",
  header: "band",
  side: ["education", "skills", "languages"],
  main: ["summary", "experience", "projects", "extras", "references"],
  sideWidth: 250,
  vline: true,
  rules: true,
  timeline: true,
  spaced: true,
  summaryTitle: "Profile",
  experienceTitle: "Work Experience",
});

/** Centred spaced name, contacts in the side column, ruled grid. */
export const GridSpacedCv = makeSidebar({
  accent: "#525252",
  header: "center",
  side: ["contact", "education", "skills", "languages"],
  main: ["summary", "experience", "projects", "extras", "references"],
  sideWidth: 270,
  vline: true,
  rules: true,
  spaced: true,
  summaryTitle: "Profile Summary",
  experienceTitle: "Work Experience",
});

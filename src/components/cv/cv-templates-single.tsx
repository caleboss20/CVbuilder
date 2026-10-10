import Image from "next/image";
import type { ReactNode } from "react";
import type { CvDoc } from "@/lib/cv-examples";
import type { TemplateProps } from "./cv-templates";
import { Bullets, ContactIcon, contactKind, extraLists, skillGroups } from "./cv-parts";

/*
 * One-column templates with a strong header band, modelled on modern
 * "About me / Professional experience" layouts. Each variant only changes the
 * header and how section headings look; the body structure is shared.
 */

type Variant = {
  /** Default accent colour (the picker overrides it via --cv-accent). */
  accent: string;
  page: string;
  header: (p: TemplateProps & { accent: string }) => ReactNode;
  heading: (title: string, accent: string) => ReactNode;
};

const A = (fallback: string) => `var(--cv-accent, ${fallback})`;

function Contacts({ doc, className = "", iconClass = "" }: { doc: CvDoc; className?: string; iconClass?: string }) {
  return (
    <div className={`flex flex-wrap gap-x-5 gap-y-1.5 text-[13px] ${className}`}>
      {doc.contact.map((c) => (
        <span key={c} className="inline-flex items-center gap-2 break-all">
          <ContactIcon kind={contactKind(c)} className={iconClass} />
          {c}
        </span>
      ))}
    </div>
  );
}

function Photo({ src, size = 150, className = "" }: { src?: string; size?: number; className?: string }) {
  if (!src) return null;
  return (
    <Image
      src={src}
      alt=""
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className={`shrink-0 rounded-full object-cover ${className}`}
    />
  );
}

/** Shared body: About me, experience, education, projects, skills, extras, references. */
function Body({ doc, heading, accent }: { doc: CvDoc; heading: (t: string) => ReactNode; accent: string }) {
  const skills = skillGroups(doc.skills).flatMap((g) => g.items);
  return (
    <div className="space-y-6 px-10 pb-10 pt-7 text-[13px] leading-relaxed text-slate-700">
      {doc.summary && (
        <section>
          {heading("About Me")}
          <p className="mt-3">{doc.summary}</p>
        </section>
      )}

      {doc.experience.length > 0 && (
        <section>
          {heading("Professional Experience")}
          <div className="mt-3 space-y-4">
            {doc.experience.map((j) => {
              const [org, ...town] = j.place.split(",");
              return (
                <div key={j.title + j.place} className="grid grid-cols-[1fr_auto] gap-x-6">
                  <p className="text-[14px] text-slate-900">
                    <span className="font-semibold">{j.title}</span>
                    {org && <span className="italic">, {org.trim()}</span>}
                  </p>
                  <div className="row-span-2 text-right text-[12.5px] text-slate-700">
                    <p>{j.date}</p>
                    {town.length > 0 && <p>{town.join(",").trim()}</p>}
                  </div>
                  <Bullets items={j.bullets} className="mt-1" />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {doc.education.length > 0 && (
        <section>
          {heading("Education")}
          <div className="mt-3 space-y-3">
            {doc.education.map((e) => (
              <div key={e.degree} className="grid grid-cols-[1fr_auto] gap-x-6">
                <p className="text-[14px] text-slate-900">
                  <span className="font-semibold">{e.degree}</span>
                  {e.school && <span className="italic">, {e.school}</span>}
                </p>
                <p className="text-right text-[12.5px]">{e.date}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {(doc.projects?.length ?? 0) > 0 && (
        <section>
          {heading("Projects")}
          <div className="mt-3 space-y-2">
            {doc.projects!.map((p) => (
              <p key={p.name}>
                <span className="font-semibold text-slate-900">{p.name}</span>, {p.detail}
              </p>
            ))}
          </div>
        </section>
      )}

      {skills.length > 0 && (
        <section>
          {heading("Skills")}
          <ul className="mt-3 grid grid-cols-2 gap-x-10 gap-y-2">
            {skills.map((s) => (
              <li key={s} className="flex items-center gap-2.5 text-[13.5px] text-slate-800">
                <span className="size-2 shrink-0 rounded-full" style={{ background: A(accent) }} />
                {s}
              </li>
            ))}
          </ul>
        </section>
      )}

      {extraLists(doc).map((l) => (
        <section key={l.title}>
          {heading(l.title)}
          <ul className="mt-3 grid grid-cols-3 gap-x-6 gap-y-1.5">
            {l.items.map((s) => (
              <li key={s} className="flex items-start gap-2">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-slate-800" />
                {s}
              </li>
            ))}
          </ul>
        </section>
      ))}

      {(doc.references?.length ?? 0) > 0 && (
        <section>
          {heading("References")}
          <div className="mt-3 grid grid-cols-2 gap-6">
            {doc.references!.map((r) => (
              <div key={r.name}>
                <p className="font-semibold text-slate-900">{r.name}</p>
                <p>{r.role}</p>
                <p className="text-[12px]">
                  <span className="font-semibold">Phone:</span> {r.phone}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function makeTemplate(v: Variant) {
  return function SingleCv(props: TemplateProps) {
    return (
      <div className={`flex h-full flex-col text-slate-700 ${v.page}`}>
        {v.header({ ...props, accent: v.accent })}
        <div className="flex-1">
          <Body doc={props.doc} accent={v.accent} heading={(t) => v.heading(t, v.accent)} />
        </div>
      </div>
    );
  };
}

/* ---------------- Sage: white header, tinted green body ---------------- */
export const SageCv = makeTemplate({
  accent: "#6b8f71",
  page: "bg-[color-mix(in_srgb,var(--cv-accent,#6b8f71)_14%,white)]",
  header: ({ doc, role, photo, accent }) => (
    <header className="flex items-center justify-between gap-8 bg-white px-12 py-10">
      <div className="min-w-0">
        <p className="text-[40px] font-bold leading-tight" style={{ color: A(accent) }}>
          {doc.name}
        </p>
        <p className="text-[24px] italic" style={{ color: A(accent) }}>
          {role}
        </p>
        <Contacts doc={doc} className="mt-4 text-slate-800" iconClass="text-[color:var(--cv-accent,#6b8f71)]" />
      </div>
      <Photo src={photo} size={150} />
    </header>
  ),
  heading: (t, accent) => (
    <h3
      className="inline-block border-b-4 pb-1 text-[19px] font-medium uppercase tracking-[0.12em]"
      style={{ color: A(accent), borderColor: A(accent) }}
    >
      {t}
    </h3>
  ),
});

/* ---------------- Soft Bars: light header, tinted heading bars ---------------- */
export const SoftBarsCv = makeTemplate({
  accent: "#2c3e66",
  page: "bg-white",
  header: ({ doc, role, photo, accent }) => (
    <header
      className="flex items-center gap-10 px-12 py-10"
      style={{ background: "color-mix(in srgb, var(--cv-accent, #2c3e66) 16%, white)" }}
    >
      <Photo src={photo} size={150} />
      <div className="min-w-0">
        <p className="text-[38px] font-bold leading-tight" style={{ color: A(accent) }}>
          {doc.name}
        </p>
        <p className="text-[22px]" style={{ color: A(accent) }}>
          {role}
        </p>
        <Contacts doc={doc} className="mt-3" iconClass="text-[color:var(--cv-accent,#2c3e66)]" />
      </div>
    </header>
  ),
  heading: (t, accent) => (
    <h3
      className="rounded-sm py-1.5 text-center text-[18px] font-bold uppercase"
      style={{ color: A(accent), background: "color-mix(in srgb, var(--cv-accent, #2c3e66) 16%, white)" }}
    >
      {t}
    </h3>
  ),
});

/* ---------------- Teal Header: dark band, grey heading bars ---------------- */
export const TealHeaderCv = makeTemplate({
  accent: "#235b6e",
  page: "bg-white",
  header: ({ doc, role, photo, accent }) => (
    <header className="flex items-center justify-between gap-8 px-12 py-10 text-white" style={{ background: A(accent) }}>
      <div className="min-w-0">
        <p className="text-[32px] font-bold leading-tight">
          {doc.name} <span className="ml-2 text-[22px] font-normal text-white/90">{role}</span>
        </p>
        <Contacts doc={doc} className="mt-5 text-white/95" iconClass="text-white" />
      </div>
      <Photo src={photo} size={150} className="ring-4 ring-white/30" />
    </header>
  ),
  heading: (t) => (
    <h3 className="rounded-sm bg-slate-200/80 py-1.5 text-center text-[17px] font-bold uppercase tracking-wide text-slate-900">
      {t}
    </h3>
  ),
});

/* ---------------- Clean Rule: minimal, thick black rules ---------------- */
export const CleanRuleCv = makeTemplate({
  accent: "#111827",
  page: "bg-white",
  header: ({ doc, role, photo }) => (
    <header className="flex items-center gap-10 px-12 pb-4 pt-10">
      <Photo src={photo} size={140} />
      <div className="min-w-0">
        <p className="text-[34px] font-bold leading-tight text-slate-950">
          {doc.name} <span className="ml-2 text-[22px] font-normal text-slate-700">{role}</span>
        </p>
        <Contacts doc={doc} className="mt-3 text-slate-900" iconClass="text-slate-950" />
      </div>
    </header>
  ),
  heading: (t, accent) => (
    <h3 className="border-b-[3px] pb-0.5 text-[20px] font-bold text-slate-950" style={{ borderColor: A(accent) }}>
      {t}
    </h3>
  ),
});

/* ---------------- Grey Header: light grey band, ruled caps headings ---------------- */
export const GreyHeaderCv = makeTemplate({
  accent: "#111827",
  page: "bg-white",
  header: ({ doc, role, photo }) => (
    <header className="flex items-center gap-10 bg-slate-200/70 px-12 py-9">
      <Photo src={photo} size={140} />
      <div className="min-w-0">
        <p className="text-[38px] font-bold leading-tight text-slate-950">{doc.name}</p>
        <p className="text-[22px] text-slate-700">{role}</p>
        <Contacts doc={doc} className="mt-3 text-slate-900" iconClass="text-slate-950" />
      </div>
    </header>
  ),
  heading: (t, accent) => (
    <h3
      className="border-b-2 pb-1 text-[19px] font-semibold uppercase tracking-wide"
      style={{ color: A(accent), borderColor: "color-mix(in srgb, var(--cv-accent, #111827) 18%, white)" }}
    >
      {t}
    </h3>
  ),
});

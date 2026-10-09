import Image from "next/image";
import type { ReactNode } from "react";
import type { CvDoc, CvExample, CvJob } from "@/lib/cv-examples";
import { AtsCv } from "./ats-cv";

/** Renders a course example in its assigned template design. */
export function CvTemplate({ example }: { example: CvExample }) {
  const props = { doc: example.cv, role: example.role, photo: example.photo };
  switch (example.template) {
    case "elegant":
      return <ElegantCv {...props} />;
    case "band":
      return <BandCv {...props} />;
    case "timeline":
      return <TimelineCv {...props} />;
    case "photo":
      return <PhotoCv {...props} />;
    default:
      return <AtsCv doc={example.cv} role={example.role} />;
  }
}

type TemplateProps = { doc: CvDoc; role: string; photo?: string };

/* ------------------------------------------------------------------ */
/* Shared helpers                                                      */
/* ------------------------------------------------------------------ */

type ContactKind = "phone" | "email" | "link" | "location";

function contactKind(value: string): ContactKind {
  if (value.includes("@")) return "email";
  if (/\.(com|net|org)\//.test(value)) return "link";
  if (/^\+?[\d\s]+$/.test(value)) return "phone";
  return "location";
}

const contactPaths: Record<ContactKind, string> = {
  phone: "M5 4h4l2 5-3 2a11 11 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2",
  email: "M3 6h18v12H3zM3 6l9 7 9-7",
  link: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1",
  location: "M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11zM12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4",
};

function ContactIcon({ kind, className = "" }: { kind: ContactKind; className?: string }) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
    >
      <path d={contactPaths[kind]} />
    </svg>
  );
}

/** "Clinical: vital signs, wound dressing" -> { label: "Clinical", items: [...] } */
function skillGroups(skills: string[]) {
  return skills.map((line) => {
    const [label, rest] = line.includes(": ") ? line.split(/: (.+)/) : ["", line];
    const items = rest
      .split(/,\s*/)
      .filter(Boolean)
      .map((item) => item.charAt(0).toUpperCase() + item.slice(1));
    return { label, items };
  });
}

function Bullets({ items, className = "" }: { items: string[]; className?: string }) {
  return (
    <ul className={`list-disc space-y-0.5 pl-5 ${className}`}>
      {items.map((b) => (
        <li key={b}>{b}</li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Elegant Line: thin centered name, gold rule, divided columns        */
/* ------------------------------------------------------------------ */

function ElegantCv({ doc, role }: TemplateProps) {
  const [first, ...rest] = doc.name.split(" ");
  return (
    <div className="bg-[#fbfaf8] px-6 py-10 text-[12.5px] leading-relaxed text-slate-600 sm:px-10">
      <header className="text-center">
        <p className="text-[28px] font-light uppercase tracking-[0.3em] text-slate-900 sm:text-[34px]">
          {first} <span className="font-normal">{rest.join(" ")}</span>
        </p>
        <p className="mt-2 text-[11px] uppercase tracking-[0.35em] text-slate-500">{role}</p>
      </header>
      <div className="mt-7 h-[3px] bg-[#b59a72]" />

      <div className="mt-7 grid gap-7 sm:grid-cols-[34%_1fr] sm:gap-0">
        <aside className="space-y-7 sm:border-r sm:border-slate-300 sm:pr-6">
          <div className="space-y-2.5">
            {doc.contact.map((c) => (
              <p key={c} className="flex items-center gap-3 break-words text-[11.5px]">
                <ContactIcon kind={contactKind(c)} className="text-slate-800" />
                {c}
              </p>
            ))}
          </div>
          <ElegantHeading>Education</ElegantHeading>
          {doc.education.map((e) => (
            <div key={e.degree} className="-mt-4 text-[11.5px]">
              <p className="font-semibold text-slate-800">{e.school}</p>
              <p>{e.degree}</p>
              <p>{e.date}</p>
            </div>
          ))}
          <ElegantHeading>Skills</ElegantHeading>
          <ul className="-mt-4 space-y-1.5 text-[11.5px]">
            {skillGroups(doc.skills).flatMap((g) => g.items).map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </aside>

        <main className="space-y-7 sm:pl-7">
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
    <div className="bg-linear-to-b from-white to-[#f1f1f1] text-[12.5px] leading-relaxed text-slate-600">
      <header className="flex flex-wrap items-end justify-between gap-4 px-6 pt-10 pb-8 sm:px-10">
        <p className="font-serif text-[30px] font-light uppercase leading-tight tracking-[0.18em] text-slate-800 sm:text-[38px]">
          {first}
          <br />
          {rest.join(" ")}
        </p>
        <p className="pb-2 text-[11px] uppercase tracking-[0.45em] text-slate-600">{role}</p>
      </header>

      <div className="grid gap-6 bg-[#e8e8e8] px-6 py-7 sm:grid-cols-[34%_1fr] sm:gap-0 sm:px-10">
        <div className="sm:border-r sm:border-slate-300 sm:pr-6">
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
        <div className="sm:pl-7">
          <BandHeading>Summary</BandHeading>
          <p className="mt-3 text-justify">{doc.summary}</p>
        </div>
      </div>

      <div className="grid gap-7 px-6 py-8 sm:grid-cols-[34%_1fr] sm:gap-0 sm:px-10">
        <aside className="space-y-6 sm:border-r sm:border-slate-300 sm:pr-6">
          {groups.map((g, i) => (
            <div key={g.label || i}>
              <BandHeading>{g.label || "Skills"}</BandHeading>
              <ul className="mt-3 space-y-1.5 text-[11.5px]">
                {g.items.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          ))}
        </aside>
        <main className="space-y-6 sm:pl-7">
          <div>
            <BandHeading>Education</BandHeading>
            {doc.education.map((e) => (
              <div key={e.degree} className="mt-3">
                <p className="font-semibold uppercase text-slate-800">{e.school}</p>
                <p>{e.degree}</p>
                <p>Graduation: {e.date.split("–").pop()?.trim()}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-300 pt-5">
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
        </main>
      </div>
    </div>
  );
}

function BandHeading({ children }: { children: ReactNode }) {
  return <h3 className="text-[11.5px] uppercase tracking-[0.4em] text-slate-700">{children}</h3>;
}

/* ------------------------------------------------------------------ */
/* Bold Timeline: heavy name, bold ruled headings, timeline dots       */
/* ------------------------------------------------------------------ */

function TimelineCv({ doc, role }: TemplateProps) {
  return (
    <div className="bg-white px-6 py-10 text-[12.5px] leading-relaxed text-slate-600 sm:px-10">
      <header>
        <p className="text-[34px] font-black uppercase leading-none tracking-tight text-slate-950 sm:text-[42px]">
          {doc.name}
        </p>
        <p className="mt-2 text-[17px] uppercase text-slate-800 sm:text-[19px]">{role}</p>
      </header>

      <div className="mt-9 grid gap-8 sm:grid-cols-[35%_1fr]">
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
        </aside>

        <main className="space-y-8">
          <div>
            <BoldHeading rule>Profile</BoldHeading>
            <p className="mt-3 text-justify">{doc.summary}</p>
          </div>
          <div>
            <BoldHeading rule>Work Experience</BoldHeading>
            <ol className="relative mt-4 space-y-6 border-l-2 border-slate-700 pl-6">
              {doc.experience.map((j) => (
                <TimelineItem key={j.title + j.place} job={j} />
              ))}
            </ol>
          </div>
        </main>
      </div>
    </div>
  );
}

function TimelineItem({ job }: { job: CvJob }) {
  return (
    <li className="relative">
      <span className="absolute -left-[31px] top-1.5 size-2.5 rounded-full bg-slate-800" />
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
      className={`text-[17px] font-extrabold uppercase tracking-[0.12em] text-slate-950 ${
        rule ? "border-b-2 border-slate-800 pb-1" : ""
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
    <div className="bg-white px-6 py-10 text-[12.5px] leading-relaxed text-slate-600 sm:px-10">
      <header className="flex items-start justify-between gap-5">
        <div>
          <p className="text-[30px] font-light uppercase leading-none text-slate-500 sm:text-[38px]">
            {parts.join(" ")}
          </p>
          <p className="text-[34px] font-extrabold uppercase leading-tight text-slate-950 sm:text-[44px]">
            {last}
          </p>
          <p className="mt-1 text-[13px] font-bold uppercase tracking-wide text-slate-500">{role}</p>
        </div>
        {photo && (
          <Image
            src={photo}
            alt=""
            width={120}
            height={120}
            className="size-20 shrink-0 rounded-full object-cover sm:size-28"
          />
        )}
      </header>

      <div className="mt-9 grid gap-8 sm:grid-cols-[38%_1fr]">
        <aside className="space-y-8">
          <div>
            <PhotoHeading>Contact</PhotoHeading>
            <div className="mt-4 space-y-3">
              {doc.contact.map((c) => (
                <p key={c} className="flex items-center gap-3 break-words text-[12px]">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full border-2 border-slate-800">
                    <ContactIcon kind={contactKind(c)} className="text-slate-900" />
                  </span>
                  {c}
                </p>
              ))}
            </div>
          </div>
          {skillGroups(doc.skills).map((g, i) => (
            <div key={g.label || i}>
              <PhotoHeading>{g.label || "Skills"}</PhotoHeading>
              <ul className="mt-4 space-y-2">
                {g.items.map((s) => (
                  <li key={s} className="flex items-center gap-3">
                    <span className="size-2 shrink-0 rounded-full border-2 border-slate-600" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <PhotoHeading>Education</PhotoHeading>
            {doc.education.map((e) => (
              <div key={e.degree} className="mt-4">
                <p className="font-semibold text-slate-800">{e.degree}</p>
                <p>{e.school}</p>
                <p className="text-slate-500">{e.date}</p>
              </div>
            ))}
          </div>
        </aside>

        <main className="space-y-8">
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
        </main>
      </div>
    </div>
  );
}

function PhotoHeading({ children }: { children: ReactNode }) {
  return <h3 className="text-[17px] font-bold uppercase text-slate-950">{children}</h3>;
}

/* Small building blocks shared by every CV template. */
import type { CvDoc } from "@/lib/cv-examples";

export type ContactKind = "phone" | "email" | "link" | "location";

export function contactKind(value: string): ContactKind {
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

export function ContactIcon({ kind, className = "" }: { kind: ContactKind; className?: string }) {
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
export function skillGroups(skills: string[]) {
  const unlabeled = skills.filter((line) => !line.includes(": ")).length;
  let seen = 0;
  return skills.map((line) => {
    const [given, rest] = line.includes(": ") ? line.split(/: (.+)/) : ["", line];
    let label = given;
    if (!label) {
      // Name unlabelled groups so two of them never share the same heading
      label = unlabeled > 1 ? (seen === 0 ? "Technical" : "Professional") : "";
      seen++;
    }
    const items = rest
      .split(/,s*/)
      .filter(Boolean)
      .map((item) => item.charAt(0).toUpperCase() + item.slice(1));
    return { label, items };
  });
}

export function Bullets({ items, className = "" }: { items: string[]; className?: string }) {
  return (
    <ul className={`list-disc space-y-0.5 pl-5 ${className}`}>
      {items.map((b) => (
        <li key={b}>{b}</li>
      ))}
    </ul>
  );
}


/** Short list sections (languages, certifications, awards, interests) that exist on this CV. */
export function extraLists(doc: CvDoc, skip: string[] = []) {
  return [
    { title: "Languages", items: doc.languages ?? [] },
    { title: "Certifications", items: doc.certifications ?? [] },
    { title: "Awards", items: doc.awards ?? [] },
    { title: "Interests", items: doc.interests ?? [] },
  ].filter((s) => s.items.length > 0 && !skip.includes(s.title));
}

export function ProjectsList({ projects, className = "" }: { projects: CvDoc["projects"]; className?: string }) {
  if (!projects?.length) return null;
  return (
    <ul className={`space-y-1.5 ${className}`}>
      {projects.map((p) => (
        <li key={p.name}>
          <span className="font-semibold text-slate-800">{p.name}:</span> {p.detail}
        </li>
      ))}
    </ul>
  );
}

export function ReferencesGrid({
  refs,
  nameClass = "font-semibold text-slate-800",
}: {
  refs: CvDoc["references"];
  nameClass?: string;
}) {
  if (!refs?.length) return null;
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {refs.map((r) => (
        <div key={r.name}>
          <p className={nameClass}>{r.name}</p>
          <p>{r.role}</p>
          <p className="text-[11px]">
            <span className="font-semibold">Phone:</span> {r.phone}
          </p>
        </div>
      ))}
    </div>
  );
}

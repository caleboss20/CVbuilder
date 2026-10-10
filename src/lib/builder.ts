import type { CvDoc, CvExample, CvTemplateName } from "./cv-examples";

export const BUILDER_STORAGE_KEY = "cv11-builder-v1";

export type Job = { id: string; title: string; place: string; date: string; bullets: string[] };
export type School = { id: string; degree: string; school: string; date: string };
export type Project = { id: string; name: string; detail: string };
export type SkillGroup = { id: string; label: string; items: string };
export type Referee = { id: string; name: string; role: string; phone: string };

/** Everything the student edits. Converted to a CvDoc for the templates. */
export type BuilderCv = {
  template: CvTemplateName;
  accent: string | null;
  photo?: string;
  name: string;
  role: string;
  location: string;
  phone: string;
  email: string;
  links: string[];
  summary: string;
  education: School[];
  experience: Job[];
  projects: Project[];
  skills: SkillGroup[];
  languages: string[];
  certifications: string[];
  awards: string[];
  interests: string[];
  references: Referee[];
};

/** Short random id. Works on plain http too, where crypto.randomUUID is missing. */
export const uid = () => Math.random().toString(36).slice(2, 10);

export const emptyJob = (): Job => ({ id: uid(), title: "", place: "", date: "", bullets: [""] });
export const emptySchool = (): School => ({ id: uid(), degree: "", school: "", date: "" });
export const emptyProject = (): Project => ({ id: uid(), name: "", detail: "" });
export const emptySkillGroup = (): SkillGroup => ({ id: uid(), label: "", items: "" });
export const emptyReferee = (): Referee => ({ id: uid(), name: "", role: "", phone: "" });

export function blankCv(template: CvTemplateName = "ats"): BuilderCv {
  return {
    template,
    accent: null,
    name: "",
    role: "",
    location: "",
    phone: "",
    email: "",
    links: [],
    summary: "",
    education: [emptySchool()],
    experience: [emptyJob()],
    projects: [],
    skills: [emptySkillGroup()],
    languages: [],
    certifications: [],
    awards: [],
    interests: [],
    references: [],
  };
}

/** Starts a CV from one of the course examples. */
export function cvFromExample(e: CvExample, template?: CvTemplateName): BuilderCv {
  const contact = e.cv.contact;
  const email = contact.find((c) => c.includes("@")) ?? "";
  const phone = contact.find((c) => /^\+?[\d\s]+$/.test(c)) ?? "";
  const links = contact.filter((c) => /\.(com|net|org)\//.test(c));
  const location = contact.find((c) => c !== email && c !== phone && !links.includes(c)) ?? "";
  return {
    template: template ?? e.template,
    accent: null,
    photo: e.photo,
    name: e.cv.name,
    role: e.role,
    location,
    phone,
    email,
    links,
    summary: e.cv.summary,
    education: e.cv.education.map((x) => ({ id: uid(), degree: x.degree, school: x.school, date: x.date })),
    experience: e.cv.experience.map((x) => ({ id: uid(), ...x, bullets: [...x.bullets] })),
    projects: (e.cv.projects ?? []).map((x) => ({ id: uid(), ...x })),
    skills: e.cv.skills.map((line) => {
      const [label, items] = line.includes(": ") ? line.split(/: (.+)/) : ["", line];
      return { id: uid(), label, items };
    }),
    languages: [...(e.cv.languages ?? [])],
    certifications: [...(e.cv.certifications ?? [])],
    awards: [...(e.cv.awards ?? [])],
    interests: [...(e.cv.interests ?? [])],
    references: (e.cv.references ?? []).map((x) => ({ id: uid(), ...x })),
  };
}

const clean = (s: string) => s.trim();
const nonEmpty = (list: string[]) => list.map(clean).filter(Boolean);

/** Converts the editor state into the document the templates render. */
export function toDoc(cv: BuilderCv): CvDoc {
  return {
    name: clean(cv.name) || "Your Name",
    contact: nonEmpty([cv.location, cv.phone, cv.email, ...cv.links]),
    summary: clean(cv.summary),
    education: cv.education
      .filter((x) => x.degree.trim() || x.school.trim())
      .map((x) => ({ degree: clean(x.degree), school: clean(x.school), date: clean(x.date) })),
    experience: cv.experience
      .filter((x) => x.title.trim() || x.place.trim())
      .map((x) => ({ title: clean(x.title), place: clean(x.place), date: clean(x.date), bullets: nonEmpty(x.bullets) })),
    skills: cv.skills
      .filter((g) => g.items.trim())
      .map((g) => (g.label.trim() ? `${clean(g.label)}: ${clean(g.items)}` : clean(g.items))),
    languages: nonEmpty(cv.languages),
    certifications: nonEmpty(cv.certifications),
    projects: cv.projects.filter((p) => p.name.trim()).map((p) => ({ name: clean(p.name), detail: clean(p.detail) })),
    awards: nonEmpty(cv.awards),
    interests: nonEmpty(cv.interests),
    references: cv.references
      .filter((r) => r.name.trim())
      .map((r) => ({ name: clean(r.name), role: clean(r.role), phone: clean(r.phone) })),
  };
}

export type StrengthCheck = { label: string; done: boolean; step: string };

/** A simple, honest CV score with the next things to fix. */
export function cvStrength(cv: BuilderCv): { score: number; checks: StrengthCheck[] } {
  const doc = toDoc(cv);
  const words = doc.summary.split(/\s+/).filter(Boolean).length;
  const checks: StrengthCheck[] = [
    { label: "Add your full name and the role you want", done: !!cv.name.trim() && !!cv.role.trim(), step: "personal" },
    { label: "Add a phone number and email", done: !!cv.phone.trim() && !!cv.email.trim(), step: "personal" },
    { label: "Write a summary of 25 to 60 words", done: words >= 25 && words <= 60, step: "summary" },
    { label: "Add your degree or school", done: doc.education.length > 0, step: "education" },
    { label: "Add at least one experience, internship or role", done: doc.experience.length > 0, step: "experience" },
    {
      label: "Give each experience 2 or more bullet points",
      done: doc.experience.length > 0 && doc.experience.every((j) => j.bullets.length >= 2),
      step: "experience",
    },
    {
      label: "Use a number in at least one bullet (e.g. 30 students)",
      done: doc.experience.some((j) => j.bullets.some((b) => /\d/.test(b))),
      step: "experience",
    },
    { label: "Add a project", done: (doc.projects?.length ?? 0) > 0, step: "projects" },
    { label: "List at least 5 skills", done: doc.skills.join(",").split(",").filter((s) => s.trim()).length >= 5, step: "skills" },
    { label: "Add the languages you speak", done: (doc.languages?.length ?? 0) > 0, step: "extras" },
  ];
  const score = Math.round((checks.filter((c) => c.done).length / checks.length) * 100);
  return { score, checks };
}

/** Strong action verbs students can start bullets with. */
export const actionVerbs = [
  "Led",
  "Organised",
  "Built",
  "Designed",
  "Improved",
  "Managed",
  "Supported",
  "Created",
  "Trained",
  "Analysed",
  "Coordinated",
  "Presented",
];

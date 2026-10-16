import type { BuilderCv } from "./builder";
import { refineText } from "./refine";
import { lowerWords } from "./summary-starter";

/*
 * Letter writer. One tool, several letters a student needs around an application:
 * the applications themselves (job, internship, national service, scholarship,
 * university programme) and the short letters that go with them (asking a lecturer
 * to be a referee, thanking an interviewer, following up). Every draft is built from
 * the student's CV with plain templates, no AI, and the student edits every word.
 */

export type LetterKind = "job" | "internship" | "service" | "scholarship" | "admission" | "reference" | "thanks" | "followup";

export type LetterInput = {
  kind: LetterKind;
  /** The organisation, institution or person's place: company, school, scholarship provider. */
  company: string;
  /** The role, programme or scholarship being applied for. */
  role: string;
  /** Who the letter goes to, if the student knows. */
  manager: string;
  /** One extra detail in the student's own words: why this one, how they know you, what you discussed. */
  why: string;
};

/** What each field means for a given kind of letter, so the form asks the right question. */
type FieldText = { label: string; placeholder: string };

export type LetterKindConfig = {
  id: LetterKind;
  label: string;
  /** Plain words on what choosing this does to the letter. */
  changes: string;
  company: FieldText;
  role: FieldText;
  manager: FieldText & { hint: string };
  why: FieldText;
  /** "Dear ___" when no name is given, and the first address line. */
  recipient: string;
  /** What the letter is about, in capitals under the address: "APPLICATION FOR ...". */
  subject: (role: string) => string;
};

/** The letters, in the order students see them. */
export const letterKinds: LetterKindConfig[] = [
  {
    id: "job",
    label: "Job",
    changes: "Presents you as ready to contribute from day one, and asks for a chance to discuss the role.",
    company: { label: "Company or organisation", placeholder: "GCB Bank" },
    role: { label: "Role", placeholder: "Customer Service Officer" },
    manager: { label: "Hiring manager (optional)", placeholder: "Mrs. Akosua Mensah", hint: "Leave empty to use “Dear Hiring Manager”." },
    why: { label: "Why this job? (optional)", placeholder: "" },
    recipient: "Hiring Manager",
    subject: (r) => `APPLICATION FOR ${r || "THE ADVERTISED ROLE"}`,
  },
  {
    id: "internship",
    label: "Internship",
    changes: "Says you are eager to learn while contributing, and uses “internship” in the first line.",
    company: { label: "Company or organisation", placeholder: "GCB Bank" },
    role: { label: "Internship", placeholder: "Customer Service Intern" },
    manager: { label: "Hiring manager (optional)", placeholder: "Mrs. Akosua Mensah", hint: "Leave empty to use “Dear Hiring Manager”." },
    why: { label: "Why this internship? (optional)", placeholder: "" },
    recipient: "Hiring Manager",
    subject: (r) => `APPLICATION FOR ${r || "THE ADVERTISED INTERNSHIP"}`,
  },
  {
    id: "service",
    label: "National service",
    changes: "Asks for a national service placement and says you are ready to serve and learn how the organisation works.",
    company: { label: "Organisation", placeholder: "Ghana Health Service" },
    role: { label: "Placement or unit (optional)", placeholder: "Finance Unit" },
    manager: { label: "Contact person (optional)", placeholder: "Mr. Kojo Mensah", hint: "Leave empty to use “Dear Hiring Manager”." },
    why: { label: "Why this organisation? (optional)", placeholder: "" },
    recipient: "Hiring Manager",
    subject: (r) => `APPLICATION FOR NATIONAL SERVICE${r ? `: ${r}` : ""}`,
  },
  {
    id: "scholarship",
    label: "Scholarship",
    changes: "Leads with your studies and results, says what the support would let you do, and thanks the committee.",
    company: { label: "Scholarship provider", placeholder: "Ghana Scholarships Secretariat" },
    role: { label: "Scholarship name", placeholder: "Mastercard Foundation Scholarship" },
    manager: { label: "Committee or contact (optional)", placeholder: "The Selection Committee", hint: "Leave empty to use “Dear Scholarship Committee”." },
    why: { label: "What would this scholarship let you do? (optional)", placeholder: "" },
    recipient: "Scholarship Committee",
    subject: (r) => `APPLICATION FOR ${r || "THE SCHOLARSHIP"}`,
  },
  {
    id: "admission",
    label: "University or programme",
    changes: "Explains why you want the programme, what you have already done in the field, and what you hope to achieve.",
    company: { label: "University or institution", placeholder: "University of Ghana" },
    role: { label: "Programme", placeholder: "MPhil Economics" },
    manager: { label: "Admissions contact (optional)", placeholder: "The Admissions Officer", hint: "Leave empty to use “Dear Admissions Officer”." },
    why: { label: "Why this programme? (optional)", placeholder: "" },
    recipient: "Admissions Officer",
    subject: (r) => `APPLICATION FOR ADMISSION${r ? `: ${r}` : ""}`,
  },
  {
    id: "reference",
    label: "Ask for a reference",
    changes: "A polite request to a lecturer or supervisor to be your referee, with your CV attached and an easy way to say no.",
    company: { label: "Their institution (optional)", placeholder: "KNUST" },
    role: { label: "What you are applying for", placeholder: "a graduate trainee role at Ecobank" },
    manager: { label: "Their name and title", placeholder: "Dr. Kwame Owusu", hint: "Leave empty to use “Dear Sir or Madam”." },
    why: { label: "How do they know you? (optional)", placeholder: "" },
    recipient: "Sir or Madam",
    subject: () => "REQUEST FOR A REFERENCE",
  },
  {
    id: "thanks",
    label: "Thank-you after an interview",
    changes: "A short note that thanks the interviewer, mentions something you enjoyed discussing, and repeats your interest.",
    company: { label: "Company or organisation", placeholder: "GCB Bank" },
    role: { label: "Role you interviewed for", placeholder: "Customer Service Officer" },
    manager: { label: "Interviewer (optional)", placeholder: "Mrs. Akosua Mensah", hint: "Leave empty to use “Dear Hiring Manager”." },
    why: { label: "Something you enjoyed discussing (optional)", placeholder: "" },
    recipient: "Hiring Manager",
    subject: () => "THANK YOU FOR THE INTERVIEW",
  },
  {
    id: "followup",
    label: "Follow up on an application",
    changes: "A short, polite message that checks on your application and says you are still interested.",
    company: { label: "Company or organisation", placeholder: "GCB Bank" },
    role: { label: "Role you applied for", placeholder: "Customer Service Officer" },
    manager: { label: "Contact person (optional)", placeholder: "Mrs. Akosua Mensah", hint: "Leave empty to use “Dear Hiring Manager”." },
    why: { label: "When did you apply? (optional)", placeholder: "" },
    recipient: "Hiring Manager",
    subject: (r) => `FOLLOW-UP ON MY APPLICATION${r ? ` FOR ${r}` : ""}`,
  },
];

export const kindConfig = (kind: LetterKind) => letterKinds.find((k) => k.id === kind) ?? letterKinds[0];

/* ------------------------------------------------------------------ */
/* Pieces shared by every letter                                       */
/* ------------------------------------------------------------------ */

const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
const noDot = (s: string) => s.trim().replace(/[.!?]+$/, "");
const firstPart = (s: string) => s.split(",")[0].trim();

/** What the CV tells us about the student, ready to drop into sentences. */
function profile(cv: BuilderCv) {
  const school = cv.education.find((e) => e.school.trim());
  const who = lowerWords(cv.role.trim() || "student");
  const article = /^[aeiou]/i.test(who) ? "an" : "a";
  const introduction = `I am ${article} ${who}${school ? ` at ${firstPart(school.school)}` : ""}`;

  const job = cv.experience.find((j) => j.title.trim() && j.bullets.some((b) => b.trim()));
  const bullets = job ? job.bullets.map((b) => noDot(b)).filter(Boolean) : [];
  const experience = job
    ? `In my role as ${job.title.trim()}${job.place.trim() ? ` at ${firstPart(job.place)}` : ""}, I ${lower(bullets[0])}.${
        bullets[1] ? ` I also ${lower(bullets[1])}.` : ""
      } This taught me to work carefully, take responsibility and deliver results.`
    : "";

  const skills = cv.skills
    .flatMap((g) => g.items.split(","))
    .map((s) => s.trim())
    .filter(Boolean)
    // Lower-case ordinary words mid-sentence, keep names like Excel or SQL
    .map((s) => (/^[A-Z][a-z]+(\s[a-z]+)+$/.test(s) ? lower(s) : s))
    .slice(0, 4);
  const skillText = skills.length
    ? `I bring skills in ${skills.slice(0, -1).join(", ")}${skills.length > 1 ? " and " : ""}${skills.at(-1)}.`
    : "";

  const project = cv.projects.find((p) => p.name.trim() && p.detail.trim());
  const projectText = project ? ` Through my ${project.name.trim()} project, I ${lower(noDot(project.detail))}.` : "";

  const degree = cv.education.find((e) => e.degree.trim())?.degree.trim() ?? "";
  const award = cv.awards.find((a) => a.trim())?.trim() ?? "";

  return { introduction, experience, skillText, projectText, degree, award, school: school ? firstPart(school.school) : "" };
}

/** The student's own extra detail, tidied into a sentence. */
const tidy = (why: string) => (why.trim() ? refineText(why, "summary")[0] : "");

/* ------------------------------------------------------------------ */
/* The drafts                                                          */
/* ------------------------------------------------------------------ */

/** How the first paragraph ends for the three job-style applications. */
const introEnding: Record<"job" | "internship" | "service", string> = {
  job: "and I believe I can make a real contribution to your team.",
  internship: "and I am eager to learn from your team while contributing where I can.",
  service: "and I am ready to serve with commitment and to learn how your organisation works.",
};

/** The last paragraph's opening line for the job-style applications. */
function closing(kind: "job" | "internship" | "service", company: string): string {
  if (kind === "service") return `I would be grateful for the opportunity to do my national service with ${company}.`;
  if (kind === "internship") return `I would welcome the chance to learn at ${company} and to show what I can do in an interview.`;
  return `I would welcome the opportunity to discuss how I can contribute to ${company}.`;
}

/** Job, internship and national service. */
function jobStyle(cv: BuilderCv, input: LetterInput, kind: "job" | "internship" | "service"): string[] {
  const p = profile(cv);
  const company = input.company.trim() || "your organisation";
  const role = input.role.trim();
  // With no role typed we use wording that still reads naturally, never an empty or doubled "the"
  const what = !role
    ? kind === "service"
      ? "a national service placement"
      : kind === "internship"
        ? "the advertised internship"
        : "the advertised position"
    : kind === "internship"
      ? /intern/i.test(role)
        ? `the ${role} position`
        : `the ${role} internship`
      : kind === "service"
        ? `a national service placement in ${role}`
        : `the ${role} position`;

  const intro = `I am writing to apply for ${what} at ${company}. ${p.introduction}, ${introEnding[kind]}`;
  const why = tidy(input.why);
  return [
    why ? `${intro} ${why}` : intro,
    p.experience,
    (p.skillText + p.projectText).trim(),
    `${closing(kind, company)} Thank you for considering my application. I look forward to hearing from you.`,
  ].filter(Boolean);
}

function scholarship(cv: BuilderCv, input: LetterInput): string[] {
  const p = profile(cv);
  const provider = input.company.trim() || "your organisation";
  const typed = input.role.trim();
  const name = !typed ? "the scholarship" : /^the\s/i.test(typed) ? typed : `the ${typed}`;
  const study = p.degree ? `I am studying ${p.degree}${p.school ? ` at ${p.school}` : ""}` : p.introduction;
  const results = p.award ? ` I have been recognised with ${p.award}, and I work hard to keep improving.` : " I work hard to keep improving and I take my studies seriously.";
  const use = tidy(input.why) || "This support would let me focus on my studies and use what I learn to contribute to my community.";
  return [
    `I am writing to apply for ${name} offered by ${provider}. ${study}, and I would be honoured to be considered.${results}`,
    (p.skillText + p.projectText).trim(),
    use,
    "Thank you for considering my application. I have attached my CV, and I would be glad to provide any further information you need.",
  ].filter(Boolean);
}

function admission(cv: BuilderCv, input: LetterInput): string[] {
  const p = profile(cv);
  const institution = input.company.trim() || "your institution";
  const programme = input.role.trim() ? `the ${input.role.trim()} programme` : "your programme";
  const base = p.degree ? `I have a background in ${p.degree}${p.school ? ` from ${p.school}` : ""}.` : `${p.introduction}.`;
  const interest = tidy(input.why) || "I want to deepen my knowledge in this field and use it to do useful work.";
  return [
    `I am writing to apply for admission to ${programme} at ${institution}. ${base}`,
    interest,
    (p.skillText + p.projectText).trim(),
    `I hope to learn from the staff and students at ${institution} and to make a real contribution to the programme. Thank you for considering my application. I look forward to hearing from you.`,
  ].filter(Boolean);
}

function reference(_cv: BuilderCv, input: LetterInput): string[] {
  const purpose = input.role.trim() || "an opportunity";
  const knowsMe = tidy(input.why) || "I believe you know my work well from my studies";
  return [
    `I hope you are well. I am writing to ask whether you would be willing to act as a referee for me. I am applying for ${purpose}.`,
    `${knowsMe}, and your opinion would carry real weight.`,
    "I have attached my CV so you can see what I have done recently. If you agree, I will send you the details and the deadline, and I will let you know the outcome.",
    "I understand how busy you are, so please feel free to say no. Thank you for your time and your support.",
  ];
}

function thanks(cv: BuilderCv, input: LetterInput): string[] {
  const p = profile(cv);
  const company = input.company.trim() || "your organisation";
  const role = input.role.trim() ? `the ${input.role.trim()} position` : "the position";
  const enjoyed = input.why.trim() ? `I particularly enjoyed discussing ${noDot(lower(input.why.trim()))}.` : "Our conversation made me even more enthusiastic about the role.";
  return [
    `Thank you for taking the time to interview me for ${role} at ${company}. It was a pleasure to learn more about the team and the work.`,
    enjoyed,
    p.skillText ? `${p.skillText} I am confident I could use them to contribute from the start.` : "I am confident that I could contribute from the start.",
    "Please let me know if you need anything else from me. I look forward to hearing from you.",
  ];
}

function followUp(cv: BuilderCv, input: LetterInput): string[] {
  const p = profile(cv);
  const company = input.company.trim() || "your organisation";
  const role = input.role.trim() ? `the ${input.role.trim()} position` : "the position";
  const when = input.why.trim() ? ` on ${noDot(input.why.trim())}` : " recently";
  return [
    `I hope you are well. I am writing to follow up on my application for ${role} at ${company}, which I submitted${when}.`,
    `I remain very interested in the role. ${p.skillText}`.trim(),
    "If you need any further information from me, such as my CV, references or certificates, I would be glad to send it.",
    "Thank you for your time. I look forward to hearing from you.",
  ];
}

/** Writes a first draft from the student's CV. They can edit every word after. */
export function draftLetter(cv: BuilderCv, input: LetterInput): string[] {
  switch (input.kind) {
    case "scholarship":
      return scholarship(cv, input);
    case "admission":
      return admission(cv, input);
    case "reference":
      return reference(cv, input);
    case "thanks":
      return thanks(cv, input);
    case "followup":
      return followUp(cv, input);
    default:
      return jobStyle(cv, input, input.kind);
  }
}

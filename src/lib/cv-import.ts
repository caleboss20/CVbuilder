import {
  blankCv,
  uid,
  type BuilderCv,
  type Job,
  type Project,
  type Referee,
  type School,
  type SkillGroup,
} from "./builder";
import { BULLET_MARK, EMAIL, PHONE, clean, isActionWord, splitSections, wordCount } from "./cv-check";
import type { CvTemplateName } from "./cv-examples";

/*
 * Turns the plain text of an existing CV into the builder's fields, so a student
 * can upload the CV they already have and carry on editing it with a live preview.
 *
 * This is rule-based and best-effort: it finds the section headings, then reads
 * each section the way a person would (a job is a header line with dates followed
 * by bullet points). Anything we could not place is returned in `leftover`, so the
 * student can copy it across by hand and nothing is silently lost.
 */

export type ImportResult = {
  cv: BuilderCv;
  /** How many of each thing we found, for the "here is what we found" message. */
  found: { jobs: number; schools: number; skills: number; projects: number; contacts: number };
  /** Lines we could not place anywhere. */
  leftover: string[];
};

/* ------------------------------------------------------------------ */
/* Dates and headlines                                                 */
/* ------------------------------------------------------------------ */

const MONTH = "(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\\.?";
const YEAR = "(?:19|20)\\d{2}";
const POINT = `(?:${MONTH}\\s+)?${YEAR}`;
const DASH = "(?:–|—|-|to)";
/** "Jun – Aug 2025", "2022 – 2026", "Jan 2025 – present", "2024". */
const DATE_RANGE = new RegExp(
  `${MONTH}\\s*${DASH}\\s*${MONTH}\\s+${YEAR}|${POINT}(?:\\s*${DASH}\\s*(?:${POINT}|present|current|now|date))?`,
  "i",
);

/**
 * Splits a header line such as "Clinical Rotation Student, Komfo Anokye Hospital  Jan 2025 – present"
 * into its title, place and date. Separators between title and place can be a comma, bar, dash or "at".
 */
function splitHeadline(line: string): { title: string; place: string; date: string } {
  const match = line.match(DATE_RANGE);
  const date = match ? clean(match[0]) : "";
  const rest = clean(line.replace(DATE_RANGE, " ").replace(/[()]/g, " "));

  const strong = rest.split(/\s*[|·–—@]\s*|\s+-\s+|\s+at\s+/i).map(clean).filter(Boolean);
  if (strong.length >= 2) return { title: strong[0], place: strong.slice(1).join(", "), date };

  const commas = rest.split(/\s*,\s*/).map(clean).filter(Boolean);
  return { title: commas[0] ?? "", place: commas.slice(1).join(", "), date };
}

const hasDate = (s: string) => DATE_RANGE.test(s);
const isOnlyDate = (s: string) => hasDate(s) && clean(s.replace(DATE_RANGE, "").replace(/[()|,–—-]/g, "")) === "";

/* ------------------------------------------------------------------ */
/* Section readers                                                     */
/* ------------------------------------------------------------------ */

/** Experience, leadership and volunteering: header lines with dates, followed by bullets. */
function parseJobs(lines: string[]): Job[] {
  const jobs: Job[] = [];
  let current: Job | null = null;
  let lastWasBullet = false;

  for (const line of lines) {
    const isBullet = BULLET_MARK.test(line);
    const text = line.replace(BULLET_MARK, "").trim();
    if (!text) continue;

    const startsLikeBullet = !!current && isActionWord(text.split(/\s+/)[0]) && wordCount(text) >= 5 && !hasDate(text);
    if (isBullet || startsLikeBullet) {
      current ??= pushJob(jobs);
      current.bullets.push(text);
      lastWasBullet = true;
      continue;
    }

    // A wrapped bullet continues on the next line, usually in lowercase
    if (current && lastWasBullet && current.bullets.length > 0 && /^[a-z(]/.test(text)) {
      current.bullets[current.bullets.length - 1] += ` ${text}`;
      continue;
    }

    // A line holding only the dates belongs to the entry above it
    if (current && !current.date && isOnlyDate(text)) {
      current.date = clean(text);
      continue;
    }

    // "Role" on one line, then "Organisation, Town  dates" on the next: one entry, not two
    if (current && current.title && !current.place && !current.date && current.bullets.length === 0 && hasDate(text)) {
      const { title, place, date } = splitHeadline(text);
      current.place = [title, place].filter(Boolean).join(", ");
      current.date = date;
      continue;
    }

    // A second header line (the organisation) belongs to the same entry
    if (current && !current.place && current.bullets.length === 0 && !hasDate(text) && wordCount(text) <= 10) {
      current.place = text;
      continue;
    }

    const { title, place, date } = splitHeadline(text);
    current = { id: uid(), title, place, date, bullets: [] };
    jobs.push(current);
    lastWasBullet = false;
  }

  // The builder shows at least one empty bullet box per job
  return jobs.map((j) => (j.bullets.length ? j : { ...j, bullets: [""] }));
}

function pushJob(jobs: Job[]): Job {
  const job: Job = { id: uid(), title: "", place: "", date: "", bullets: [] };
  jobs.push(job);
  return job;
}

const DEGREE_WORDS =
  /\b(bsc|b\.sc|ba|b\.a|beng|llb|bachelor|master|msc|mphil|phd|diploma|hnd|certificate|wassce|ssce|o level|a level|degree)\b/i;

function parseSchools(lines: string[], leftover: string[]): School[] {
  const schools: School[] = [];
  let current: School | null = null;

  for (const line of lines) {
    const text = line.replace(BULLET_MARK, "").trim();
    if (!text) continue;
    const degreeLike = DEGREE_WORDS.test(text);

    // "KNUST, Kumasi  2022 – 2026" after "BSc Nursing": the school and dates of the entry above
    if (current && current.degree && !current.school && hasDate(text) && !degreeLike) {
      const { title, place, date } = splitHeadline(text);
      current.school = [title, place].filter(Boolean).join(", ");
      current.date ||= date;
      continue;
    }

    if (degreeLike || hasDate(text)) {
      const { title, place, date } = splitHeadline(text);
      current = { id: uid(), degree: title, school: place, date };
      schools.push(current);
    } else if (current && !current.school) {
      current.school = text;
    } else {
      leftover.push(text); // for example "Major in Statistics" under a degree
    }
  }
  return schools;
}

/** "Software: Excel, Canva" becomes a group; loose items go in one unnamed group. */
function parseSkills(lines: string[]): SkillGroup[] {
  const groups: SkillGroup[] = [];
  const loose: string[] = [];

  const items = (s: string) =>
    s
      .split(/[,;|•·]|\s{2,}/)
      .map((i) => clean(i.replace(BULLET_MARK, "")))
      .filter(Boolean);

  for (const line of lines) {
    const colon = line.indexOf(":");
    if (colon > 0 && colon <= 32) {
      const list = items(line.slice(colon + 1));
      if (list.length) groups.push({ id: uid(), label: clean(line.slice(0, colon)), items: list.join(", ") });
    } else {
      loose.push(...items(line));
    }
  }
  if (loose.length) groups.push({ id: uid(), label: "", items: loose.join(", ") });
  return groups;
}

/** One item per line or comma, with bullets removed. */
function parseList(lines: string[], splitCommas: boolean): string[] {
  return lines.flatMap((line) => {
    const text = line.replace(BULLET_MARK, "").trim();
    return splitCommas ? text.split(/\s*[,;|•·]\s*/).map(clean) : [clean(text)];
  }).filter(Boolean);
}

function parseProjects(lines: string[]): Project[] {
  const projects: Project[] = [];
  for (const line of lines) {
    const text = line.replace(BULLET_MARK, "").trim();
    if (!text) continue;
    const last = projects[projects.length - 1];
    // A wrapped line continues the previous project's description
    if (last && /^[a-z(]/.test(text)) {
      last.detail = clean(`${last.detail} ${text}`);
      continue;
    }
    const split = text.match(/^(.{2,60}?)\s*(?::|\s[-–—]\s)\s*(.+)$/);
    projects.push({ id: uid(), name: split ? clean(split[1]) : text, detail: split ? clean(split[2]) : "" });
  }
  return projects;
}

/** References come as name, role, phone. A new person starts once the last one is complete. */
function parseReferences(lines: string[]): Referee[] {
  const refs: Referee[] = [];
  let current: Referee | null = null;
  for (const raw of lines) {
    const text = raw.replace(BULLET_MARK, "").trim();
    if (!text) continue;
    if (!current || (current.name && current.role && current.phone)) {
      current = { id: uid(), name: "", role: "", phone: "" };
      refs.push(current);
    }
    const phone = text.match(PHONE)?.[0];
    const email = text.match(EMAIL)?.[0];
    if (phone || email) current.phone = clean(phone ?? email ?? "");
    else if (!current.name) current.name = text;
    else if (!current.role) current.role = text;
  }
  return refs.filter((r) => r.name);
}

/* ------------------------------------------------------------------ */
/* The top of the CV: name, role and contact details                   */
/* ------------------------------------------------------------------ */

const LINK = /(?:linkedin|github|behance|dribbble)\.[a-z./-]+|(?:www\.)?[a-z0-9-]+\.(?:com|net|org|io|dev)(?:\/\S*)?/i;

/** "KWAME MENSAH" -> "Kwame Mensah". Mixed-case names are left as written. */
function nameCase(s: string): string {
  if (s !== s.toUpperCase()) return s;
  return s.toLowerCase().replace(/(^|[\s-])([a-z])/g, (_, sep: string, ch: string) => sep + ch.toUpperCase());
}

function parseHeader(rawHeader: string[], fullText: string) {
  // Big stacked names ("Abena" over "Owusu") arrive as two one-word lines: join them
  const oneWord = (s?: string) => !!s && /^[A-Za-z][A-Za-z'’-]+$/.test(s);
  const header = oneWord(rawHeader[0]) && oneWord(rawHeader[1]) ? [`${rawHeader[0]} ${rawHeader[1]}`, ...rawHeader.slice(2)] : rawHeader;

  const used = new Set<string>();
  let name = "";
  let role = "";
  let location = "";
  let phone = "";
  let email = "";
  const links: string[] = [];

  for (const line of header) {
    // Contact lines hold several details split by bars or dots
    const pieces = line.split(/\s*[|•·]\s*/).map(clean).filter(Boolean);
    let isContactLine = false;
    for (const piece of pieces) {
      const mail = piece.match(EMAIL)?.[0];
      const tel = piece.match(PHONE)?.[0];
      const link = !mail ? piece.match(LINK)?.[0] : undefined;
      if (mail) { email ||= mail; isContactLine = true; }
      else if (tel && /^[\s+\d()-]+$/.test(piece.replace(tel, "") + " ")) { phone ||= clean(tel); isContactLine = true; }
      else if (link) { if (!links.includes(link)) links.push(link); isContactLine = true; }
      else if (/ghana|accra|kumasi|tamale|cape coast|takoradi|ho,|koforidua/i.test(piece) && wordCount(piece) <= 6) { location ||= piece; isContactLine = true; }
    }
    if (isContactLine) {
      used.add(line);
      continue;
    }
    const letters = /^[A-Za-z][A-Za-z .'’-]+$/.test(line);
    if (!name && letters && wordCount(line) >= 2 && wordCount(line) <= 5) {
      name = nameCase(line);
      used.add(line);
    } else if (name && !role && !/\d/.test(line) && wordCount(line) <= 8) {
      role = line;
      used.add(line);
    }
  }

  // Two-column PDFs can scatter the contact details; fall back to searching the whole text
  email ||= fullText.match(EMAIL)?.[0] ?? "";
  phone ||= clean(fullText.match(PHONE)?.[0] ?? "");

  // A name set in a side panel can end up far from the top. Many emails are first.last@..., so use that as a guess.
  if (!name && email) {
    const parts = email.split("@")[0].split(/[._-]+/).filter((p) => /^[a-z]{2,}$/i.test(p));
    if (parts.length >= 2 && parts.length <= 3) {
      name = parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(" ");
    }
  }

  // `lines` is the header after stacked names were joined, so the caller can see what was left unused
  return { name, role, location, phone, email, links, used, lines: header };
}

/* ------------------------------------------------------------------ */
/* Entry point                                                         */
/* ------------------------------------------------------------------ */

export function importCv(text: string, template: CvTemplateName = "ats"): ImportResult {
  const lines = text
    .replace(/ /g, " ")
    .replace(/\r/g, "")
    .split("\n")
    .map(clean)
    .filter(Boolean);
  const { sections, header } = splitSections(lines);
  const leftover: string[] = [];

  const top = parseHeader(header, text);
  const unusedHeader = top.lines.filter((l) => !top.used.has(l));

  // The summary is its own section, or a long paragraph sitting under the name
  let summary = (sections.summary ?? []).join(" ");
  if (!summary) {
    const paragraph = unusedHeader.filter((l) => wordCount(l) >= 12).join(" ");
    summary = paragraph;
    unusedHeader.splice(0, unusedHeader.length, ...unusedHeader.filter((l) => wordCount(l) < 12));
  }
  leftover.push(...unusedHeader);

  // Volunteering and leadership read like jobs, so they join the experience list
  const experience = [...parseJobs(sections.experience ?? []), ...parseJobs(sections.leadership ?? [])];
  const education = parseSchools(sections.education ?? [], leftover);
  const skills = parseSkills(sections.skills ?? []);
  const projects = parseProjects(sections.projects ?? []);
  // The heading reader groups research, publications and talks together, so they all land in Publications.
  // The student can move individual lines to Research or Presentations in the academic step.
  const publications = parseList(sections.publications ?? [], false);

  const cv: BuilderCv = {
    ...blankCv(template),
    name: top.name,
    role: top.role,
    location: top.location,
    phone: top.phone,
    email: top.email,
    links: top.links,
    summary: clean(summary),
    education: education.length ? education : blankCv(template).education,
    experience: experience.length ? experience : blankCv(template).experience,
    projects,
    skills: skills.length ? skills : blankCv(template).skills,
    languages: parseList(sections.languages ?? [], true),
    certifications: parseList(sections.certifications ?? [], false),
    awards: parseList(sections.awards ?? [], false),
    interests: parseList(sections.interests ?? [], true),
    references: parseReferences(sections.references ?? []),
    publications,
    // Having a publications section is the clearest sign of an academic CV
    cvType: publications.length > 0 ? "academic" : "standard",
  };

  return {
    cv,
    found: {
      jobs: experience.length,
      schools: education.length,
      skills: skills.reduce((n, g) => n + g.items.split(",").length, 0),
      projects: projects.length,
      contacts: [top.email, top.phone, top.location, ...top.links].filter(Boolean).length,
    },
    leftover: leftover.filter(Boolean),
  };
}

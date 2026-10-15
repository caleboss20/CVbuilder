import { extractKeywords, matchCv, niceSkill } from "./job-match";
import { industries, OTHER_INDUSTRY } from "./industries";

/*
 * CV checker: scores a CV out of 100 and says what to fix.
 *
 * No AI is involved. A CV is plain text; we find its sections and bullet points,
 * then run a list of small checks. Each check awards points out of its own maximum,
 * and the final score is points earned / points available, so a check that does not
 * apply (for example job fit when no advert was pasted) simply drops out and the
 * rest are scaled to 100.
 */

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type CheckArea = "Job fit" | "Industry" | "Structure" | "Experience" | "Clarity";
export type CheckStatus = "good" | "ok" | "fix";

export type Check = {
  id: string;
  area: CheckArea;
  /** Short name shown in the list, e.g. "Numbers in your bullet points". */
  label: string;
  points: number;
  max: number;
  status: CheckStatus;
  /** One or two plain sentences saying what is good, or exactly what to change. */
  advice: string;
  /** Concrete items the advice refers to: missing keywords, or the weakest bullets. */
  examples?: string[];
};

export type CheckInput = {
  /** The CV as plain text. */
  cvText: string;
  /** The job advert, if the student pasted one. */
  advert?: string;
  /** An id from industries.ts, or OTHER_INDUSTRY. */
  industryId?: string;
  /** What the student typed when they chose "Other". */
  otherIndustry?: string;
  /**
   * "standard": the one to two page CV most employers in Ghana expect.
   * "academic": a longer research or academic CV with publications. Length is not
   * penalised the same way, and a research section is expected.
   */
  cvType?: "standard" | "academic";
};

export type CvReport = {
  /** 0 to 100. */
  score: number;
  band: { label: string; tone: "strong" | "good" | "weak" };
  checks: Check[];
  /** Score per area, as a percentage. */
  areas: { area: CheckArea; percent: number }[];
  /** Keywords from the advert that the CV already has / is missing. */
  matched: string[];
  missing: string[];
  /** Things worth telling the student that are not scored, like "no advert pasted". */
  notes: string[];
  stats: { words: number; bullets: number; bulletsWithNumbers: number; sections: string[] };
};

/* ------------------------------------------------------------------ */
/* Reading the CV text                                                 */
/* ------------------------------------------------------------------ */

export type SectionId =
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "certifications"
  | "languages"
  | "references"
  | "awards"
  | "interests"
  | "leadership"
  | "publications";

/** A line that is only one of these words (case ignored) is a section heading. */
const HEADINGS: Record<SectionId, RegExp> = {
  summary: /^(professional |career |personal )?(summary|profile|objective|about me|statement|personal statement)$/,
  experience: /^(work |professional |relevant |employment |internship )?(experience|history|attachments?)$|^(employment|work) history$|^internships?$/,
  education: /^(education|academic background|academic qualifications?|qualifications?)( and .*)?$/,
  skills: /^(key |technical |core |professional |additional )?(skills|competenc(y|ies)|expertise)( and .*)?$/,
  projects: /^(projects?|academic projects?|selected projects?)$/,
  certifications: /^(certifications?|certificates?|courses|training)( and .*)?$/,
  languages: /^languages?$/,
  references: /^(references?|referees?)$/,
  awards: /^(awards?|achievements?|honou?rs)( and .*)?$/,
  interests: /^(interests?|hobbies)$/,
  leadership: /^(volunteer(ing)?|leadership|activities|extracurricular( activities)?|community service)( .*)?$/,
  publications: /^((selected |peer-reviewed )?publications?|research( experience| interests| projects)?|presentations?|conferences?|posters?)( .*)?$/,
};

export const BULLET_MARK = /^\s*[•\-–—*▪●·◦○■]\s*/;

/** Words a strong bullet point usually starts with. Past tense, because the work is done. */
const ACTION_VERBS = new Set(
  (
    "led managed organised organized built developed designed created improved increased reduced trained supported " +
    "coordinated delivered analysed analyzed prepared presented implemented launched taught tutored assisted recorded " +
    "maintained wrote planned conducted collected handled processed raised grew saved achieved established initiated " +
    "operated produced researched reviewed resolved served sold tested updated verified installed repaired dispensed " +
    "administered screened interviewed evaluated monitored mentored negotiated helped drafted edited published " +
    "facilitated executed streamlined won completed performed participated volunteered ran kept answered booked " +
    "checked counted cleaned worked took learned explained shared reached grew supervised oversaw guided advised " +
    "earned generated captured cut applied supplied scheduled tracked posted wrote sorted labelled labeled handed " +
    "observed studied surveyed mapped measured balanced sold signed registered enrolled referred escorted weighed"
  ).split(" "),
);

/** Present-tense verbs whose past form is irregular, so stripping "ed" cannot find them. */
const IRREGULAR_VERBS = new Set(
  "lead build run write take teach grow win keep sell make give hold drive set put get find begin".split(" "),
);

/**
 * Is this word an action verb? CVs use past tense for old roles ("Trained") and
 * present tense for current ones ("Train"), so we accept both by trying the
 * likely past forms of the word.
 */
export function isActionWord(raw: string): boolean {
  const w = raw.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return false;
  if (ACTION_VERBS.has(w) || IRREGULAR_VERBS.has(w)) return true;
  const pastForms = [
    `${w}ed`, // assist -> assisted
    `${w}d`, // update -> updated
    w.endsWith("s") ? `${w.slice(0, -1)}ed` : "", // assists -> assisted
    w.endsWith("ing") ? `${w.slice(0, -3)}ed` : "", // assisting -> assisted
    w.endsWith("y") ? `${w.slice(0, -1)}ied` : "", // supply -> supplied
  ];
  return pastForms.some((form) => form !== "" && ACTION_VERBS.has(form));
}

/** Filler that tells a recruiter nothing. */
const WEAK_PHRASES =
  /responsible for|duties (included|include)|worked on|tasked with|in charge of|hard[- ]working|team player|results[- ]oriented|go[- ]getter|references available (up)?on request/gi;

export const EMAIL = /[\w.+-]+@[\w-]+\.[\w.-]+/;
// Ghana mobile numbers (024 123 4567, +233 24 123 4567) and other long digit runs
export const PHONE = /(\+?233|\b0)[\s-]?\d{2}[\s-]?\d{3}[\s-]?\d{4}|\+?\d[\d\s-]{8,}\d/;

export const wordCount = (s: string) => s.split(/\s+/).filter(Boolean).length;
export const clean = (line: string) => line.replace(/\s+/g, " ").trim();

/** Letters only, lowercased: "WORK EXPERIENCE:" -> "work experience". */
const headingKey = (line: string) => line.toLowerCase().replace(/[^a-z& ]/g, "").replace(/\s+/g, " ").trim();

/** Which section a line starts, if it is a heading. */
function headingOf(line: string): SectionId | null {
  if (line.length > 45 || wordCount(line) > 5) return null;
  const key = headingKey(line);
  if (!key) return null;
  for (const id of Object.keys(HEADINGS) as SectionId[]) {
    if (HEADINGS[id].test(key)) return id;
  }
  return null;
}

/** Splits the CV into lines grouped under the section heading above them. */
export function splitSections(lines: string[]) {
  const sections: Partial<Record<SectionId, string[]>> = {};
  const header: string[] = []; // lines before the first heading: name and contact details
  let current: SectionId | null = null;
  for (const line of lines) {
    const heading = headingOf(line);
    if (heading) {
      current = heading;
      sections[heading] ??= [];
    } else if (current) {
      sections[current]!.push(line);
    } else {
      header.push(line);
    }
  }
  return { sections, header };
}

/** The bullet points in the experience part of the CV, with markers removed. */
function findBullets(lines: string[], scope: string[] | undefined): string[] {
  const source = scope && scope.length > 0 ? scope : lines;
  return source
    .filter((line) => {
      if (headingOf(line)) return false;
      const text = line.replace(BULLET_MARK, "");
      if (wordCount(text) < 4) return false;
      return BULLET_MARK.test(line) || isActionWord(text.split(/\s+/)[0]);
    })
    .map((line) => line.replace(BULLET_MARK, "").trim());
}

/* ------------------------------------------------------------------ */
/* Scoring                                                             */
/* ------------------------------------------------------------------ */

const statusOf = (ratio: number): CheckStatus => (ratio >= 0.8 ? "good" : ratio >= 0.5 ? "ok" : "fix");
const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/** Builds a check from how well the CV did (0 to 1) out of `max` points. */
function makeCheck(
  area: CheckArea,
  id: string,
  label: string,
  ratio: number,
  max: number,
  advice: { good: string; fix: string },
  examples?: string[],
): Check {
  const r = clamp01(ratio);
  const status = statusOf(r);
  return {
    id,
    area,
    label,
    points: Math.round(r * max * 10) / 10,
    max,
    status,
    advice: status === "good" ? advice.good : advice.fix,
    examples: status === "good" ? undefined : examples?.filter(Boolean).slice(0, 5),
  };
}

/** Whether `term` appears in `text` as a whole word or phrase. */
function mentions(text: string, term: string): boolean {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i").test(text);
}

/** The words a student typed for "Other": "Telecoms, sales and installation" -> telecoms, sales, installation. */
function termsFrom(typed: string): string[] {
  const skip = new Set(["and", "the", "for", "with", "work", "field", "industry"]);
  return [...new Set(typed.toLowerCase().split(/[^a-z0-9+#.]+/).filter((w) => w.length >= 3 && !skip.has(w)))];
}

export function analyseCv(input: CheckInput): CvReport {
  const text = input.cvText.replace(/ /g, " ").replace(/\r/g, "");
  const lines = text.split("\n").map(clean).filter(Boolean);
  const lower = text.toLowerCase();
  const { sections } = splitSections(lines);
  const words = wordCount(text);

  const bullets = findBullets(lines, sections.experience);
  const withNumbers = bullets.filter((b) => /\d/.test(b));
  const withoutNumbers = bullets.filter((b) => !/\d/.test(b));
  const startsWithVerb = bullets.filter((b) => isActionWord(b.split(/\s+/)[0]));
  const weakFound = [...new Set((text.match(WEAK_PHRASES) ?? []).map((p) => p.toLowerCase()))];

  const checks: Check[] = [];
  const notes: string[] = [];
  let matched: string[] = [];
  let missing: string[] = [];

  /* ---- Job fit: keywords from the advert ---- */
  const advert = input.advert?.trim() ?? "";
  if (advert.length >= 40) {
    const keywords = extractKeywords(advert);
    if (keywords.length >= 3) {
      const result = matchCv(lower, keywords);
      matched = result.present;
      missing = result.missing;
      checks.push(
        makeCheck(
          "Job fit",
          "keywords",
          "Keywords from the job advert",
          result.score / 100,
          30,
          {
            good: `Your CV uses ${matched.length} of the ${keywords.length} keywords in the advert. That reads as a good match.`,
            fix: `Your CV is missing ${missing.length} of the ${keywords.length} keywords in the advert. Use these words in your skills and bullet points, but only where they are true.`,
          },
          missing.map(niceSkill),
        ),
      );
    } else {
      notes.push("We could not find clear skills in that job advert, so job fit was not scored. Paste the full requirements section.");
    }
  } else {
    notes.push("No job advert was added, so job fit was not scored. Paste one for a more accurate score.");
  }

  /* ---- Industry: do you use the words your field uses? ---- */
  const preset = industries.find((i) => i.id === input.industryId);
  const industryTerms = preset ? preset.keywords : input.industryId === OTHER_INDUSTRY ? termsFrom(input.otherIndustry ?? "") : [];
  if (industryTerms.length > 0) {
    const found = industryTerms.filter((t) => mentions(lower, t));
    const notFound = industryTerms.filter((t) => !found.includes(t));
    // A CV rarely needs every word; 8 matches (or all, for a short typed list) counts as full marks
    const needed = Math.min(8, industryTerms.length);
    const name = preset ? preset.label : (input.otherIndustry ?? "your field").trim();
    checks.push(
      makeCheck(
        "Industry",
        "industry",
        `Words used in ${name}`,
        found.length / needed,
        10,
        {
          good: `Your CV uses the language of ${name}, like ${found.slice(0, 3).join(", ")}.`,
          fix: `Recruiters in ${name} look for words like the ones below. Add the ones that are true for you.`,
        },
        notFound.slice(0, 5),
      ),
    );
  } else {
    notes.push("No industry was chosen, so industry fit was not scored.");
  }

  /* ---- Structure: is everything a recruiter looks for there? ---- */
  const hasEmail = EMAIL.test(text);
  const hasPhone = PHONE.test(text);
  checks.push(
    makeCheck(
      "Structure",
      "contact",
      "Contact details",
      ((hasEmail ? 1 : 0) + (hasPhone ? 1 : 0)) / 2,
      4,
      {
        good: "Your email and phone number are both there.",
        fix: `Add ${!hasEmail && !hasPhone ? "an email and a phone number" : !hasEmail ? "an email address" : "a phone number"} near your name, so a recruiter can reach you quickly.`,
      },
    ),
  );

  const summaryWords = wordCount((sections.summary ?? []).join(" "));
  const summaryRatio = !sections.summary ? 0 : summaryWords >= 25 && summaryWords <= 70 ? 1 : summaryWords >= 12 ? 0.6 : 0.3;
  checks.push(
    makeCheck(
      "Structure",
      "summary",
      "Summary at the top",
      summaryRatio,
      4,
      {
        good: "You open with a short summary of the right length.",
        fix: !sections.summary
          ? "Add a 2 to 3 sentence summary at the top: who you are, what you are good at and what you want."
          : summaryWords > 70
            ? `Your summary is ${summaryWords} words. Trim it to about 25 to 60 so it gets read.`
            : `Your summary is only ${summaryWords} words. Add what you are good at and the kind of role you want.`,
      },
    ),
  );

  checks.push(
    makeCheck("Structure", "experience-section", "Experience section", sections.experience ? 1 : bullets.length > 0 ? 0.5 : 0, 5, {
      good: "You have a clear experience section.",
      fix: "Add an Experience heading and list internships, national service, attachments, part-time jobs, volunteering or leadership roles.",
    }),
  );

  const hasEducation = !!sections.education || /\b(bsc|b\.sc|ba|beng|llb|bachelor|diploma|hnd|wassce|university|college|senior high|shs)\b/i.test(text);
  checks.push(
    makeCheck("Structure", "education", "Education", hasEducation ? 1 : 0, 4, {
      good: "Your education is listed.",
      fix: "Add your degree, school and dates under an Education heading.",
    }),
  );

  const skillItems = (sections.skills ?? []).join(", ").split(/[,;|•·]|\s-\s/).map(clean).filter(Boolean);
  checks.push(
    makeCheck("Structure", "skills", "Skills section", !sections.skills ? 0 : clamp01(skillItems.length / 5), 3, {
      good: `You list ${skillItems.length} skills. That is a healthy range.`,
      fix: !sections.skills
        ? "Add a Skills section. Recruiters and tracking software both scan it."
        : `You list only ${skillItems.length} skill${skillItems.length === 1 ? "" : "s"}. Aim for at least 5 that you could show in an interview.`,
    }),
  );

  /* ---- Experience: do the bullets show impact? ---- */
  if (bullets.length > 0) {
    const numberRatio = withNumbers.length / bullets.length;
    checks.push(
      makeCheck(
        "Experience",
        "numbers",
        "Numbers in your bullet points",
        numberRatio / 0.5, // half of the bullets having a number is full marks
        10,
        {
          good: `${withNumbers.length} of your ${bullets.length} bullet points include a number. That shows real impact.`,
          fix: `Only ${withNumbers.length} of your ${bullets.length} bullet points include a number. Say how many, how often or how much: "Trained 40 volunteers", "cut waiting time by 15%".`,
        },
        withoutNumbers,
      ),
    );

    checks.push(
      makeCheck(
        "Experience",
        "verbs",
        "Strong opening words",
        startsWithVerb.length / bullets.length / 0.8,
        8,
        {
          good: "Most of your bullet points start with an action word like Led, Built or Organised.",
          fix: "Start each bullet with an action word (Led, Built, Organised, Trained) instead of a noun or \"I\". These bullets need a stronger first word:",
        },
        bullets.filter((b) => !startsWithVerb.includes(b)),
      ),
    );

    checks.push(
      makeCheck("Experience", "amount", "Enough detail", bullets.length / 6, 4, {
        good: `You have ${bullets.length} bullet points describing your work. That is enough detail.`,
        fix: `You have only ${bullets.length} bullet point${bullets.length === 1 ? "" : "s"} about your work. Give each role 2 to 4 bullets about what you did and what changed.`,
      }),
    );
  } else {
    checks.push(
      makeCheck("Experience", "bullets", "Bullet points about your work", 0, 22, {
        good: "",
        fix: "We could not find bullet points describing what you did. List each role with 2 to 4 bullets, each starting with an action word and including a number where you can.",
      }),
    );
  }

  checks.push(
    makeCheck(
      "Experience",
      "filler",
      "Filler phrases",
      weakFound.length === 0 ? 1 : weakFound.length === 1 ? 0.5 : 0,
      3,
      {
        good: "No filler phrases. Your wording is direct.",
        fix: "These phrases take up space without proving anything. Replace them with what you actually did:",
      },
      weakFound,
    ),
  );

  /* ---- Clarity: length and readability ---- */
  // Most employers want one to two pages (about 300 to 750 words). An academic CV may run longer.
  const academic = input.cvType === "academic";
  const longest = academic ? 2200 : 750;
  const tooLongBy = academic ? 600 : 200;
  const lengthRatio =
    words < 150 ? 0.2 : words < 300 ? 0.2 + ((words - 150) / 150) * 0.8 : words <= longest ? 1 : words <= longest + tooLongBy ? 0.6 : 0.3;
  checks.push(
    makeCheck(
      "Clarity",
      "length",
      "Length",
      lengthRatio,
      6,
      {
        good: academic
          ? `About ${words} words is a reasonable length for an academic CV.`
          : `About ${words} words is a good length for a student CV (one to two pages).`,
        fix:
          words < 300
            ? `Your CV is only about ${words} words, which looks thin. Add projects, volunteering, leadership roles and more detail on your work.`
            : academic
              ? `Your CV is about ${words} words. Even an academic CV reads better when older or minor items are cut.`
              : `Your CV is about ${words} words, which is long. Keep it to one or two pages and cut older or less relevant detail. (If this is an academic or research CV, choose that type above.)`,
      },
    ),
  );

  if (academic) {
    checks.push(
      makeCheck("Structure", "research", "Research and publications", sections.publications ? 1 : 0, 4, {
        good: "You have a research or publications section, which academic reviewers look for first.",
        fix: "Add a Research or Publications section: papers, your thesis or dissertation, conference talks and posters, with dates.",
      }),
    );
  }

  const yearsFound = (text.match(/\b(19|20)\d{2}\b/g) ?? []).length;
  checks.push(
    makeCheck("Clarity", "dates", "Dates", yearsFound / 3, 3, {
      good: "Your roles and school have dates, so the timeline is clear.",
      fix: "Add dates (month and year) to your education and each role, so a recruiter can see your timeline.",
    }),
  );

  if (bullets.length > 0) {
    const avg = bullets.reduce((n, b) => n + wordCount(b), 0) / bullets.length;
    const longOnes = bullets.filter((b) => wordCount(b) > 30);
    checks.push(
      makeCheck("Clarity", "bullet-length", "Short, scannable bullets", avg <= 24 ? 1 : avg <= 32 ? 0.6 : 0.3, 3, {
        good: "Your bullet points are short enough to scan quickly.",
        fix: "Some bullet points are long. Keep each to one or two lines (under about 25 words). Try splitting these:",
      }, longOnes),
    );
  }

  /* ---- Total ---- */
  const earned = checks.reduce((n, c) => n + c.points, 0);
  const available = checks.reduce((n, c) => n + c.max, 0);
  const score = available > 0 ? Math.round((earned / available) * 100) : 0;

  const areaNames: CheckArea[] = ["Job fit", "Industry", "Structure", "Experience", "Clarity"];
  const areas = areaNames
    .map((area) => {
      const inArea = checks.filter((c) => c.area === area);
      const max = inArea.reduce((n, c) => n + c.max, 0);
      return { area, percent: max ? Math.round((inArea.reduce((n, c) => n + c.points, 0) / max) * 100) : -1 };
    })
    .filter((a) => a.percent >= 0);

  // Biggest problems first, so the student knows what to do next
  const order: Record<CheckStatus, number> = { fix: 0, ok: 1, good: 2 };
  checks.sort((a, b) => order[a.status] - order[b.status] || b.max - b.points - (a.max - a.points));

  const band: CvReport["band"] =
    score >= 80 ? { label: "Strong", tone: "strong" } : score >= 60 ? { label: "Good, with gaps", tone: "good" } : { label: "Needs work", tone: "weak" };

  return {
    score,
    band,
    checks,
    areas,
    matched,
    missing,
    notes,
    stats: {
      words,
      bullets: bullets.length,
      bulletsWithNumbers: withNumbers.length,
      sections: Object.keys(sections),
    },
  };
}

/** True when there is enough text to score. Scanned or image PDFs give almost none. */
export function hasEnoughText(text: string): boolean {
  return wordCount(text) >= 40;
}

import { cvExamples, type CvExample } from "./cv-examples";

/**
 * Lets a student start from ANY course, even one we have no example for.
 *
 * We match what they typed to the closest field we do cover, then relabel that
 * example (course name, role and degree) so it reads as their own course. The
 * result is only used as guidance (grey placeholders and a sample preview), so
 * it never has to be a perfect match.
 */

/** Words that point to a field. Matched at the start of a word, so "biolog" finds "biological". */
const FIELD_KEYWORDS: ReadonlyArray<readonly [slug: string, words: readonly string[]]> = [
  ["midwifery", ["midwif"]],
  ["nursing", ["nurs", "health", "physio", "dental", "dentist", "medicine", "medical doctor", "optom", "dietet", "public health"]],
  ["pharmacy", ["pharm"]],
  ["medical-laboratory-science", ["laboratory", "biolog", "biochem", "microbio", "chemi", "physic", "biomedical", "biotech", "environmental", "natural science", "science"]],
  ["computer-science", ["computer", "software", "information tech", "ict", "cyber", "informatics", "programming"]],
  ["data-science", ["data", "statistic", "mathemat", "actuar", "analytics"]],
  ["civil-engineering", ["civil", "construction", "geomatic", "geodetic", "surveying", "quantity survey"]],
  ["mechanical-engineering", ["engineer", "electrical", "electronic", "mechanical", "chemical eng", "petroleum", "mechatron", "telecom", "automotive", "materials"]],
  ["architecture", ["archit", "planning", "landscape", "estate", "interior"]],
  ["accounting", ["account", "audit", "taxation"]],
  ["banking", ["bank", "finance", "insurance"]],
  ["economics", ["econom", "development stud", "political econ"]],
  ["marketing", ["market", "sales", "public relations", "advertis", "entrepreneur", "supply chain", "procurement"]],
  ["law", ["law", "legal", "jurisprud"]],
  ["teaching", ["teach", "education", "pedagog", "early childhood"]],
  ["agriculture", ["agric", "agro", "forest", "animal", "crop", "soil", "fisher", "horticult", "food science", "nutrition"]],
  ["graphic-design", ["design", "graphic", "fashion", "textile", "fine art", "creative art", "film", "music", "theatre", "photograph"]],
  ["journalism", ["journal", "communicat", "media", "english", "language", "literature", "linguist", "history", "sociolog", "psycholog", "politic", "social", "religio", "philosoph", "theolog", "geograph", "library", "publishing"]],
  ["business-administration", ["business", "management", "administration", "human resource", "hospitality", "tourism", "leadership", "project management"]],
];

/** What we fall back to when nothing matches: the most general student CV we have. */
const FALLBACK_SLUG = "business-administration";

const bySlug = new Map(cvExamples.map((e) => [e.slug, e]));

const SMALL_WORDS = new Set(["and", "of", "in", "for", "the", "to", "with"]);

/** "electrical and electronics engineering" -> "Electrical and Electronics Engineering" */
function titleCase(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((w, i) => (i > 0 && SMALL_WORDS.has(w.toLowerCase()) ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}

/** The example for the field closest to what the student typed. */
export function closestExample(query: string): CvExample {
  const q = query.trim().toLowerCase();
  for (const [slug, words] of FIELD_KEYWORDS) {
    const hit = words.some((w) => new RegExp(`\\b${w}`).test(q));
    const example = bySlug.get(slug);
    if (hit && example) return example;
  }
  return bySlug.get(FALLBACK_SLUG) ?? cvExamples[0];
}

/**
 * A copy of the closest example, relabelled for the course the student typed.
 * Everything else (bullets, skills, layout) stays as realistic guidance.
 */
export function exampleForCourse(query: string): CvExample {
  const base = closestExample(query);
  const course = titleCase(query);
  return {
    ...base,
    course,
    role: `${course} Student`,
    cv: {
      ...base.cv,
      education: base.cv.education.map((e, i) => (i === 0 ? { ...e, degree: `BSc ${course}` } : e)),
    },
  };
}

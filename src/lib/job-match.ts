/**
 * Compares a job advert with a CV using keyword matching (no AI needed):
 * known skills found in the advert, plus words the advert repeats.
 */

const SKILLS = [
  "excel", "microsoft excel", "word", "powerpoint", "ms office", "microsoft office", "google sheets",
  "quickbooks", "sage", "tally", "accounting", "bookkeeping", "reconciliation", "payroll", "auditing", "taxation",
  "financial reporting", "budgeting", "cash handling", "customer service", "sales", "marketing", "digital marketing",
  "social media", "content creation", "copywriting", "seo", "canva", "photoshop", "illustrator", "figma",
  "graphic design", "branding", "communication", "presentation", "public speaking", "teamwork", "leadership",
  "problem solving", "time management", "attention to detail", "negotiation", "project management",
  "data analysis", "data entry", "power bi", "tableau", "sql", "python", "r", "stata", "spss", "statistics",
  "research", "report writing", "javascript", "typescript", "react", "next.js", "node.js", "java", "c#", "php",
  "html", "css", "git", "api", "cloud", "aws", "azure", "linux", "networking", "cybersecurity", "it support",
  "troubleshooting", "autocad", "revit", "solidworks", "matlab", "civil 3d", "surveying", "site supervision",
  "health and safety", "maintenance", "electrical", "solar", "plc", "procurement", "logistics", "supply chain",
  "inventory", "stock management", "warehouse", "driving", "patient care", "nursing", "vital signs",
  "infection control", "patient education", "midwifery", "pharmacy", "dispensing", "laboratory", "phlebotomy",
  "teaching", "lesson planning", "classroom management", "curriculum", "tutoring", "mentoring",
  "legal research", "drafting", "compliance", "risk management", "human resources", "recruitment", "administration",
  "scheduling", "front desk", "receptionist", "mobile money", "banking", "credit", "loans", "agriculture",
  "farm management", "extension", "journalism", "editing", "photography", "video editing", "french", "twi",
];

const STOP = new Set(
  ("about above after again against among applicant applicants apply area being below between candidate candidates " +
    "company could degree duties ensure every experience first from have having into job looking minimum must other " +
    "please position preferred provide qualification qualifications requirements responsibilities role should skills " +
    "strong their there these they this those through under using well were what when where which while will with " +
    "within work working would years year ghana accra kumasi team ability able also including include based plus " +
    "successful closing date send email interested")
    .split(" "),
);

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const has = (text: string, term: string) => new RegExp(`(^|[^a-z0-9])${esc(term)}([^a-z0-9]|$)`, "i").test(text);

export function extractKeywords(advert: string): string[] {
  const text = advert.toLowerCase();
  const found = SKILLS.filter((s) => s.length > 1 && has(text, s));
  // Drop shorter skills already covered by a longer one ("excel" inside "microsoft excel")
  const skills = found.filter((s) => !found.some((o) => o !== s && o.includes(s) && has(text, o)));

  const counts = new Map<string, number>();
  for (const w of text.match(/[a-z][a-z+#.-]{4,}/g) ?? []) {
    const word = w.replace(/[.-]+$/, "");
    if (!STOP.has(word)) counts.set(word, (counts.get(word) ?? 0) + 1);
  }
  const repeated = [...counts.entries()]
    .filter(([w, n]) => n >= 2 && !skills.some((s) => s.includes(w) || w.includes(s)))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([w]) => w);

  return [...skills, ...repeated].slice(0, 20);
}

export function matchCv(cvText: string, keywords: string[]) {
  const present = keywords.filter((k) => has(cvText, k));
  const missing = keywords.filter((k) => !present.includes(k));
  const score = keywords.length ? Math.round((present.length / keywords.length) * 100) : 0;
  return { score, present, missing };
}

/** Title-cases a keyword for adding to the CV ("power bi" -> "Power BI"). */
export function niceSkill(k: string) {
  const special: Record<string, string> = {
    sql: "SQL", seo: "SEO", "power bi": "Power BI", "ms office": "MS Office", aws: "AWS", api: "APIs",
    "c#": "C#", html: "HTML", css: "CSS", plc: "PLC", spss: "SPSS", "it support": "IT support",
    "next.js": "Next.js", "node.js": "Node.js", r: "R", "microsoft excel": "Microsoft Excel",
    "microsoft office": "Microsoft Office", "google sheets": "Google Sheets", quickbooks: "QuickBooks",
    javascript: "JavaScript", typescript: "TypeScript", autocad: "AutoCAD", matlab: "MATLAB", solidworks: "SolidWorks",
    "mobile money": "Mobile money (MoMo)",
  };
  return special[k] ?? k.charAt(0).toUpperCase() + k.slice(1);
}

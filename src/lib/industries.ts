/**
 * Industries a student can pick in the CV checker. Each has the words recruiters in
 * that field expect to see, so the checker can tell whether a CV "speaks the
 * language" of the job. "Other" has no list: the student types their own field.
 */

export type Industry = {
  id: string;
  label: string;
  /** Lowercase terms. Multi-word terms are matched as phrases. */
  keywords: string[];
};

/** Id of the free-text option. */
export const OTHER_INDUSTRY = "other";

export const industries: Industry[] = [
  {
    id: "software",
    label: "Software and IT",
    keywords: [
      "javascript", "typescript", "python", "java", "react", "node.js", "sql", "git", "api", "database",
      "html", "css", "testing", "debugging", "agile", "cloud", "linux", "web development", "mobile app", "github",
    ],
  },
  {
    id: "accounting",
    label: "Accounting and audit",
    keywords: [
      "bookkeeping", "reconciliation", "financial statements", "audit", "taxation", "payroll", "accounts payable",
      "accounts receivable", "excel", "quickbooks", "sage", "budgeting", "icag", "acca", "ifrs", "ledger", "invoices",
    ],
  },
  {
    id: "banking",
    label: "Banking and finance",
    keywords: [
      "financial analysis", "credit", "loans", "risk", "compliance", "customer service", "mobile money", "portfolio",
      "valuation", "financial modelling", "excel", "investment", "treasury", "kyc", "reconciliation", "reporting",
    ],
  },
  {
    id: "marketing",
    label: "Marketing and communications",
    keywords: [
      "social media", "content", "campaign", "seo", "brand", "analytics", "copywriting", "canva", "email marketing",
      "market research", "engagement", "audience", "meta ads", "google analytics", "public relations", "events",
    ],
  },
  {
    id: "health",
    label: "Nursing and health",
    keywords: [
      "patient care", "vital signs", "infection control", "medication", "clinical", "ward", "triage", "documentation",
      "health education", "first aid", "bls", "patient records", "outreach", "immunisation", "hygiene", "referral",
    ],
  },
  {
    id: "engineering",
    label: "Engineering",
    keywords: [
      "autocad", "matlab", "solidworks", "design", "site", "maintenance", "safety", "testing", "project",
      "specifications", "drawings", "inspection", "quality", "installation", "troubleshooting", "plc", "circuits",
    ],
  },
  {
    id: "teaching",
    label: "Teaching and education",
    keywords: [
      "lesson planning", "classroom management", "curriculum", "assessment", "tutoring", "mentoring", "pupils",
      "students", "learning outcomes", "marking", "teaching", "syllabus", "parents", "differentiation",
    ],
  },
  {
    id: "law",
    label: "Law and legal",
    keywords: [
      "legal research", "drafting", "contracts", "compliance", "case law", "advocacy", "moot court", "litigation",
      "memorandum", "clients", "statutes", "due diligence", "pupillage", "chambers", "negotiation",
    ],
  },
  {
    id: "research",
    label: "Research and sciences",
    keywords: [
      "research", "data analysis", "laboratory", "methodology", "literature review", "spss", "statistics", "sampling",
      "report writing", "experiments", "publication", "fieldwork", "survey", "r", "python",
    ],
  },
  {
    id: "hr",
    label: "Human resources and admin",
    keywords: [
      "recruitment", "onboarding", "payroll", "records", "scheduling", "training", "employee relations", "interviews",
      "confidentiality", "administration", "filing", "excel", "communication", "policies", "calendar",
    ],
  },
];

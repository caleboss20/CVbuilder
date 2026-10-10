import type { CvTemplateName } from "./cv-examples";

export type TemplateTag = "simple" | "photo" | "ats";

export type TemplateInfo = {
  id: CvTemplateName;
  name: string;
  blurb: string;
  tags: TemplateTag[];
  /** Course example shown in the preview. */
  exampleSlug: string;
};

export const templates: TemplateInfo[] = [
  { id: "ats", name: "ATS Classic", blurb: "Centred and plain. The safest pick for banks and big companies.", tags: ["simple", "ats"], exampleSlug: "pharmacy" },
  { id: "simple", name: "Simple Bold", blurb: "One clean column with a bold name and strong rules.", tags: ["simple", "ats"], exampleSlug: "medical-laboratory-science" },
  { id: "blueDiagonal", name: "Blue Diagonal", blurb: "Photo in a coloured corner with timelines for school and work.", tags: ["photo"], exampleSlug: "nursing" },
  { id: "navyPanel", name: "Navy Panel", blurb: "Rounded colour panels and a contact bar. Polished and modern.", tags: ["photo"], exampleSlug: "law" },
  { id: "darkHeader", name: "Dark Header", blurb: "Strong header band with a round photo and grey sidebar.", tags: ["photo"], exampleSlug: "civil-engineering" },
  { id: "photo", name: "Modern Photo", blurb: "Light and bold name with a round photo and ring markers.", tags: ["photo"], exampleSlug: "computer-science" },
  { id: "elegant", name: "Elegant Line", blurb: "Thin spaced letters and a fine accent rule. Calm and refined.", tags: ["simple"], exampleSlug: "midwifery" },
  { id: "timeline", name: "Bold Timeline", blurb: "Heavy name and a timeline that makes experience easy to scan.", tags: ["simple"], exampleSlug: "teaching" },
  { id: "band", name: "Soft Band", blurb: "Large serif name with a soft grey band for contact and summary.", tags: ["simple"], exampleSlug: "accounting" },
  { id: "slateBand", name: "Slate Band", blurb: "Grey column, colour band and square timeline markers.", tags: ["photo"], exampleSlug: "banking" },
  { id: "navyRing", name: "Navy Ring", blurb: "Big ringed photo with a confident, heavy name.", tags: ["photo"], exampleSlug: "national-service" },
  { id: "mono", name: "Mono Split", blurb: "Black and white with the photo in the side column.", tags: ["photo"], exampleSlug: "marketing" },
  { id: "accent", name: "Accent Portrait", blurb: "Tall portrait, accent stripe and a skills footer.", tags: ["photo"], exampleSlug: "data-science" },
];

export const templateFilters: { id: "all" | TemplateTag; label: string }[] = [
  { id: "all", label: "All" },
  { id: "simple", label: "Simple" },
  { id: "photo", label: "Photo" },
  { id: "ats", label: "ATS-safe" },
];

/** Accent swatches. null keeps each template's own colour. */
export const accentSwatches: { name: string; color: string | null }[] = [
  { name: "Original", color: null },
  { name: "Navy", color: "#1e3a5f" },
  { name: "Royal blue", color: "#1d4ed8" },
  { name: "Emerald", color: "#047857" },
  { name: "Teal", color: "#0f766e" },
  { name: "Burgundy", color: "#9f1239" },
  { name: "Purple", color: "#6d28d9" },
  { name: "Charcoal", color: "#334155" },
];

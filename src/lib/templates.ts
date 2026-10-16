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
  { id: "sage", name: "Sage", blurb: "Round photo, green-tinted page and calm, spaced headings.", tags: ["photo"], exampleSlug: "business-administration" },
  { id: "tealHeader", name: "Teal Header", blurb: "Bold colour header with photo and clean grey section bars.", tags: ["photo"], exampleSlug: "law" },
  { id: "softBars", name: "Soft Bars", blurb: "Light header and soft tinted bars. Friendly and easy to read.", tags: ["photo"], exampleSlug: "banking" },
  { id: "greyHeader", name: "Grey Header", blurb: "Neutral grey header and ruled headings. Professional anywhere.", tags: ["photo"], exampleSlug: "pharmacy" },
  { id: "cleanRule", name: "Clean Rule", blurb: "Minimal black and white with strong rules. Very easy to scan.", tags: ["photo", "simple"], exampleSlug: "journalism" },
  { id: "ats", name: "ATS Classic", blurb: "Centred and plain. The safest pick for banks and big companies.", tags: ["simple", "ats"], exampleSlug: "mechanical-engineering" },
  { id: "simple", name: "Simple Bold", blurb: "One clean column with a bold name and strong rules.", tags: ["simple", "ats"], exampleSlug: "medical-laboratory-science" },
  { id: "blueDiagonal", name: "Blue Diagonal", blurb: "Photo in a coloured corner with timelines for school and work.", tags: ["photo"], exampleSlug: "nursing" },
  { id: "navyPanel", name: "Navy Panel", blurb: "Rounded colour panels and a contact bar. Polished and modern.", tags: ["photo"], exampleSlug: "graphic-design" },
  { id: "darkHeader", name: "Dark Header", blurb: "Strong header band with a round photo and grey sidebar.", tags: ["photo"], exampleSlug: "civil-engineering" },
  { id: "photo", name: "Modern Photo", blurb: "Light and bold name with a round photo and ring markers.", tags: ["photo"], exampleSlug: "computer-science" },
  { id: "elegant", name: "Elegant Line", blurb: "Thin spaced letters and a fine accent rule. Calm and refined.", tags: ["simple"], exampleSlug: "midwifery" },
  { id: "timeline", name: "Bold Timeline", blurb: "Heavy name and a timeline that makes experience easy to scan.", tags: ["simple"], exampleSlug: "teaching" },
  { id: "band", name: "Soft Band", blurb: "Large serif name with a soft grey band for contact and summary.", tags: ["simple"], exampleSlug: "accounting" },
  { id: "slateBand", name: "Slate Band", blurb: "Grey column, colour band and square timeline markers.", tags: ["photo"], exampleSlug: "architecture" },
  { id: "navyRing", name: "Navy Ring", blurb: "Big ringed photo with a confident, heavy name.", tags: ["photo"], exampleSlug: "national-service" },
  { id: "mono", name: "Mono Split", blurb: "Black and white with the photo in the side column.", tags: ["photo"], exampleSlug: "marketing" },
  { id: "accent", name: "Accent Portrait", blurb: "Tall portrait, accent stripe and a skills footer.", tags: ["photo"], exampleSlug: "data-science" },

  // Plain, recruiter-style layouts. One column and no photo is the safest for applicant tracking systems.
  { id: "ruledClassic", name: "Ruled Classic", blurb: "Centred name, heavy rules and employer-first entries. Reads like a proper CV.", tags: ["simple", "ats"], exampleSlug: "medicine" },
  { id: "serifExecutive", name: "Serif Executive", blurb: "Serif name, a strong rule and skills grouped by type.", tags: ["simple", "ats"], exampleSlug: "business-administration" },
  { id: "serifNavy", name: "Serif Navy", blurb: "The serif layout in navy with one line for your areas of expertise.", tags: ["simple", "ats"], exampleSlug: "data-science" },
  { id: "greyBars", name: "Grey Bars", blurb: "Soft grey bars behind each heading and skills in three columns.", tags: ["simple", "ats"], exampleSlug: "banking" },
  { id: "dividedSimple", name: "Divided Simple", blurb: "Light, open name and a thin line above every section.", tags: ["simple", "ats"], exampleSlug: "marketing" },
  { id: "iconLine", name: "Icon Line", blurb: "Bold centred name with a neat row of contact icons.", tags: ["simple", "ats"], exampleSlug: "economics" },
  { id: "dateColumn", name: "Date Column", blurb: "Dates on the left so your timeline is clear at a glance.", tags: ["simple", "ats"], exampleSlug: "information-technology" },
  { id: "lavenderBand", name: "Lavender Band", blurb: "Spaced name and soft tinted bands behind each heading.", tags: ["simple", "ats"], exampleSlug: "journalism" },
  { id: "spacedRule", name: "Spaced Rule", blurb: "Widely spaced bold name, small spaced headings and heavy rules. Plain and very easy to scan.", tags: ["simple", "ats"], exampleSlug: "electrical-engineering" },
  { id: "labelColumn", name: "Label Column", blurb: "Section names in a left column with the details beside them, under a heavy rule.", tags: ["simple", "ats"], exampleSlug: "human-resource-management" },
  { id: "accentIcons", name: "Accent Icons", blurb: "Colour on your role and employers, icon contacts, large headings and dashed dividers.", tags: ["simple", "ats"], exampleSlug: "public-health" },
  { id: "contactRight", name: "Contact Right", blurb: "Big bold name with your contacts stacked on the right. Clean title-case headings and thin rules.", tags: ["simple", "ats"], exampleSlug: "marketing" },
  { id: "photoClassic", name: "Photo Classic", blurb: "Photo beside your name and contact details. Only add a photo if the employer expects one.", tags: ["photo"], exampleSlug: "civil-engineering" },

  // Two-column layouts. Neat and modern, though some tracking systems read single columns more reliably.
  { id: "sideTimeline", name: "Side Timeline", blurb: "Bold name, side column for contacts and skills, experience on a timeline.", tags: ["simple"], exampleSlug: "mechanical-engineering" },
  { id: "sideStripe", name: "Side Stripe", blurb: "Wide side column with accent strips along the top and bottom.", tags: ["simple"], exampleSlug: "midwifery" },
  { id: "sidePanel", name: "Side Panel", blurb: "Grey panel with your name on it and a timeline for work and school.", tags: ["simple"], exampleSlug: "pharmacy" },
  { id: "thinSplit", name: "Thin Split", blurb: "Light name with contacts on the right and a slim side column.", tags: ["simple"], exampleSlug: "law" },
  { id: "gridLeft", name: "Grid Left", blurb: "Centred name over a ruled grid. Organised and calm.", tags: ["simple"], exampleSlug: "agriculture" },
  { id: "gridBand", name: "Grid Band", blurb: "Tinted header block with icons, ruled grid and a timeline.", tags: ["simple"], exampleSlug: "medical-laboratory-science" },
  { id: "gridSpaced", name: "Grid Spaced", blurb: "Widely spaced name and a ruled two-column grid.", tags: ["simple"], exampleSlug: "architecture" },
];

/**
 * The templates shown in the homepage's "Find your style" section. Photos are optional and not every
 * employer wants one, so only a few photo designs are shown (seven), mixed in among the plain ATS-safe
 * ones. The first two cards are plain designs showing the Medicine and Information Technology CVs.
 */
// The first two cards show the courses students ask for most: Medicine, then Information Technology. Neither uses a photo.
const HOMEPAGE_FIRST = ["ruledClassic", "dateColumn"] as const;
const HOMEPAGE_PHOTO_IDS: CvTemplateName[] = ["sage", "tealHeader", "softBars", "greyHeader", "cleanRule", "blueDiagonal", "navyPanel"];

export function homepageTemplates(): TemplateInfo[] {
  const byId = (id: CvTemplateName) => templates.find((t) => t.id === id);
  const first = HOMEPAGE_FIRST.flatMap((id) => byId(id) ?? []);
  const photo = HOMEPAGE_PHOTO_IDS.flatMap((id) => byId(id) ?? []);
  const plain = templates.filter(
    (t) => t.tags.includes("ats") && !(HOMEPAGE_FIRST as readonly string[]).includes(t.id) && !HOMEPAGE_PHOTO_IDS.includes(t.id),
  );

  // Alternate photo and plain designs, so the first few cards already show some variety
  const mixed: TemplateInfo[] = [];
  for (let i = 0; i < Math.max(photo.length, plain.length); i++) {
    if (photo[i]) mixed.push(photo[i]);
    if (plain[i]) mixed.push(plain[i]);
  }
  return [...first, ...mixed];
}

/** Two-column layouts, which some hiring software reads less reliably than one column. */
const TWO_COLUMN = new Set<CvTemplateName>([
  "sideTimeline", "sideStripe", "sidePanel", "thinSplit", "gridLeft", "gridBand", "gridSpaced",
]);

export const isTwoColumn = (id: CvTemplateName) => TWO_COLUMN.has(id);

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

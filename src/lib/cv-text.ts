import type { CvDoc } from "./cv-examples";

/**
 * Writes a CV out as plain text, the way a PDF or Word file would read when its
 * text is extracted. Used to check a CV from the builder with the same code that
 * checks uploaded files, so both are scored by exactly the same rules.
 */
export function cvToText(doc: CvDoc, role = ""): string {
  const out: string[] = [doc.name.toUpperCase()];
  if (role) out.push(role);
  if (doc.contact.length) out.push(doc.contact.join(" | "));

  if (doc.summary) out.push("", "SUMMARY", doc.summary);

  if (doc.experience.length) {
    out.push("", "EXPERIENCE");
    for (const job of doc.experience) {
      out.push(`${job.title}, ${job.place} ${job.date}`.trim());
      for (const b of job.bullets) out.push(`• ${b}`);
    }
  }

  if (doc.education.length) {
    out.push("", "EDUCATION");
    for (const e of doc.education) out.push(`${e.degree}, ${e.school} ${e.date}`.trim());
  }

  if (doc.projects?.length) {
    out.push("", "PROJECTS");
    for (const p of doc.projects) out.push(`• ${p.name}: ${p.detail}`);
  }

  if (doc.skills.length) out.push("", "SKILLS", doc.skills.join(", "));
  if (doc.languages?.length) out.push("", "LANGUAGES", doc.languages.join(", "));
  if (doc.certifications?.length) out.push("", "CERTIFICATIONS", ...doc.certifications.map((c) => `• ${c}`));
  if (doc.research?.length) out.push("", "RESEARCH", ...doc.research.map((r) => `• ${r}`));
  if (doc.publications?.length) out.push("", "PUBLICATIONS", ...doc.publications.map((p) => `• ${p}`));
  if (doc.presentations?.length) out.push("", "PRESENTATIONS", ...doc.presentations.map((p) => `• ${p}`));
  if (doc.awards?.length) out.push("", "AWARDS", ...doc.awards.map((a) => `• ${a}`));
  if (doc.interests?.length) out.push("", "INTERESTS", doc.interests.join(", "));

  return out.join("\n");
}

/**
 * CV versions: the same CV in several looks, so a student can send a different design (and a role
 * line that matches the job) to each company. A version never copies the CV's details; it is only a
 * template, a colour and a role line laid over the one saved CV, so editing the CV in the builder
 * changes every version at once.
 */

import { uid, type BuilderCv } from "./builder";
import type { CvTemplateName } from "./cv-examples";
import { siteConfig } from "./site";
import { templates } from "./templates";

export type CvVersion = {
  id: string;
  /** What the student calls it, such as the company and job: "MTN Ghana, Data Analyst Intern". */
  label: string;
  /** The role line under the name. Empty means the CV's own. */
  role: string;
  template: CvTemplateName;
  /** Accent colour, or null for the template's own. */
  accent: string | null;
};

/** Most versions one CV may have. Set in src/lib/site.ts. */
export const MAX_VERSIONS = siteConfig.cvVersions.max;

const STORAGE_KEY = "cv11-versions-v1";

/** The templates worth offering for this CV: photo designs only when the CV has a photo, plain ATS-safe ones first. */
export function templatePool(base: Pick<BuilderCv, "photo" | "template">): CvTemplateName[] {
  const usable = templates.filter((t) => base.photo || !t.tags.includes("photo"));
  const safe = usable.filter((t) => t.tags.includes("ats")).map((t) => t.id);
  const rest = usable.filter((t) => !t.tags.includes("ats")).map((t) => t.id);
  // The CV's own template always leads, so the first version looks like the CV the student built
  return [base.template, ...[...safe, ...rest].filter((id) => id !== base.template)];
}

/** A new version, starting from a template. */
export const newVersion = (template: CvTemplateName, label = ""): CvVersion => ({ id: uid(), label, role: "", template, accent: null });

/** `count` versions, each with a different template (they repeat only when there are more versions than templates). */
export function mixedVersions(base: Pick<BuilderCv, "photo" | "template">, count: number): CvVersion[] {
  const pool = templatePool(base);
  return Array.from({ length: count }, (_, i) => newVersion(pool[i % pool.length], `Version ${i + 1}`));
}

/** The CV a version stands for: the saved CV with the version's look and role laid over it. */
export function deriveCv(base: BuilderCv, version: CvVersion): BuilderCv {
  return {
    ...base,
    template: version.template,
    role: version.role.trim() || base.role,
    accent: version.accent ?? base.accent,
  };
}

/** A safe file name for a version's PDF, such as "Ama_Mensah_MTN_Ghana_Data_Analyst_CV". */
export function versionFileName(base: Pick<BuilderCv, "name">, version: CvVersion, used: Set<string> = new Set()): string {
  const part = (text: string) => text.normalize("NFKD").replace(/[^\p{L}\p{N}]+/gu, "_").replace(/^_+|_+$/g, "");
  const stem = [part(base.name) || "My", part(version.label || version.role)].filter(Boolean).join("_").slice(0, 80);
  let name = `${stem}_CV`;
  for (let n = 2; used.has(name.toLowerCase()); n++) name = `${stem}_${n}_CV`;
  used.add(name.toLowerCase());
  return name;
}

/** Versions saved in this browser. Only a convenience, so a blocked store just means starting fresh. */
export function loadVersions(): CvVersion[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list = raw ? (JSON.parse(raw) as CvVersion[]) : null;
    return Array.isArray(list) && list.length > 0 ? list.slice(0, MAX_VERSIONS) : null;
  } catch {
    return null;
  }
}

export function saveVersions(versions: CvVersion[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(versions));
  } catch {}
}

import { BUILDER_STORAGE_KEY } from "@/lib/builder";
import { STORAGE_KEY as APPLICATIONS_KEY } from "@/lib/applications";
import { SIGNATURE_KEY } from "@/components/builder/signature-pad";

/**
 * Everything a student has made lives in their browser. A backup is one small bundle holding all
 * of it, so they can move to a new phone or recover after clearing their browser data. It is used
 * for the downloadable backup file and for saving to a student's account. Only the keys listed
 * here are ever saved or restored.
 */
const BACKUP_KEYS = [
  BUILDER_STORAGE_KEY, // the CV
  "cv11-letter-v1", // the letter in progress
  SIGNATURE_KEY, // the signature
  APPLICATIONS_KEY, // the application tracker
  "cv11-nss-checklist-v1", // the national service checklist
] as const;

/** The saved data, keyed by browser storage key. */
export type BackupData = Record<string, string>;

type BackupFile = {
  app: "cv11";
  version: 1;
  createdAt: string;
  data: BackupData;
};

/** True when there is a CV in this browser worth backing up. */
export function hasBackupData(): boolean {
  try {
    return localStorage.getItem(BUILDER_STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

/** Gathers everything saved in this browser, or null when there is nothing to save. */
export function collectBackup(): BackupData | null {
  const data: BackupData = {};
  try {
    for (const key of BACKUP_KEYS) {
      const value = localStorage.getItem(key);
      if (value !== null) data[key] = value;
    }
  } catch {
    return null;
  }
  return Object.keys(data).length ? data : null;
}

/** Downloads a backup file of everything saved in this browser. Returns false if there was nothing to save. */
export function downloadBackup(): boolean {
  const data = collectBackup();
  if (!data) return false;

  const file: BackupFile = { app: "cv11", version: 1, createdAt: new Date().toISOString(), data };
  const url = URL.createObjectURL(new Blob([JSON.stringify(file)], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `CV11-backup-${file.createdAt.slice(0, 10)}.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return true;
}

/**
 * Writes backed-up data into this browser, replacing what is saved. Throws an Error with a plain
 * message if the data is not a usable CV11 backup, and writes nothing in that case.
 */
export function applyBackup(data: unknown): void {
  if (typeof data !== "object" || data === null) throw new Error("That is not a CV11 backup.");
  const source = data as Record<string, unknown>;

  // Check everything first, so bad data never leaves half a backup behind
  const entries = BACKUP_KEYS.flatMap((key) => {
    const value = source[key];
    return typeof value === "string" ? [[key, value] as const] : [];
  });
  const cv = entries.find(([key]) => key === BUILDER_STORAGE_KEY);
  if (!cv) throw new Error("That backup has no CV in it.");
  try {
    JSON.parse(cv[1]);
  } catch {
    throw new Error("That backup is damaged, so we could not restore it.");
  }

  try {
    for (const [key, value] of entries) localStorage.setItem(key, value);
  } catch {
    throw new Error("This browser would not let us save the backup. Check that private browsing is off.");
  }
}

/** Restores a downloaded backup file. Throws an Error with a plain message if it cannot be used. */
export async function restoreBackup(file: File): Promise<void> {
  let parsed: Partial<BackupFile> | null;
  try {
    parsed = JSON.parse(await file.text());
  } catch {
    throw new Error("That file is not a CV11 backup.");
  }
  if (parsed?.app !== "cv11") throw new Error("That file is not a CV11 backup.");
  applyBackup(parsed.data);
}

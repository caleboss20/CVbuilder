"use client";

import { useRef, useState } from "react";
import { downloadBackup, hasBackupData, restoreBackup } from "@/lib/backup";
import { trackEvent } from "@/lib/track";
import { CloudSyncPanel } from "./cloud-sync-panel";
import { ConfirmDialog } from "./confirm-dialog";

/**
 * Save a backup file, or restore one. Everything lives in the browser, so this is how a student
 * moves to a new phone or recovers after clearing their data. Restoring reloads the page so every
 * screen picks up the restored CV.
 */
export function BackupCard({ restoreOnly = false }: { restoreOnly?: boolean }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function save() {
    setError("");
    if (downloadBackup()) {
      trackEvent("cv_backup_saved");
      setMessage("Backup saved. Keep the file somewhere safe, like WhatsApp to yourself or Google Drive.");
    } else {
      setMessage("");
      setError("There is nothing to back up yet. Start your CV first.");
    }
  }

  async function restore(file: File) {
    try {
      await restoreBackup(file);
      window.location.reload();
    } catch (e) {
      setMessage("");
      setError(e instanceof Error ? e.message : "We could not restore that file.");
    }
  }

  function choose(file: File | undefined) {
    if (!file) return;
    setError("");
    // Restoring replaces the CV on this device, so ask first if there is one
    if (hasBackupData()) setPending(file);
    else void restore(file);
  }

  return (
    <div className="mt-5 rounded-xl border border-fg/10 bg-fg/[0.03] p-4">
      <p className="text-sm font-medium text-fg">{restoreOnly ? "Moving from another phone?" : "Back up your CV"}</p>
      <p className="mt-1 text-xs leading-relaxed text-fg/55">
        {restoreOnly
          ? "If you saved a CV11 backup file, restore it here to carry on where you stopped."
          : "Your CV is saved on this device only. Save a backup file to keep it safe, or to move to a new phone."}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {!restoreOnly && (
          <button type="button" onClick={save} className="rounded-md px-3 py-2 text-sm font-medium text-fg ring-1 ring-fg/15 hover:bg-fg/5">
            Save backup
          </button>
        )}
        <button type="button" onClick={() => inputRef.current?.click()} className="rounded-md px-3 py-2 text-sm font-medium text-fg ring-1 ring-fg/15 hover:bg-fg/5">
          Restore backup
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          onChange={(e) => {
            choose(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>
      {message && <p className="mt-2 text-xs text-emerald-300">{message}</p>}
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

      <CloudSyncPanel loadOnly={restoreOnly} />

      {pending && (
        <ConfirmDialog
          title="Replace the CV on this device?"
          message="Restoring a backup replaces the CV, letter and signature saved here with the ones in the file. Save a backup first if you want to keep what you have now."
          confirmLabel="Restore backup"
          cancelLabel="Keep what I have"
          onCancel={() => setPending(null)}
          onConfirm={() => {
            const file = pending;
            setPending(null);
            void restore(file);
          }}
        />
      )}
    </div>
  );
}

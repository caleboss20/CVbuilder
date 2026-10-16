"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useUser } from "@/components/auth/use-user";
import { getCloudInfo, loadFromCloud, saveToCloud, type CloudInfo } from "@/lib/cloud-sync";
import { hasBackupData } from "@/lib/backup";
import { authConfigured } from "@/lib/supabase";
import { ConfirmDialog } from "./confirm-dialog";

const buttonClass = "rounded-md px-3 py-2 text-sm font-medium text-fg ring-1 ring-fg/15 hover:bg-fg/5 disabled:opacity-40";

/** "16 Oct, 14:20", the way people write dates in Ghana. */
const formatWhen = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

/**
 * Keeps the student's CV in their account, so it opens on any phone. Saving and loading are always
 * a button press, so a copy is never replaced without them choosing it. Shows nothing until
 * accounts are switched on.
 */
export function CloudSyncPanel({ loadOnly = false }: { loadOnly?: boolean }) {
  const { user, loading } = useUser();
  const [info, setInfo] = useState<CloudInfo>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [confirmLoad, setConfirmLoad] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setInfo(await getCloudInfo());
    } catch {
      setInfo(null);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetching the saved-copy details once signed in
    if (user) void refresh();
  }, [user, refresh]);

  if (!authConfigured || loading) return null;

  if (!user) {
    return (
      <p className="mt-4 border-t border-fg/10 pt-4 text-xs leading-relaxed text-fg/55">
        <Link href="/login" className="text-brand-300 underline">
          Log in
        </Link>{" "}
        to keep your CV in your account and open it on any phone.
      </p>
    );
  }

  async function run(action: () => Promise<void>, done: string, reload = false) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await action();
      if (reload) {
        window.location.reload();
        return;
      }
      setMessage(done);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4 border-t border-fg/10 pt-4">
      <p className="text-sm font-medium text-fg">Your account</p>
      <p className="mt-1 text-xs text-fg/55">
        {info ? `Last saved to your account: ${formatWhen(info.updatedAt)}.` : "Nothing saved to your account yet."}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {!loadOnly && (
          <button type="button" disabled={busy} onClick={() => run(saveToCloud, "Saved to your account.")} className={buttonClass}>
            Save to my account
          </button>
        )}
        <button
          type="button"
          disabled={busy || !info}
          // Loading replaces the CV on this device, so ask first if there is one
          onClick={() => (hasBackupData() ? setConfirmLoad(true) : run(loadFromCloud, "", true))}
          className={buttonClass}
        >
          Load from my account
        </button>
      </div>
      {message && <p className="mt-2 text-xs text-emerald-300">{message}</p>}
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

      {confirmLoad && (
        <ConfirmDialog
          title="Replace the CV on this device?"
          message="Loading your account copy replaces the CV, letter and signature saved on this device. Save to your account first if you want to keep what you have now."
          confirmLabel="Load from my account"
          cancelLabel="Keep what I have"
          onCancel={() => setConfirmLoad(false)}
          onConfirm={() => {
            setConfirmLoad(false);
            void run(loadFromCloud, "", true);
          }}
        />
      )}
    </div>
  );
}

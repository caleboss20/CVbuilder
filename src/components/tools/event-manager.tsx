"use client";

import { useCallback, useEffect, useState } from "react";
import { addRecipients, listRecipients, removeRecipient, renameRecipient, updateSharedEvent, type Recipient, type SharedEvent } from "@/lib/cert-share";
import { parseNames } from "@/lib/certificate-names";

const field = "mt-1.5 block h-10 w-full rounded-md bg-fg/5 px-3 text-[15px] text-fg ring-1 ring-fg/15 focus:outline-none focus:ring-2 focus:ring-brand-400";
const smallButton = "inline-flex h-8 items-center justify-center rounded-md px-2.5 text-sm font-medium text-fg ring-1 ring-fg/20 hover:bg-fg/5 disabled:opacity-50";

/**
 * Opens under a saved link so the organiser can fix things after sharing: add a late name, correct a
 * spelling, remove someone, change the event code or keep the link working for longer.
 */
export function EventManager({ event, onChanged }: { event: SharedEvent; onChanged: () => void }) {
  const [people, setPeople] = useState<Recipient[]>([]);
  const [code, setCode] = useState(event.code ?? "");
  const [extend, setExtend] = useState(0);
  const [newNames, setNewNames] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  const load = useCallback(() => {
    listRecipients(event.id).then(setPeople);
  }, [event.id]);
  useEffect(() => {
    load();
  }, [load]);

  /** Runs a change, then reloads the list and tells the organiser how it went. */
  async function run(change: () => Promise<string | void>) {
    setBusy(true);
    setNote("");
    try {
      setNote((await change()) ?? "");
    } catch (e) {
      setNote(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    }
    setBusy(false);
    load();
    onChanged();
  }

  const saveSettings = () =>
    run(async () => {
      const trimmed = code.trim();
      if (trimmed && trimmed.length < 2) return "The event code needs at least 2 characters.";
      return (await updateSharedEvent(event.id, trimmed, extend)) ? "Saved." : "We could not save that. Please try again.";
    });

  const addNames = () =>
    run(async () => {
      const { names } = parseNames(newNames);
      if (names.length === 0) return "Type at least one name.";
      const added = await addRecipients(event.id, names);
      setNewNames("");
      return added === 0 ? "Those names were already on the list." : `Added ${added}.`;
    });

  const rename = (person: Recipient) =>
    run(async () => {
      const next = window.prompt("Correct the name:", person.name)?.trim();
      if (!next || next === person.name) return;
      return (await renameRecipient(person.id, next)) ? "Name updated." : "We could not change that name.";
    });

  const remove = (person: Recipient) =>
    run(async () => {
      if (!window.confirm(`Remove ${person.name}? Their certificate link will stop working.`)) return;
      return (await removeRecipient(person.id)) ? "Removed." : "We could not remove that name.";
    });

  return (
    <div className="mt-3 space-y-4 rounded-lg bg-fg/5 p-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm font-medium text-fg/80">
          Event code
          <input value={code} onChange={(e) => setCode(e.target.value)} className={field} placeholder="None" maxLength={40} />
        </label>
        <label className="block text-sm font-medium text-fg/80">
          Keep the link working for
          <select value={extend} onChange={(e) => setExtend(Number(e.target.value))} className={field}>
            <option value={0}>No change</option>
            <option value={30}>30 more days</option>
            <option value={90}>90 more days</option>
            <option value={365}>1 more year</option>
          </select>
        </label>
      </div>
      <button type="button" onClick={saveSettings} disabled={busy} className={smallButton}>Save code and time</button>

      <div>
        <p className="text-sm font-medium text-fg/80">Add names</p>
        <textarea value={newNames} onChange={(e) => setNewNames(e.target.value)} rows={3} placeholder="One name per line" className="mt-1.5 block w-full rounded-md bg-fg/5 px-3 py-2 text-[15px] text-fg ring-1 ring-fg/15 focus:outline-none focus:ring-2 focus:ring-brand-400" />
        <button type="button" onClick={addNames} disabled={busy || !newNames.trim()} className={`${smallButton} mt-2`}>Add these names</button>
      </div>

      <div>
        <p className="text-sm font-medium text-fg/80">{people.length} on the list</p>
        <ul className="mt-1.5 max-h-56 space-y-1 overflow-y-auto pr-1">
          {people.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-2 text-sm">
              <span className="min-w-0 truncate text-fg/75">{p.name}</span>
              <span className="flex shrink-0 gap-1.5">
                <button type="button" onClick={() => rename(p)} disabled={busy} className={smallButton}>Edit</button>
                <button type="button" onClick={() => remove(p)} disabled={busy} className={smallButton}>Remove</button>
              </span>
            </li>
          ))}
        </ul>
      </div>
      {note && <p className="text-sm text-fg/75" role="status">{note}</p>}
    </div>
  );
}

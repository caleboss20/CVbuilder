"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addDays,
  blankApplication,
  followUpState,
  loadApplications,
  saveApplications,
  shortDate,
  statuses,
  type Application,
  type ApplicationStatus,
} from "@/lib/applications";
import { ConfirmDialog } from "@/components/builder/confirm-dialog";

/*
 * A simple list of where a student has applied, what stage each one is at, and when
 * to follow up. Everything is saved on the student's own device.
 */

const FIELD =
  "w-full rounded-lg border border-fg/12 bg-ink-950/60 px-3.5 py-2.5 text-[15px] text-fg placeholder:text-fg/35 focus:border-brand-400/70 focus:outline-none";

export function ApplicationTracker() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loaded, setLoaded] = useState(false);
  /** Today as "YYYY-MM-DD", set after mount so server and browser never disagree about the date. */
  const [today, setToday] = useState("");
  const [filter, setFilter] = useState<"all" | ApplicationStatus>("all");
  /** The application in the form, or null when the form is closed. `isNew` tells add from edit. */
  const [editing, setEditing] = useState<{ app: Application; isNew: boolean } | null>(null);
  const [deleting, setDeleting] = useState<Application | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read once from storage after mount
    setApps(loadApplications());
    setToday(new Date().toISOString().slice(0, 10));
    setLoaded(true);
  }, []);

  // Save after every change, but not before the saved list has been read
  useEffect(() => {
    if (loaded) saveApplications(apps);
  }, [apps, loaded]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: apps.length };
    for (const s of statuses) c[s.id] = apps.filter((a) => a.status === s.id).length;
    return c;
  }, [apps]);

  /** Follow-ups that need attention now, so the student sees them first. */
  const due = apps.filter((a) => ["overdue", "today"].includes(followUpState(a, today)));

  const shown = useMemo(() => {
    const rank = { overdue: 0, today: 1, soon: 2, later: 3, none: 4 } as const;
    return apps
      .filter((a) => filter === "all" || a.status === filter)
      .sort((a, b) => rank[followUpState(a, today)] - rank[followUpState(b, today)] || b.applied.localeCompare(a.applied));
  }, [apps, filter, today]);

  function save(app: Application) {
    setApps((list) => (list.some((a) => a.id === app.id) ? list.map((a) => (a.id === app.id ? app : a)) : [app, ...list]));
    setEditing(null);
  }

  function changeStatus(id: string, status: ApplicationStatus) {
    setApps((list) => list.map((a) => (a.id === id ? { ...a, status } : a)));
  }

  return (
    <div>
      {/* Summary */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Filter by stage" className="flex flex-wrap gap-1.5">
          {[{ id: "all", label: "All" }, ...statuses].map((s) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={filter === s.id}
              onClick={() => setFilter(s.id as "all" | ApplicationStatus)}
              className={`rounded-md px-3.5 py-2 text-sm transition-colors sm:py-1.5 ${
                filter === s.id ? "bg-fg/10 text-fg ring-1 ring-fg/20" : "text-fg/55 hover:text-fg"
              }`}
            >
              {s.label} <span className="tabular-nums text-fg/45">{counts[s.id] ?? 0}</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setEditing({ app: blankApplication(), isNew: true })}
          className="rounded-md bg-brand-600 px-5 py-2.5 text-sm font-medium text-white ring-1 ring-brand-300/60 shadow-[0_0_18px_rgb(124_128_255/0.45)] hover:bg-brand-500"
        >
          + Add application
        </button>
      </div>

      {due.length > 0 && (
        <p className="mt-5 rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-fg/85">
          <span className="font-medium text-fg">
            {due.length} follow-up{due.length === 1 ? "" : "s"} due.
          </span>{" "}
          A short, polite message to the employer can move your application along.
        </p>
      )}

      {/* The list */}
      {loaded && apps.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-fg/20 p-8 text-center sm:p-12">
          <p className="text-lg font-medium text-fg">Nothing tracked yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-fg/60">
            Add each job, internship or national service you apply for, with the date and when to follow up. You will always know
            where you stand.
          </p>
          <button
            type="button"
            onClick={() => setEditing({ app: blankApplication(), isNew: true })}
            className="mt-5 rounded-md bg-brand-600 px-5 py-2.5 text-sm font-medium text-white ring-1 ring-brand-300/60 hover:bg-brand-500"
          >
            Add your first application
          </button>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {shown.map((a) => (
            <ApplicationCard
              key={a.id}
              app={a}
              today={today}
              onStatus={(s) => changeStatus(a.id, s)}
              onEdit={() => setEditing({ app: a, isNew: false })}
              onDelete={() => setDeleting(a)}
            />
          ))}
          {loaded && shown.length === 0 && <li className="py-10 text-center text-sm text-fg/50">Nothing at this stage.</li>}
        </ul>
      )}

      <p className="mt-8 text-center text-xs text-fg/45">Saved on this device only. We never see your applications.</p>

      {editing && <ApplicationForm app={editing.app} isNew={editing.isNew} onSave={save} onClose={() => setEditing(null)} />}
      {deleting && (
        <ConfirmDialog
          title="Delete this application?"
          message={`${deleting.company || "This application"} will be removed from your list. This cannot be undone.`}
          confirmLabel="Delete"
          cancelLabel="Keep it"
          onCancel={() => setDeleting(null)}
          onConfirm={() => {
            setApps((list) => list.filter((a) => a.id !== deleting.id));
            setDeleting(null);
          }}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

const FOLLOW_UP_BADGE = {
  overdue: { text: "Follow-up overdue", cls: "bg-red-400/15 text-red-300" },
  today: { text: "Follow up today", cls: "bg-amber-400/20 text-amber-300" },
  soon: { text: "Follow up soon", cls: "bg-brand-500/20 text-brand-300" },
} as const;

function ApplicationCard({
  app,
  today,
  onStatus,
  onEdit,
  onDelete,
}: {
  app: Application;
  today: string;
  onStatus: (s: ApplicationStatus) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const state = followUpState(app, today);
  const badge = state === "overdue" || state === "today" || state === "soon" ? FOLLOW_UP_BADGE[state] : null;
  const tone = statuses.find((s) => s.id === app.status)?.tone ?? "";

  return (
    <li className="rounded-xl border border-fg/10 bg-fg/[0.03] p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium text-fg">{app.company || "Untitled"}</p>
          <p className="truncate text-sm text-fg/60">{app.role}</p>
        </div>

        <label className="shrink-0">
          <span className="sr-only">Stage of {app.company}</span>
          <select
            value={app.status}
            onChange={(e) => onStatus(e.target.value as ApplicationStatus)}
            className={`appearance-none rounded-md px-3.5 py-1.5 text-sm font-medium focus:outline-2 focus:outline-brand-400 ${tone}`}
          >
            {statuses.map((s) => (
              <option key={s.id} value={s.id} className="bg-ink-900 text-fg">
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-fg/55">
        {app.applied && <span>Applied {shortDate(app.applied)}</span>}
        {app.followUp && app.status !== "closed" && app.status !== "offer" && <span>Follow up {shortDate(app.followUp)}</span>}
        {badge && <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.cls}`}>{badge.text}</span>}
        {app.link && (
          <a href={app.link} target="_blank" rel="noopener noreferrer" className="text-brand-300 hover:text-fg">
            Open advert ↗
          </a>
        )}
      </div>

      {app.notes && <p className="mt-3 line-clamp-2 text-sm text-fg/55">{app.notes}</p>}

      <div className="mt-3 flex gap-4 text-sm">
        <button type="button" onClick={onEdit} className="py-1 text-brand-300 hover:text-fg">
          Edit
        </button>
        <button type="button" onClick={onDelete} className="py-1 text-fg/45 hover:text-red-300">
          Delete
        </button>
      </div>
    </li>
  );
}

function ApplicationForm({
  app,
  isNew,
  onSave,
  onClose,
}: {
  app: Application;
  isNew: boolean;
  onSave: (a: Application) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(app);
  const set = (patch: Partial<Application>) => setDraft((d) => ({ ...d, ...patch }));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const canSave = draft.company.trim() !== "";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isNew ? "Add an application" : "Edit application"}
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/80 p-3 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          if (canSave) onSave({ ...draft, company: draft.company.trim(), role: draft.role.trim() });
        }}
        className="max-h-[92vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-2xl border border-fg/10 bg-ink-900 p-5 shadow-[0_0_80px_-20px_rgb(124_128_255/0.6)] sm:p-6"
      >
        <h2 className="text-lg font-medium text-fg">{isNew ? "Add an application" : "Edit application"}</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-fg/80">Company or organisation</span>
            <input value={draft.company} onChange={(e) => set({ company: e.target.value })} placeholder="GCB Bank" className={FIELD} autoFocus />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-fg/80">Role</span>
            <input value={draft.role} onChange={(e) => set({ role: e.target.value })} placeholder="Customer Service Intern" className={FIELD} />
          </label>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-fg/80">Stage</span>
          <select value={draft.status} onChange={(e) => set({ status: e.target.value as ApplicationStatus })} className={FIELD}>
            {statuses.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-fg/80">Date applied</span>
            <input
              type="date"
              value={draft.applied}
              onChange={(e) => {
                const applied = e.target.value;
                // Suggest following up a week later, unless they already chose a date
                set({ applied, followUp: draft.followUp || (applied ? addDays(applied, 7) : "") });
              }}
              className={FIELD}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-fg/80">Follow up on</span>
            <input type="date" value={draft.followUp} onChange={(e) => set({ followUp: e.target.value })} className={FIELD} />
          </label>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-fg/80">Link to the advert (optional)</span>
          <input type="url" value={draft.link} onChange={(e) => set({ link: e.target.value })} placeholder="https://" className={FIELD} />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-fg/80">Notes (optional)</span>
          <textarea
            rows={3}
            value={draft.notes}
            onChange={(e) => set({ notes: e.target.value })}
            placeholder="Contact person, interview date, what they asked for"
            className={`${FIELD} resize-y`}
          />
        </label>

        <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="rounded-md px-4 py-2.5 text-sm font-medium text-fg ring-1 ring-fg/20 hover:bg-fg/5">
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSave}
            className="rounded-md bg-brand-600 px-5 py-2.5 text-sm font-medium text-white ring-1 ring-brand-300/60 hover:bg-brand-500 disabled:opacity-40"
          >
            {isNew ? "Add application" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

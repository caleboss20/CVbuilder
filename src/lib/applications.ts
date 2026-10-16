/*
 * Application tracker data: the jobs, internships and national service placements a
 * student has applied for. Saved only in the student's browser (localStorage), so it
 * needs no account and nothing about their applications ever leaves their device.
 */

export type ApplicationStatus = "saved" | "applied" | "interview" | "offer" | "closed";

export type Application = {
  id: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  /** Dates are plain "YYYY-MM-DD" strings, exactly what <input type="date"> uses. */
  applied: string;
  followUp: string;
  link: string;
  notes: string;
};

export const STORAGE_KEY = "cv11-applications-v1";

/** In the order a student moves through them. */
export const statuses: { id: ApplicationStatus; label: string; tone: string }[] = [
  { id: "saved", label: "Saved", tone: "bg-fg/10 text-fg/70" },
  { id: "applied", label: "Applied", tone: "bg-brand-500/20 text-brand-300" },
  { id: "interview", label: "Interview", tone: "bg-amber-400/20 text-amber-300" },
  { id: "offer", label: "Offer", tone: "bg-emerald-400/20 text-emerald-300" },
  { id: "closed", label: "Not selected", tone: "bg-red-400/15 text-red-300" },
];

export const statusLabel = (s: ApplicationStatus) => statuses.find((x) => x.id === s)?.label ?? s;

/** A short random id for a new entry. Only called from a click, never during render. */
export const newId = () => Math.random().toString(36).slice(2, 10);

export const blankApplication = (): Application => ({
  id: newId(),
  company: "",
  role: "",
  status: "applied",
  applied: "",
  followUp: "",
  link: "",
  notes: "",
});

/** "2026-10-16" plus 7 days is "2026-10-23". Works on the date alone, so time zones cannot shift it. */
export function addDays(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return date.toISOString().slice(0, 10);
}

/** How a follow-up date relates to today. Closed and offered applications never need one. */
export type FollowUpState = "overdue" | "today" | "soon" | "later" | "none";

export function followUpState(app: Application, today: string): FollowUpState {
  if (!app.followUp || app.status === "closed" || app.status === "offer") return "none";
  if (app.followUp < today) return "overdue";
  if (app.followUp === today) return "today";
  return app.followUp <= addDays(today, 3) ? "soon" : "later";
}

/** Nicely written date for the list: "23 Oct". Parsed by hand to avoid time zone shifts. */
export function shortDate(isoDate: string): string {
  if (!isoDate) return "";
  const [, m, d] = isoDate.split("-").map(Number);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${d} ${months[m - 1]}`;
}

export function loadApplications(): Application[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return []; // Blocked or corrupt storage: start with an empty list
  }
}

export function saveApplications(list: Application[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // Storage full or blocked: the list still works for this visit
  }
}

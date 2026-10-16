import { track } from "@vercel/analytics";

/**
 * The few moments that tell us whether CV11 is working. Names are fixed here so the
 * analytics dashboard stays tidy, and no personal details are ever sent with them.
 */
export type TrackedEvent =
  | "cv_downloaded" // a student downloaded their CV as a PDF for the first time
  | "letter_downloaded" // a student downloaded a letter
  | "letter_signed" // signed a letter they already had
  | "pro_waitlist" // tapped Join the Pro list, with what they would use most
  | "share_whatsapp" // tapped Share on WhatsApp after finishing
  | "cv_backup_saved"; // saved a backup file of their CV

/** Records an event. Analytics must never break the app, so any failure is ignored. */
export function trackEvent(name: TrackedEvent, data?: Record<string, string | number>) {
  try {
    track(name, data);
  } catch {
    /* ignore: analytics is optional */
  }
}

import { track } from "@vercel/analytics";
import { shouldSkipCounting } from "@/lib/owner";
import { recordEvent } from "@/lib/events";

/**
 * The few moments that tell us whether CV11 is working. Names are fixed here so the
 * analytics dashboard stays tidy, and no personal details are ever sent with them.
 */
export type TrackedEvent =
  | "cv_started" // a student began a new CV
  | "cv_downloaded" // a student downloaded their CV as a PDF for the first time
  | "letter_downloaded" // a student downloaded a letter
  | "letter_signed" // signed a letter they already had
  | "text_pdf_downloaded" // turned pasted text, an assignment or code into a PDF
  | "share_whatsapp" // tapped Share on WhatsApp after finishing
  | "cv_backup_saved" // saved a backup file of their CV
  | "certificates_made" // made a batch of certificates (the number made is sent, never the names)
  | "cv_versions_downloaded"; // downloaded one or more versions of a CV (the number is sent)

/** Records an event. Analytics must never break the app, so any failure is ignored. */
export function trackEvent(name: TrackedEvent, data?: Record<string, string | number>) {
  try {
    if (shouldSkipCounting()) return;
    track(name, data);
    // Our own counter, which keeps real totals we can read at any time
    recordEvent(name, data);
  } catch {
    /* ignore: analytics is optional */
  }
}

/**
 * Plain-language answer to "what does ATS-safe mean?". Shown on the templates page
 * and inside the builder's template picker, so the tag is explained wherever it
 * appears. A native <details> keeps it light: closed until a student wants it.
 */
export function AtsExplainer({ className = "" }: { className?: string }) {
  return (
    <details className={`group/ats rounded-lg border border-fg/10 bg-fg/[0.03] px-4 py-3 text-sm ${className}`}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-medium text-fg">
        What does “ATS-safe” mean?
        <span className="text-fg/45 transition-transform group-open/ats:rotate-45" aria-hidden="true">
          +
        </span>
      </summary>
      <div className="mt-3 space-y-2 leading-relaxed text-fg/65">
        <p>
          ATS stands for Applicant Tracking System. It is software some employers use to scan and sort CVs before a person
          reads them.
        </p>
        <p>
          ATS-safe templates use one column, plain headings and no photo, so the software reads every section in the right
          order. A photo does not get you rejected, but a plain layout is the safer choice. Two-column and photo designs look
          great when a person reads them, so use them when the employer will read your CV by eye.
        </p>
        <p>When in doubt, follow what the job advert asks for.</p>
      </div>
    </details>
  );
}

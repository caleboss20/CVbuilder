/** Real check mark icon (solid circle with a tick) used instead of a text "✓". */
export function CheckIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size }}
      className={`inline-grid shrink-0 place-items-center rounded-full bg-emerald-500 text-white ${className}`}
    >
      <svg width={size * 0.65} height={size * 0.65} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    </span>
  );
}

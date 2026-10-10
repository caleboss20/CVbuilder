"use client";

import { useId, useRef, useState, type ReactNode } from "react";

const inputCls =
  "w-full rounded-lg border border-fg/12 bg-fg/[0.03] px-3.5 py-2.5 text-[15px] text-fg placeholder:text-fg/30 transition-colors focus:border-brand-400/70 focus:bg-fg/[0.05] focus:outline-none";

export function Field({
  label,
  value,
  onChange,
  placeholder,
  hint,
  type = "text",
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  type?: string;
  autoComplete?: string;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-fg/80">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls}
      />
      {hint && <p className="mt-1.5 text-xs text-fg/45">{hint}</p>}
    </div>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  placeholder,
  hint,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: ReactNode;
  rows?: number;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-fg/80">
        {label}
      </label>
      <textarea
        id={id}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputCls} resize-y leading-relaxed`}
      />
      {hint && <div className="mt-1.5 text-xs text-fg/45">{hint}</div>}
    </div>
  );
}

/** Type and press Enter (or comma) to add; click × to remove. */
export function TagInput({
  label,
  values,
  onChange,
  placeholder,
  suggestions = [],
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
}) {
  const id = useId();
  const [draft, setDraft] = useState("");
  const add = (raw: string) => {
    const v = raw.trim().replace(/,$/, "");
    if (v && !values.includes(v)) onChange([...values, v]);
    setDraft("");
  };
  const unused = suggestions.filter((s) => !values.includes(s));

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-fg/80">
        {label}
      </label>
      <div className="flex flex-wrap gap-2 rounded-lg border border-fg/12 bg-fg/[0.03] p-2 focus-within:border-brand-400/70">
        {values.map((v) => (
          <span key={v} className="inline-flex items-center gap-1 rounded-md bg-brand-500/15 py-1 pl-2.5 pr-1 text-sm text-fg">
            {v}
            <button
              type="button"
              aria-label={`Remove ${v}`}
              onClick={() => onChange(values.filter((x) => x !== v))}
              className="grid size-5 place-items-center rounded text-fg/50 hover:bg-fg/10 hover:text-fg"
            >
              ×
            </button>
          </span>
        ))}
        <input
          id={id}
          value={draft}
          placeholder={values.length ? "" : placeholder}
          onChange={(e) => (e.target.value.endsWith(",") ? add(e.target.value) : setDraft(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add(draft);
            } else if (e.key === "Backspace" && !draft && values.length) {
              onChange(values.slice(0, -1));
            }
          }}
          onBlur={() => draft && add(draft)}
          className="min-w-[8rem] flex-1 bg-transparent px-1.5 py-1 text-[15px] text-fg placeholder:text-fg/30 focus:outline-none"
        />
      </div>
      {unused.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {unused.slice(0, 6).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onChange([...values, s])}
              className="rounded-md border border-dashed border-fg/20 px-2 py-0.5 text-xs text-fg/55 hover:border-brand-400/60 hover:text-fg"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Card wrapper for one item in a list (a job, a school…) with remove / reorder. */
export function ItemCard({
  title,
  onRemove,
  onUp,
  onDown,
  children,
}: {
  title: string;
  onRemove: () => void;
  onUp?: () => void;
  onDown?: () => void;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-fg/10 bg-fg/[0.02] p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="truncate text-sm font-medium text-fg">{title}</p>
        <div className="flex shrink-0 items-center gap-1">
          {onUp && <IconBtn label="Move up" onClick={onUp} d="M12 19V5M5 12l7-7 7 7" />}
          {onDown && <IconBtn label="Move down" onClick={onDown} d="M12 5v14M19 12l-7 7-7-7" />}
          <IconBtn label="Remove" onClick={onRemove} d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" danger />
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function IconBtn({ label, onClick, d, danger }: { label: string; onClick: () => void; d: string; danger?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`grid size-8 place-items-center rounded-md text-fg/45 transition-colors hover:bg-fg/10 ${
        danger ? "hover:text-red-400" : "hover:text-fg"
      }`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={d} />
      </svg>
    </button>
  );
}

export function AddButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-fg/20 py-3 text-sm font-medium text-fg/70 transition-colors hover:border-brand-400/60 hover:bg-brand-500/5 hover:text-fg"
    >
      <span className="text-lg leading-none text-brand-300">+</span>
      {children}
    </button>
  );
}

/** Reads an image, crops it square and shrinks it so it fits comfortably in storage. */
export function PhotoInput({ value, onChange }: { value?: string; onChange: (v?: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  async function handle(file: File) {
    setError("");
    if (!file.type.startsWith("image/")) return setError("Please choose an image file.");
    try {
      const bitmap = await createImageBitmap(file);
      const side = Math.min(bitmap.width, bitmap.height);
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 360;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("no canvas");
      // Square crop from the centre, nudged up a little so faces stay in frame
      const sx = (bitmap.width - side) / 2;
      const sy = Math.max(0, (bitmap.height - side) / 2 - side * 0.08);
      ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, 360, 360);
      onChange(canvas.toDataURL("image/jpeg", 0.85));
    } catch {
      setError("That image could not be read. Try a JPG or PNG.");
    }
  }

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-fg/80">Photo (optional)</p>
      <div className="flex items-center gap-4">
        <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-full border border-fg/12 bg-fg/[0.04]">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element -- local data URL preview
            <img src={value} alt="Your photo" className="size-full object-cover" />
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-fg/30" aria-hidden="true">
              <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M4 21a8 8 0 0 1 16 0" />
            </svg>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => ref.current?.click()}
            className="rounded-md bg-fg/10 px-3.5 py-2 text-sm font-medium text-fg hover:bg-fg/15"
          >
            {value ? "Change photo" : "Upload photo"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="rounded-md px-3.5 py-2 text-sm text-fg/60 hover:text-fg"
            >
              Remove
            </button>
          )}
        </div>
        <input
          ref={ref}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handle(f);
            e.target.value = "";
          }}
        />
      </div>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      <p className="mt-2 text-xs text-fg/45">
        A clear, smiling head-and-shoulders photo works best. Photo templates show it; others skip it.
      </p>
    </div>
  );
}

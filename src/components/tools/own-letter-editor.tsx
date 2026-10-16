"use client";

import { useEffect, useRef, useState } from "react";
import { CvFileError, readCvFile } from "@/lib/read-cv-file";
import { buildLetterPdf, detectTextMode, reflowLetterText, renderPages, type LetterMode, type LetterRegion, type PreviewPage } from "@/lib/sign-pdf";
import { trackEvent } from "@/lib/track";

const PLACEHOLDER = `Paste or type your text here. It can be a letter, an assignment, notes or code.

For a letter, start with "Dear..." and finish with "Yours faithfully," and your name.`;

/** Title sizes in points. Body text is 11.5, so Small is only slightly bigger. */
const TITLE_SIZES = [
  { id: "small", label: "Small", size: 12.5 },
  { id: "medium", label: "Medium", size: 16 },
  { id: "large", label: "Large", size: 20 },
] as const;

/** The three layouts, with a line saying what each one does. */
const MODES: { id: LetterMode; label: string; hint: string }[] = [
  { id: "letter", label: "Letter", hint: "Formal letter layout. A heading under “Dear…” is bold and underlined, and your signature goes under the closing." },
  { id: "plain", label: "Plain text", hint: "Ordinary text, with your line breaks kept. Good for assignments and notes." },
  { id: "code", label: "Code", hint: "A fixed-width font that keeps every space, so indentation in SQL, Python or Java comes out as you typed it." },
];

/**
 * Paste, type or import text and download it as a PDF, like a word processor. It can be a letter,
 * an assignment or code. There are no job, internship or scholarship questions: it is just the
 * student's own text, and a signature is optional. The preview is the real PDF, so what they see
 * is what they download.
 */
export function OwnLetterEditor({ signature }: { signature: string }) {
  const [text, setText] = useState("");
  const [align, setAlign] = useState<"left" | "right">("left");
  // null means "let the app decide from the text"; a student's own choice always wins
  const [chosenMode, setChosenMode] = useState<LetterMode | null>(null);
  const [addSignature, setAddSignature] = useState(false);
  // An optional title, with where it sits and how it looks
  const [title, setTitle] = useState("");
  const [titleAlign, setTitleAlign] = useState<"left" | "center" | "right">("center");
  const [underline, setUnderline] = useState(true);
  const [boldTitle, setBoldTitle] = useState(true);
  // null means "follow the layout": capitals for a letter's heading, as typed for anything else
  const [capsChoice, setCapsChoice] = useState<boolean | null>(null);
  // null means "follow the layout": small for a letter's heading, medium for the title of other text
  const [sizeChoice, setSizeChoice] = useState<(typeof TITLE_SIZES)[number]["id"] | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const [pages, setPages] = useState<PreviewPage[]>([]);
  const [bytes, setBytes] = useState<Uint8Array | null>(null);
  // Where each line of the text sits on the preview, so a tap on the preview can find its line
  const [regions, setRegions] = useState<LetterRegion[]>([]);
  // The line being edited, outlined on the preview while the text box has focus
  const [activeLine, setActiveLine] = useState<number | null>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [uploadedName, setUploadedName] = useState("");
  const run = useRef(0);

  const detectedMode = detectTextMode(text);
  const mode = chosenMode ?? detectedMode;
  // A letter is signed by default. Other text only gets the signature if the student asks for it.
  const signatureForPdf = mode === "letter" || addSignature ? signature : "";
  const caps = capsChoice ?? mode === "letter";
  const sizeId = sizeChoice ?? (mode === "letter" ? "small" : "medium");
  const titleSize = TITLE_SIZES.find((t) => t.id === sizeId)?.size ?? 16;

  // Rebuild the preview a moment after the student stops typing
  useEffect(() => {
    if (!text.trim() && !title.trim()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- an empty letter has no preview
      setPages([]);
      setBytes(null);
      setRegions([]);
      return;
    }
    const id = ++run.current;
    const timer = setTimeout(async () => {
      try {
        const built = await buildLetterPdf(text, {
          signature: signatureForPdf,
          align,
          mode,
          title,
          titleStyle: { align: titleAlign, underline, bold: boldTitle, caps, size: titleSize },
        });
        const rendered = await renderPages(built.bytes);
        // A newer edit may have started while this one was building: ignore the stale result
        if (id !== run.current) return;
        setBytes(built.bytes);
        setRegions(built.regions);
        setPages(rendered);
        setError("");
      } catch {
        if (id === run.current) setError("We could not build the preview. Try removing unusual symbols from the text.");
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [text, title, titleAlign, underline, boldTitle, caps, titleSize, signatureForPdf, align, mode]);

  async function openFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const raw = await readCvFile(file, "text");
      // Joining wrapped lines suits letters and notes, but would spoil code, so code is left as it is
      const tidy = detectTextMode(raw) === "code" ? raw.trim() : reflowLetterText(raw);
      if (!tidy) throw new CvFileError("We found no text in that file. If it is a scan or a photo, use “Keep my file as it is” instead.");
      setText(tidy);
      setUploadedName(file.name.replace(/\.[^.]+$/, ""));
    } catch (e) {
      setError(e instanceof CvFileError ? e.message : "We could not open that file.");
    } finally {
      setBusy(false);
    }
  }

  /** Jumps to a line of the letter in the text box and selects it, ready to be changed. */
  function editLine(line: number) {
    // -1 is the separate title, which lives in its own box above the text
    if (line < 0) {
      titleRef.current?.focus();
      titleRef.current?.select();
      return;
    }
    const box = textRef.current;
    if (!box) return;
    const rows = text.replace(/\r/g, "").split("\n");
    // The line starts after all the lines before it, plus one character for each line break
    const start = rows.slice(0, line).reduce((total, row) => total + row.length + 1, 0);
    box.focus({ preventScroll: true });
    box.setSelectionRange(start, start + (rows[line]?.length ?? 0));
    // A text box does not scroll to a selection by itself, so scroll it to roughly where the line is
    box.scrollTop = Math.max(0, (line / Math.max(1, rows.length)) * box.scrollHeight - box.clientHeight / 2);
    box.scrollIntoView({ block: "center", behavior: "smooth" });
    setActiveLine(line);
  }

  function download() {
    if (!bytes) return;
    const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: "application/pdf" }));
    const link = document.createElement("a");
    link.href = url;
    const base = uploadedName || (mode === "letter" ? "letter" : "document");
    link.download = `${base}${signatureForPdf ? "_signed" : ""}.pdf`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    trackEvent(mode === "letter" ? "letter_signed" : "text_pdf_downloaded", { mode });
  }

  return (
    <div className="space-y-5">
      <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-fg/25 bg-fg/[0.03] px-4 py-6 text-center text-sm text-fg/65 hover:text-fg">
        <span className="font-medium text-fg">Upload a PDF, Word or text file to edit</span>
        <span className="text-xs text-fg/50">Or skip this and type or paste your text below. It stays on your device.</span>
        <input
          type="file"
          accept=".pdf,.docx,.txt,application/pdf"
          className="sr-only"
          onChange={(e) => {
            void openFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </label>
      {busy && <p className="text-sm text-fg/60">Opening your file…</p>}

      {/* Letter, plain text or code. Picked from the text, but the student can always choose. */}
      <div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
          <span className="text-fg/60">Layout</span>
          <div role="radiogroup" aria-label="Layout of the PDF" className="flex gap-1 rounded-lg bg-fg/5 p-1">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                role="radio"
                aria-checked={mode === m.id}
                onClick={() => setChosenMode(m.id)}
                className={`rounded-md px-3 py-1.5 transition-colors ${mode === m.id ? "bg-fg/10 text-fg ring-1 ring-fg/15" : "text-fg/55 hover:text-fg"}`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-1.5 text-xs text-fg/45">
          {MODES.find((m) => m.id === mode)?.hint} {chosenMode === null && text.trim() ? "Picked for you from your text." : ""}
        </p>
      </div>

      {/* An optional title for any kind of text, with its position and style */}
      <div>
        <label htmlFor="own-title" className="mb-1.5 block text-sm font-medium text-fg/80">
          Title (optional)
        </label>
        <input
          id="own-title"
          ref={titleRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          placeholder="For example: Database Systems, Assignment 2"
          className="w-full rounded-lg border border-fg/12 bg-fg/[0.03] px-3.5 py-3 text-[15px] text-fg placeholder:text-fg/30 focus:border-brand-400/70 focus:outline-none"
        />
        {(title.trim() || mode === "letter") && (
          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-2.5 text-sm">
            <div role="radiogroup" aria-label="Title position" className="flex gap-1 rounded-lg bg-fg/5 p-1">
              {(["left", "center", "right"] as const).map((side) => (
                <button
                  key={side}
                  type="button"
                  role="radio"
                  aria-checked={titleAlign === side}
                  onClick={() => setTitleAlign(side)}
                  className={`rounded-md px-3 py-1.5 capitalize transition-colors ${titleAlign === side ? "bg-fg/10 text-fg ring-1 ring-fg/15" : "text-fg/55 hover:text-fg"}`}
                >
                  {side === "center" ? "Centre" : side}
                </button>
              ))}
            </div>
            <div role="radiogroup" aria-label="Title size" className="flex gap-1 rounded-lg bg-fg/5 p-1">
              {TITLE_SIZES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="radio"
                  aria-checked={sizeId === t.id}
                  onClick={() => setSizeChoice(t.id)}
                  className={`rounded-md px-3 py-1.5 transition-colors ${sizeId === t.id ? "bg-fg/10 text-fg ring-1 ring-fg/15" : "text-fg/55 hover:text-fg"}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            {(
              [
                ["Underline", underline, setUnderline],
                ["Bold", boldTitle, setBoldTitle],
                ["Capitals", caps, (v: boolean) => setCapsChoice(v)],
              ] as const
            ).map(([label, on, set]) => (
              <label key={label} className="flex items-center gap-2 text-fg/75">
                <input type="checkbox" checked={on} onChange={(e) => set(e.target.checked)} className="size-4 accent-brand-500" />
                {label}
              </label>
            ))}
          </div>
        )}
        <p className="mt-1.5 text-xs text-fg/45">
          {mode === "letter"
            ? "In a letter the title goes under “Dear…”. If you leave this empty, a short line you put there yourself is made into the title."
            : "The title goes at the top of the page."}
        </p>
      </div>

      <div>
        <label htmlFor="own-letter" className="mb-1.5 block text-sm font-medium text-fg/80">
          Your text
        </label>
        <textarea
          id="own-letter"
          ref={textRef}
          rows={14}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => setActiveLine(null)}
          placeholder={PLACEHOLDER}
          className="w-full resize-y rounded-lg border border-fg/12 bg-fg/[0.03] px-3.5 py-3 text-[15px] leading-relaxed text-fg placeholder:text-fg/30 focus:border-brand-400/70 focus:outline-none"
        />
        {mode === "letter" && (
          <p className="mt-1.5 text-xs text-fg/45">
            Everything is optional: your address, the date and the person’s address. A heading on its own line under “Dear…”, like “My request for financial assistance”, is made bold and underlined. Your signature goes right under “Yours faithfully” or “Yours sincerely”.
          </p>
        )}
      </div>

      {/* Other text only gets a signature if the student asks for one */}
      {mode !== "letter" && signature && (
        <label className="flex items-center gap-2 text-sm text-fg/75">
          <input type="checkbox" checked={addSignature} onChange={(e) => setAddSignature(e.target.checked)} className="size-4 accent-brand-500" />
          Add my signature at the end
        </label>
      )}

      {(mode === "letter" || (addSignature && signature)) && (
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="text-fg/60">{mode === "letter" ? "Align my address and date, closing, signature and name to the" : "Put my signature on the"}</span>
        <div role="radiogroup" aria-label="Signature side" className="flex gap-1 rounded-lg bg-fg/5 p-1">
          {(["left", "right"] as const).map((side) => (
            <button
              key={side}
              type="button"
              role="radio"
              aria-checked={align === side}
              onClick={() => setAlign(side)}
              className={`rounded-md px-3 py-1.5 capitalize transition-colors ${align === side ? "bg-fg/10 text-fg ring-1 ring-fg/15" : "text-fg/55 hover:text-fg"}`}
            >
              {side}
            </button>
          ))}
        </div>
        {!signature && <span className="text-xs text-fg/45">Add your signature in step 1 to see it here.</span>}
      </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      {pages.length > 0 && (
        <div className="space-y-3" aria-label="Preview of your PDF">
          <p className="text-center text-xs text-fg/50">Tap any line to edit it.</p>
          {pages.map((p, i) => (
            <div key={i} className="relative mx-auto max-w-[640px] overflow-hidden rounded-lg bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element -- a local page preview, nothing to optimise */}
              <img src={p.src} alt={`Page ${i + 1} of your PDF`} className="block w-full" draggable={false} />
              {/* An invisible button over each line. Positions are fractions of the page, so they fit any screen. */}
              {regions
                .filter((r) => r.page === i)
                .map((r) => (
                  <button
                    key={`${r.page}-${r.line}`}
                    type="button"
                    aria-label="Edit this part"
                    onClick={() => editLine(r.line)}
                    style={{ left: `${r.x * 100}%`, top: `${r.y * 100}%`, width: `${r.w * 100}%`, height: `${r.h * 100}%` }}
                    className={`absolute cursor-text rounded-sm outline-1 outline-offset-0 transition-colors hover:bg-slate-900/10 hover:outline hover:outline-slate-500 ${
                      activeLine === r.line ? "bg-slate-900/10 outline outline-slate-700" : ""
                    }`}
                  />
                ))}
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={download}
        disabled={!bytes}
        className="flex w-full items-center justify-center rounded-md bg-brand-600 py-3 text-[15px] font-medium text-white ring-1 ring-brand-300/60 shadow-[0_0_22px_rgb(124_128_255/0.5)] hover:bg-brand-500 disabled:opacity-40 disabled:shadow-none sm:w-auto sm:px-8"
      >
        Download as PDF
      </button>
      <p className="text-xs text-fg/45">The signs “₵” and some other symbols can’t be printed, so the cedi sign is written as GHS.</p>
    </div>
  );
}

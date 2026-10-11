"use client";

import { useEffect, useMemo, useState } from "react";
import { extractKeywords, matchCv, niceSkill } from "@/lib/job-match";
import { toDoc, uid, type BuilderCv } from "@/lib/builder";
import { CheckIcon } from "@/components/ui/check-icon";

/** "Match a job": paste an advert, see which of its keywords the CV is missing, add them in one tap. */
export function JobMatchPanel({
  cv,
  update,
  onClose,
}: {
  cv: BuilderCv;
  update: (patch: Partial<BuilderCv>) => void;
  onClose: () => void;
}) {
  const [advert, setAdvert] = useState("");
  const [keywords, setKeywords] = useState<string[] | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const cvText = useMemo(() => JSON.stringify(toDoc(cv)).toLowerCase(), [cv]);
  const result = keywords ? matchCv(cvText, keywords) : null;

  function addSkill(k: string) {
    const skill = niceSkill(k);
    const [first, ...rest] = cv.skills;
    if (first) {
      const items = first.items.trim() ? `${first.items.trim()}, ${skill}` : skill;
      update({ skills: [{ ...first, items }, ...rest] });
    } else {
      update({ skills: [{ id: uid(), label: "", items: skill }] });
    }
  }

  const color = !result ? "" : result.score >= 70 ? "bg-emerald-400" : result.score >= 40 ? "bg-brand-400" : "bg-amber-400";

  return (
    <div role="dialog" aria-modal="true" aria-label="Match your CV to a job" className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/80 p-3 backdrop-blur-sm sm:items-center sm:p-6">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-fg/10 bg-ink-900 p-5 shadow-[0_0_80px_-20px_rgb(124_128_255/0.6)] sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-medium text-fg">Match your CV to a job</h2>
            <p className="mt-1 text-sm text-fg/55">
              Paste the job advert. We’ll show the keywords hiring software looks for, and which ones your CV is missing.
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-md px-3 py-1.5 text-sm text-fg/60 ring-1 ring-fg/15 hover:text-fg">
            Close
          </button>
        </div>

        <label htmlFor="job-advert" className="sr-only">
          Job advert
        </label>
        <textarea
          id="job-advert"
          rows={7}
          value={advert}
          onChange={(e) => setAdvert(e.target.value)}
          placeholder="Paste the full advert here, from Jobberman, LinkedIn, a company site or a WhatsApp flyer."
          className="mt-5 w-full resize-y rounded-lg border border-fg/12 bg-ink-950/60 px-3.5 py-3 text-sm leading-relaxed text-fg placeholder:text-fg/35 focus:border-brand-400/70 focus:outline-none"
        />
        <button
          type="button"
          disabled={advert.trim().length < 40}
          onClick={() => setKeywords(extractKeywords(advert))}
          className="mt-3 w-full rounded-md bg-brand-600 py-2.5 text-sm font-medium text-white ring-1 ring-brand-300/60 shadow-[0_0_18px_rgb(124_128_255/0.45)] hover:bg-brand-500 disabled:opacity-40"
        >
          Check my CV
        </button>

        {result && keywords && (
          <div className="mt-6">
            {keywords.length === 0 ? (
              <p className="text-sm text-fg/60">We couldn’t find clear skills in that advert. Try pasting the full requirements section.</p>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-fg">Job match</p>
                  <p className="text-sm font-semibold text-fg">{result.score}%</p>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-fg/10">
                  <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${result.score}%` }} />
                </div>

                {result.missing.length > 0 && (
                  <div className="mt-5">
                    <p className="text-sm font-medium text-fg">Missing from your CV ({result.missing.length})</p>
                    <ul className="mt-2.5 flex flex-wrap gap-2">
                      {result.missing.map((k) => (
                        <li key={k}>
                          <button
                            type="button"
                            onClick={() => addSkill(k)}
                            className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-sm text-fg hover:bg-amber-400/20"
                          >
                            <span className="text-amber-300">+</span> {niceSkill(k)}
                          </button>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-2 text-xs text-fg/45">
                      Tap to add to your skills. Only add what you can honestly talk about in an interview; for the rest,
                      use the advert’s words in your bullet points where they’re true.
                    </p>
                  </div>
                )}

                {result.present.length > 0 && (
                  <div className="mt-5">
                    <p className="text-sm font-medium text-fg">Already on your CV ({result.present.length})</p>
                    <ul className="mt-2.5 flex flex-wrap gap-2">
                      {result.present.map((k) => (
                        <li key={k} className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-sm text-fg">
                          <CheckIcon size={15} /> {niceSkill(k)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

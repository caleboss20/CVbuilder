"use client";

import { useEffect, useRef, useState } from "react";
import {
  demoPersonas,
  improveLine,
  type DemoLine,
  type DemoSection,
} from "@/lib/ai-demo";
import { SparkleIcon } from "@/components/ui/sparkle-icon";
import {
  ClassicTemplate,
  SidebarTemplate,
  type Phase,
} from "./ai-demo-templates";

type Mode = "auto" | "user";

const TYPE_MS = 42;
const WORD_MS = 85;
const BASE_SCORE = 58;
const SCORE_STEP = 9;
const sections: DemoSection[] = ["summary", "experience", "activities", "projects"];

export function AiDemoPlayer() {
  const rootRef = useRef<HTMLDivElement>(null);
  const reducedRef = useRef(false);

  const [mode, setMode] = useState<Mode>("auto");
  const [phase, setPhase] = useState<Phase>("typing");
  const [personaIdx, setPersonaIdx] = useState(0);
  const [index, setIndex] = useState(0);
  const [current, setCurrent] = useState<DemoLine>(demoPersonas[0].examples[0]);
  const [typed, setTyped] = useState("");
  const [written, setWritten] = useState(0);
  const [filled, setFilled] = useState<Partial<Record<DemoSection, DemoLine>>>({});
  const [score, setScore] = useState(BASE_SCORE);
  const [inView, setInView] = useState(false);

  const persona = demoPersonas[personaIdx];
  const words = current.output.split(" ");
  const targetScore = BASE_SCORE + Object.keys(filled).length * SCORE_STEP;

  // Only play while on screen; respect reduced motion
  useEffect(() => {
    reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      threshold: 0.35,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  function showPersona(i: number) {
    setPersonaIdx(i);
    setIndex(0);
    setCurrent(demoPersonas[i].examples[0]);
    setFilled({});
    setScore(BASE_SCORE);
    setTyped("");
    setWritten(0);
    setPhase("typing");
  }

  // Phase machine
  useEffect(() => {
    if (mode === "auto" && !inView) return;
    const reduced = reducedRef.current;
    let t: ReturnType<typeof setTimeout> | undefined;

    if (phase === "typing" && mode === "auto") {
      if (typed.length < current.input.length) {
        t = setTimeout(
          () => setTyped(reduced ? current.input : current.input.slice(0, typed.length + 1)),
          reduced ? 0 : TYPE_MS + Math.random() * 40,
        );
      } else {
        t = setTimeout(() => setPhase("ready"), 300);
      }
    } else if (phase === "ready" && mode === "auto") {
      t = setTimeout(() => setPhase("thinking"), 750);
    } else if (phase === "thinking") {
      t = setTimeout(() => {
        setWritten(0);
        setPhase("writing");
      }, reduced ? 0 : 900);
    } else if (phase === "writing") {
      if (written < words.length) {
        t = setTimeout(
          () => setWritten(reduced ? words.length : written + 1),
          reduced ? 0 : WORD_MS,
        );
      } else {
        t = setTimeout(() => {
          setFilled((f) => ({ ...f, [current.section]: current }));
          setPhase("done");
        }, 0);
      }
    } else if (phase === "done" && mode === "auto") {
      const next = index + 1;
      if (next < persona.examples.length) {
        t = setTimeout(() => {
          setIndex(next);
          setCurrent(persona.examples[next]);
          setTyped("");
          setWritten(0);
          setPhase("typing");
        }, 2200);
      } else {
        // CV complete: hold it on screen, then move to the next student + template
        t = setTimeout(() => showPersona((personaIdx + 1) % demoPersonas.length), 3800);
      }
    }
    return () => clearTimeout(t);
  }, [mode, phase, typed, written, current, index, inView, words.length, persona, personaIdx]);

  // Count the ATS score toward its target
  useEffect(() => {
    if (score === targetScore) return;
    const t = setTimeout(
      () => setScore((s) => s + Math.sign(targetScore - s)),
      reducedRef.current ? 0 : 35,
    );
    return () => clearTimeout(t);
  }, [score, targetScore]);

  const busy = phase === "thinking" || phase === "writing";

  function takeOver() {
    if (mode === "user") return;
    setMode("user");
    setPhase("typing");
    setTyped("");
    setWritten(0);
  }

  function improve() {
    if (!typed.trim() || busy) return;
    setCurrent(improveLine(typed));
    setWritten(0);
    setPhase("thinking");
  }

  function pickTemplate(i: number) {
    setMode("auto");
    showPersona(i);
  }

  const templateProps = { persona, current, filled, phase, words, written };

  return (
    <div ref={rootRef} className="grid items-center gap-8 lg:grid-cols-[1fr_1.15fr] lg:gap-12">
      {/* Left: student input */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-white">
            {mode === "auto" ? `${persona.name.split(" ")[0]}’s words` : "Your words"}
          </p>
          {mode === "user" ? (
            <button
              type="button"
              onClick={() => pickTemplate(personaIdx)}
              className="text-xs text-brand-300 hover:text-white"
            >
              ↺ Watch demo
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs text-white/40">
              <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
              Live demo
            </span>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2" aria-hidden="true">
          {sections.map((s) => (
            <span
              key={s}
              className={`rounded-md px-2.5 py-1 text-xs transition-colors ${
                current.section === s
                  ? "bg-brand-500/20 text-brand-300 ring-1 ring-brand-400/50"
                  : "bg-white/5 text-white/45"
              }`}
            >
              {persona.labels[s]}
            </span>
          ))}
        </div>

        <label htmlFor="ai-demo-input" className="sr-only">
          Describe something you did in your own words
        </label>
        <div className="relative mt-4">
          <textarea
            id="ai-demo-input"
            rows={3}
            maxLength={160}
            value={typed}
            onFocus={takeOver}
            onChange={(e) => setTyped(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                improve();
              }
            }}
            placeholder="e.g. i was class rep and organised study groups for exams"
            className="w-full resize-none rounded-lg border border-white/10 bg-ink-950/60 px-4 py-3 text-[15px] text-white placeholder:text-white/30 focus:border-brand-400/60 focus:outline-none"
          />
          {mode === "auto" && phase === "typing" && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-3 text-[15px] text-transparent"
            >
              {typed}
              <span className="ml-px inline-block h-4 w-px translate-y-0.5 animate-pulse bg-brand-300" />
            </span>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-white/40">
            {mode === "auto" ? "Click the box to try your own sentence" : "Press Enter or click Improve"}
          </p>
          <button
            type="button"
            onClick={mode === "auto" ? takeOver : improve}
            disabled={mode === "user" && (!typed.trim() || busy)}
            className={`inline-flex h-10 items-center gap-2 rounded-md bg-brand-600 px-4 text-sm font-medium text-white ring-1 ring-brand-300/60 transition-all duration-200 hover:bg-brand-500 disabled:opacity-50 ${
              phase === "ready" && mode === "auto"
                ? "scale-95 shadow-[0_0_30px_rgb(124_128_255/0.9)]"
                : "shadow-[0_0_18px_rgb(124_128_255/0.45)]"
            }`}
          >
            <SparkleIcon size={14} />
            {busy ? "Improving…" : "Improve with AI"}
          </button>
        </div>

        <p className="mt-5 border-t border-white/10 pt-4 text-xs text-white/35">
          Demo uses sample suggestions. The full AI assistant works inside the builder.
        </p>
      </div>

      {/* Right: the CV being written */}
      <div>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div role="tablist" aria-label="Template preview" className="flex gap-1 rounded-lg bg-white/5 p-1">
            {demoPersonas.map((p, i) => (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={i === personaIdx}
                onClick={() => pickTemplate(i)}
                className={`rounded-md px-3 py-1.5 text-xs transition-colors ${
                  i === personaIdx
                    ? "bg-white/10 text-white ring-1 ring-white/15"
                    : "text-white/50 hover:text-white"
                }`}
              >
                {p.templateName}
              </button>
            ))}
          </div>
          <p className="text-xs text-white/40">
            Template {personaIdx + 1} of {demoPersonas.length}
          </p>
        </div>

        <div className="relative">
          <div
            aria-hidden="true"
            className="absolute inset-x-[10%] -bottom-6 h-24 rounded-[100%] bg-brand-500/40 blur-3xl"
          />
          <div className="absolute -bottom-8 right-3 z-10 rounded-lg bg-white px-3 py-2 shadow-[0_8px_30px_-6px_rgb(0_0_0/0.5),0_0_24px_rgb(124_128_255/0.45)] sm:-right-5 sm:-top-5 sm:bottom-auto">
            <ScoreRing score={score} />
          </div>

          <div
            key={persona.id}
            className="animate-fade-up relative shadow-[0_0_60px_-15px_rgb(124_128_255/0.6)]"
          >
            {persona.template === "sidebar" ? (
              <SidebarTemplate {...templateProps} />
            ) : (
              <ClassicTemplate {...templateProps} />
            )}
          </div>
        </div>

        <p role="status" className="sr-only">
          {phase === "done" ? `Improved: ${current.output}` : ""}
        </p>
      </div>
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  const color = score >= 85 ? "#16a34a" : score >= 70 ? "#5a5ef5" : "#f59e0b";
  return (
    <div className="flex shrink-0 flex-col items-center">
      <div className="relative size-14">
        <svg viewBox="0 0 56 56" className="size-14 -rotate-90" aria-hidden="true">
          <circle cx="28" cy="28" r={r} fill="none" stroke="#e2e8f0" strokeWidth="5" />
          <circle
            cx="28"
            cy="28"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - score / 100)}
            className="transition-[stroke] duration-500"
          />
        </svg>
        <span className="absolute inset-0 grid place-items-center text-sm font-bold text-slate-900">
          {score}%
        </span>
      </div>
      <span className="mt-1 text-[10px] font-medium uppercase tracking-wide text-slate-500">
        ATS score
      </span>
    </div>
  );
}

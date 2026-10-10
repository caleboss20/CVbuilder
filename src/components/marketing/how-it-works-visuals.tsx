import { SparkleIcon } from "@/components/ui/sparkle-icon";
import {
  AtsClassicThumb,
  ClassicBlueThumb,
  MonochromeThumb,
  ScaledPage,
} from "./template-thumbs";

/*
 * Animated visuals for the "How it works" steps.
 * Each one animates when its `group` wrapper has data-active="true" and resets
 * instantly when it goes inactive.
 */

/* ------------------------------ Step 1 ------------------------------ */

const thumbs = [
  { name: "Monochrome", page: <MonochromeThumb />, rotate: "-rotate-6", shift: "translate-x-8" },
  { name: "ATS Classic", page: <AtsClassicThumb />, rotate: "rotate-0", shift: "translate-x-0" },
  { name: "Classic Blue", page: <ClassicBlueThumb />, rotate: "rotate-6", shift: "-translate-x-8" },
];

export function PickTemplateVisual() {
  return (
    <div className="flex h-full items-center justify-center gap-3 sm:gap-5">
      {thumbs.map((t, i) => {
        const chosen = i === 1;
        return (
          <div
            key={t.name}
            className={`flex flex-col items-center gap-3 transition-all duration-0 group-data-[active=true]:duration-700 ${
              i === 0 ? "group-data-[active=true]:delay-100" : i === 2 ? "group-data-[active=true]:delay-200" : ""
            } ${t.rotate} ${t.shift} opacity-0 group-data-[active=true]:translate-x-0 group-data-[active=true]:rotate-0 group-data-[active=true]:opacity-100`}
          >
            <div
              className={`relative rounded-[3px] shadow-xl transition-all duration-0 ${
                chosen
                  ? "group-data-[active=true]:-translate-y-3 group-data-[active=true]:scale-110 group-data-[active=true]:shadow-[0_0_40px_rgb(124_128_255/0.6)] group-data-[active=true]:ring-2 group-data-[active=true]:ring-brand-400 group-data-[active=true]:duration-500 group-data-[active=true]:delay-[900ms]"
                  : "group-data-[active=true]:opacity-55 group-data-[active=true]:duration-500 group-data-[active=true]:delay-[900ms]"
              }`}
            >
              <ScaledPage>{t.page}</ScaledPage>
              {chosen && (
                <span className="absolute -right-2 -top-2 grid size-6 scale-0 place-items-center rounded-full bg-brand-500 text-white shadow-[0_0_14px_rgb(124_128_255/0.8)] transition-transform duration-0 group-data-[active=true]:scale-100 group-data-[active=true]:duration-300 group-data-[active=true]:delay-[1300ms]">
                  <Check />
                </span>
              )}
            </div>
            <span
              className={`text-xs ${chosen ? "text-fg group-data-[active=true]:translate-y-2 transition-transform duration-500" : "text-fg/55"}`}
            >
              {t.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function Bar({ w, c = "bg-slate-200", h = "h-1" }: { w: string; c?: string; h?: string }) {
  return <span className={`block rounded-full ${h} ${w} ${c}`} />;
}

/* ------------------------------ Step 2 ------------------------------ */

const fields = [
  { label: "Full name", value: "Kwabena Ofori" },
  { label: "Course", value: "BSc Business Administration, KNUST" },
  { label: "What did you do?", value: "Treasurer, Business Students’ Club" },
];

const fillDelays = ["group-data-[active=true]:delay-200", "group-data-[active=true]:delay-[900ms]", "group-data-[active=true]:delay-[1600ms]"];
const cvDelays = ["group-data-[active=true]:delay-[600ms]", "group-data-[active=true]:delay-[1300ms]", "group-data-[active=true]:delay-[2000ms]"];

export function FillDetailsVisual() {
  return (
    <div className="grid h-full items-center gap-4 sm:grid-cols-[1fr_0.9fr]">
      <div className="space-y-3 rounded-xl border border-fg/10 bg-ink-900/80 p-4">
        {fields.map((f, i) => (
          <div key={f.label}>
            <p className="text-[11px] text-fg/45">{f.label}</p>
            <div className="mt-1 rounded-md border border-fg/10 bg-ink-950/70 px-3 py-2 text-sm text-fg">
              <span
                className={`block overflow-hidden whitespace-nowrap transition-[max-width] duration-0 [max-width:0] group-data-[active=true]:[max-width:100%] group-data-[active=true]:duration-700 group-data-[active=true]:ease-linear ${fillDelays[i]}`}
              >
                {f.value}
              </span>
            </div>
          </div>
        ))}
        <div
          className={`flex items-start gap-2 rounded-md border border-brand-400/40 bg-brand-500/10 px-3 py-2 text-xs text-fg/80 opacity-0 transition-all duration-0 translate-y-2 group-data-[active=true]:translate-y-0 group-data-[active=true]:opacity-100 group-data-[active=true]:duration-500 group-data-[active=true]:delay-[2500ms]`}
        >
          <SparkleIcon className="mt-0.5 text-brand-300" />
          <span>
            <span className="text-fg/50">Try:</span> “Managed a GH₵ 8,000 club budget and
            cut event costs by 15%.”
          </span>
        </div>
      </div>

      <div className="hidden rounded-md bg-white p-4 shadow-[0_0_50px_-12px_rgb(124_128_255/0.6)] sm:block">
        <div
          className={`opacity-0 transition-all duration-0 group-data-[active=true]:opacity-100 group-data-[active=true]:duration-500 ${cvDelays[0]}`}
        >
          <p className="text-sm font-bold text-slate-900">Kwabena Ofori</p>
          <p className="text-[10px] text-slate-500">Business Administration Student</p>
        </div>
        <div className="mt-3 space-y-3">
          {["Education", "Leadership"].map((title, i) => (
            <div
              key={title}
              className={`translate-y-2 opacity-0 transition-all duration-0 group-data-[active=true]:translate-y-0 group-data-[active=true]:opacity-100 group-data-[active=true]:duration-500 ${cvDelays[i + 1]}`}
            >
              <p className="border-b border-slate-300 pb-0.5 text-[9px] font-bold uppercase tracking-widest text-slate-800">
                {title}
              </p>
              <p className="mt-1 text-[10px] text-slate-600">
                {i === 0 ? "BSc Business Administration, KNUST" : "Treasurer, Business Students’ Club"}
              </p>
              <div className="mt-1 space-y-1">
                <Bar w="w-full" />
                <Bar w="w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Step 3 ------------------------------ */

export function DownloadVisual() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5">
      <div className="w-full max-w-xs rounded-xl border border-fg/10 bg-ink-900/80 p-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-fg/70">Generating PDF…</span>
          <span
            className={`text-fg/40 transition-opacity duration-0 group-data-[active=true]:opacity-0 group-data-[active=true]:delay-[1400ms]`}
          >
            A4 · 1 page
          </span>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-fg/10">
          <div
            className={`h-full w-0 rounded-full bg-linear-to-r from-brand-500 to-brand-300 transition-[width] duration-0 group-data-[active=true]:w-full group-data-[active=true]:duration-[1300ms] group-data-[active=true]:ease-out`}
          />
        </div>
      </div>

      <div
        className={`flex w-full max-w-xs scale-90 items-center gap-3 rounded-xl bg-white p-4 opacity-0 shadow-[0_0_50px_-10px_rgb(124_128_255/0.7)] transition-all duration-0 group-data-[active=true]:scale-100 group-data-[active=true]:opacity-100 group-data-[active=true]:duration-500 group-data-[active=true]:delay-[1500ms]`}
      >
        <span className="grid h-12 w-10 shrink-0 place-items-center rounded-md bg-red-500 text-[10px] font-bold text-white">
          PDF
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900">Kwabena_Ofori_CV.pdf</p>
          <p className="text-xs text-slate-500">142 KB · No watermark</p>
        </div>
        <span className="grid size-7 place-items-center rounded-full bg-emerald-500 text-white">
          <Check />
        </span>
      </div>

      <p
        className={`text-sm text-emerald-300 opacity-0 transition-opacity duration-0 group-data-[active=true]:opacity-100 group-data-[active=true]:duration-500 group-data-[active=true]:delay-[1900ms]`}
      >
        Ready to send
      </p>
    </div>
  );
}

function Check() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}

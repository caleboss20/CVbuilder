import Image from "next/image";
import { testimonials, universities, type Testimonial } from "@/lib/testimonials";
import { SectionHeading } from "./section-heading";

const isDev = process.env.NODE_ENV !== "production";
// Drafts (no real quote yet) are visible locally so the layout can be checked, never in production
const visible = testimonials.filter((t) => !t.draft || isDev);

export function Testimonials() {
  const columns = splitIntoColumns(visible, 3);
  const scrolling = visible.length >= 6;

  return (
    <section
      id="testimonials"
      aria-labelledby="testimonials-heading"
      className="relative scroll-mt-20 overflow-hidden py-24 sm:py-32"
    >
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/3 -z-10 h-[460px] w-[900px] -translate-x-1/2 rounded-full bg-brand-600/10 blur-[120px]"
      />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="testimonials-heading"
          eyebrow="Student stories"
          title={
            <>
              Loved by students <em>across Ghana</em>
            </>
          }
          description={
            visible.length > 0
              ? "Real students, real CVs. Here is what they say after building theirs with CV11."
              : "Built for students at universities and colleges all over Ghana."
          }
        />
      </div>

      <UniversityStrip />

      {visible.length > 0 && (
        <div className="mx-auto mt-16 max-w-6xl px-4 sm:px-6 lg:px-8">
          {scrolling ? (
            <div className="relative grid h-[640px] gap-5 overflow-hidden md:grid-cols-2 lg:grid-cols-3">
              {columns.map((col, i) => (
                <div
                  key={i}
                  className={`group/col overflow-hidden ${i === 1 ? "hidden md:block" : ""} ${i === 2 ? "hidden lg:block" : ""}`}
                >
                  <div
                    className="flex animate-scroll-up flex-col gap-5 group-hover/col:[animation-play-state:paused]"
                    style={{ animationDuration: `${40 + i * 8}s` }}
                  >
                    {[...col, ...col].map((t, j) => (
                      <TestimonialCard key={t.photo + j} t={t} hidden={j >= col.length} />
                    ))}
                  </div>
                </div>
              ))}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b from-ink-950 to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-ink-950 to-transparent" />
            </div>
          ) : (
            <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {visible.map((t) => (
                <li key={t.photo}>
                  <TestimonialCard t={t} />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}

function TestimonialCard({ t, hidden = false }: { t: Testimonial; hidden?: boolean }) {
  return (
    <figure
      aria-hidden={hidden || undefined}
      className={`relative flex h-full flex-col rounded-xl border bg-linear-to-b from-white/[0.06] to-white/[0.02] p-6 ${
        "border-white/10"
      }`}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="text-brand-400/60">
        <path d="M9.5 6C6.5 7 4.5 9.6 4.5 13v5h6v-6h-3c0-2 1-3.5 3-4.3zM19.5 6c-3 1-5 3.6-5 7v5h6v-6h-3c0-2 1-3.5 3-4.3z" />
      </svg>
      <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-white/80">{t.quote}</blockquote>
      <figcaption className="mt-6 flex items-center gap-3 border-t border-white/10 pt-5">
        <Image
          src={t.photo}
          alt={t.draft ? "" : t.name}
          width={96}
          height={96}
          className="size-12 rounded-full object-cover ring-2 ring-brand-400/30"
        />
        <div>
          <p className="font-medium text-white">{t.name}</p>
          <p className="text-sm text-white/50">
            {t.course} · {t.school}
          </p>
        </div>
      </figcaption>
    </figure>
  );
}

function UniversityStrip() {
  return (
    <div className="mt-14">
      <p className="text-center text-xs uppercase tracking-[0.25em] text-white/40">Made for students at</p>
      <div className="relative mt-6">
        <div className="group/uni flex overflow-hidden">
          {[0, 1].map((copy) => (
            <ul
              key={copy}
              aria-hidden={copy === 1 || undefined}
              className="flex shrink-0 animate-marquee items-center gap-10 pr-10 [animation-duration:50s] group-hover/uni:[animation-play-state:paused]"
            >
              {[...universities, ...universities].map((u, i) => (
                <li
                  key={u.name + i}
                  className="flex items-center gap-3 whitespace-nowrap opacity-70 transition-opacity hover:opacity-100"
                >
                  {u.logo && (
                    <span className="grid size-12 place-items-center rounded-xl bg-white p-1.5 shadow-[0_0_20px_-6px_rgb(255_255_255/0.4)]">
                      <Image
                        src={u.logo}
                        alt={copy === 0 && i < universities.length ? `${u.name} logo` : ""}
                        width={44}
                        height={44}
                        className="max-h-full w-auto object-contain"
                      />
                    </span>
                  )}
                  <span className="text-lg font-semibold tracking-tight text-white/70 sm:text-xl">{u.name}</span>
                </li>
              ))}
            </ul>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-linear-to-r from-ink-950 to-transparent sm:w-48" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-linear-to-l from-ink-950 to-transparent sm:w-48" />
      </div>
    </div>
  );
}

function splitIntoColumns<T>(items: T[], n: number): T[][] {
  const cols: T[][] = Array.from({ length: n }, () => []);
  items.forEach((item, i) => cols[i % n].push(item));
  return cols;
}

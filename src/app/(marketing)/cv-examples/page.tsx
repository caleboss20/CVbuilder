import type { Metadata } from "next";
import Link from "next/link";
import { cvExamples } from "@/lib/cv-examples";
import { CvIcon } from "@/components/cv/cv-icon";

export const metadata: Metadata = {
  title: "CV Examples for Students in Ghana",
  description:
    "Free CV examples for nursing, computer science, accounting, engineering, law, national service and more. Written for students in Ghana, with tips for each course.",
  alternates: { canonical: "/cv-examples" },
};

export default function CvExamplesPage() {
  return (
    <div className="relative overflow-hidden pt-32 pb-24 sm:pt-40">
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-0 -z-10 h-[420px] w-[900px] -translate-x-1/2 rounded-full bg-brand-600/15 blur-[120px]"
      />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-medium tracking-tight text-white sm:text-5xl">
            CV examples for every course
          </h1>
          <p className="mt-4 text-base text-white/65 sm:text-lg">
            Real examples written for students in Ghana. Open one, see what a strong CV looks like
            in your field, then make your own.
          </p>
        </div>

        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cvExamples.map((e) => (
            <li key={e.slug}>
              <Link
                href={`/cv-examples/${e.slug}`}
                className="group flex h-full flex-col rounded-xl border border-white/10 bg-white/[0.03] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-brand-400/50 hover:shadow-[0_0_40px_-12px_rgb(124_128_255/0.7)]"
              >
                <span className="grid size-10 place-items-center rounded-full bg-brand-500/15 text-brand-300">
                  <CvIcon name={e.icon} size={18} />
                </span>
                <h2 className="mt-4 text-lg font-medium text-white">{e.course} CV</h2>
                <p className="mt-2 line-clamp-2 text-sm text-white/55">{e.intro}</p>
                <span className="mt-4 text-sm text-brand-300 group-hover:text-white">View example →</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

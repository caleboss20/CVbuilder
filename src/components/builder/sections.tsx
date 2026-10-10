"use client";

import type { ReactNode } from "react";
import {
  actionVerbs,
  emptyJob,
  emptyProject,
  emptyReferee,
  emptySchool,
  emptySkillGroup,
  type BuilderCv,
} from "@/lib/builder";
import { AddButton, Field, ItemCard, PhotoInput, TagInput, TextArea } from "./fields";

export type Update = (patch: Partial<BuilderCv>) => void;
type StepProps = { cv: BuilderCv; update: Update };

function move<T>(list: T[], i: number, dir: -1 | 1): T[] {
  const j = i + dir;
  if (j < 0 || j >= list.length) return list;
  const next = [...list];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

function patchAt<T>(list: T[], i: number, patch: Partial<T>): T[] {
  return list.map((x, k) => (k === i ? { ...x, ...patch } : x));
}

export function StepIntro({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-medium text-fg sm:text-2xl">{title}</h2>
      <p className="mt-1.5 text-sm leading-relaxed text-fg/55">{children}</p>
    </div>
  );
}

function Tip({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-3 rounded-lg border border-brand-400/25 bg-brand-500/[0.07] p-3.5 text-sm leading-relaxed text-fg/70">
      <span className="mt-0.5 text-brand-300" aria-hidden="true">
        ✦
      </span>
      <div>{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function PersonalStep({ cv, update }: StepProps) {
  return (
    <div className="space-y-5">
      <StepIntro title="Personal details">How recruiters will find and contact you.</StepIntro>
      <PhotoInput value={cv.photo} onChange={(photo) => update({ photo })} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" value={cv.name} onChange={(name) => update({ name })} placeholder="Ama Mensah" autoComplete="name" />
        <Field
          label="Role or title"
          value={cv.role}
          onChange={(role) => update({ role })}
          placeholder="Computer Science Student"
          hint="Your course, or the job you want."
        />
        <Field label="Phone" value={cv.phone} onChange={(phone) => update({ phone })} placeholder="024 000 0000" type="tel" autoComplete="tel" />
        <Field label="Email" value={cv.email} onChange={(email) => update({ email })} placeholder="ama.mensah@email.com" type="email" autoComplete="email" />
        <Field label="Location" value={cv.location} onChange={(location) => update({ location })} placeholder="Kumasi, Ghana" />
        <Field
          label="LinkedIn, GitHub or portfolio"
          value={cv.links[0] ?? ""}
          onChange={(v) => update({ links: v ? [v, ...cv.links.slice(1)] : cv.links.slice(1) })}
          placeholder="linkedin.com/in/amamensah"
        />
      </div>
      <Tip>Use a professional email, ideally your name. Skip your home address and date of birth; recruiters don’t need them.</Tip>
    </div>
  );
}

export function SummaryStep({ cv, update }: StepProps) {
  const words = cv.summary.split(/\s+/).filter(Boolean).length;
  return (
    <div className="space-y-5">
      <StepIntro title="Professional summary">Two or three sentences that sum up who you are and what you want.</StepIntro>
      <TextArea
        label="Summary"
        rows={5}
        value={cv.summary}
        onChange={(summary) => update({ summary })}
        placeholder="Final-year Computer Science student at KNUST with hands-on experience building web and mobile apps, looking for a software engineering internship."
        hint={
          <span className={words > 60 ? "text-amber-300" : ""}>
            {words} words · aim for 25 to 60
          </span>
        }
      />
      <Tip>
        A simple formula: <b className="text-fg">who you are</b> (course, year, school) + <b className="text-fg">what you’re good at</b>{" "}
        (2 skills or experiences) + <b className="text-fg">what you want</b> (internship, national service, first job).
      </Tip>
    </div>
  );
}

export function EducationStep({ cv, update }: StepProps) {
  const list = cv.education;
  const set = (education: typeof list) => update({ education });
  return (
    <div className="space-y-4">
      <StepIntro title="Education">Start with your current degree, then senior high school.</StepIntro>
      {list.map((s, i) => (
        <ItemCard
          key={s.id}
          title={s.degree || s.school || `School ${i + 1}`}
          onRemove={() => set(list.filter((_, k) => k !== i))}
          onUp={i > 0 ? () => set(move(list, i, -1)) : undefined}
          onDown={i < list.length - 1 ? () => set(move(list, i, 1)) : undefined}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Degree or certificate" value={s.degree} onChange={(degree) => set(patchAt(list, i, { degree }))} placeholder="BSc Computer Science" />
            <Field label="School" value={s.school} onChange={(school) => set(patchAt(list, i, { school }))} placeholder="KNUST, Kumasi" />
            <Field label="Dates" value={s.date} onChange={(date) => set(patchAt(list, i, { date }))} placeholder="2022 – 2026" />
          </div>
        </ItemCard>
      ))}
      <AddButton onClick={() => set([...list, emptySchool()])}>Add education</AddButton>
    </div>
  );
}

export function ExperienceStep({ cv, update }: StepProps) {
  const list = cv.experience;
  const set = (experience: typeof list) => update({ experience });
  return (
    <div className="space-y-4">
      <StepIntro title="Experience">
        Internships, national service, attachments, part-time jobs, volunteering and leadership roles all count.
      </StepIntro>
      {list.map((job, i) => (
        <ItemCard
          key={job.id}
          title={job.title || job.place || `Experience ${i + 1}`}
          onRemove={() => set(list.filter((_, k) => k !== i))}
          onUp={i > 0 ? () => set(move(list, i, -1)) : undefined}
          onDown={i < list.length - 1 ? () => set(move(list, i, 1)) : undefined}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Role" value={job.title} onChange={(title) => set(patchAt(list, i, { title }))} placeholder="Finance Intern" />
            <Field label="Organisation and town" value={job.place} onChange={(place) => set(patchAt(list, i, { place }))} placeholder="GCB Bank, Kumasi" />
            <Field label="Dates" value={job.date} onChange={(date) => set(patchAt(list, i, { date }))} placeholder="Jun – Sep 2025" />
          </div>
          <div>
            <p className="mb-1.5 text-sm font-medium text-fg/80">What you did</p>
            <div className="space-y-2">
              {job.bullets.map((b, bi) => (
                <div key={bi} className="flex items-start gap-2">
                  <span className="mt-3 size-1.5 shrink-0 rounded-full bg-brand-300" aria-hidden="true" />
                  <textarea
                    rows={2}
                    value={b}
                    aria-label={`Bullet ${bi + 1}`}
                    placeholder={bi === 0 ? "Prepared daily cash reconciliations for 3 branch accounts." : "Another thing you did, with a number if you can."}
                    onChange={(e) => {
                      const bullets = [...job.bullets];
                      bullets[bi] = e.target.value;
                      set(patchAt(list, i, { bullets }));
                    }}
                    className="w-full resize-y rounded-lg border border-fg/12 bg-fg/[0.03] px-3 py-2 text-sm leading-relaxed text-fg placeholder:text-fg/30 focus:border-brand-400/70 focus:outline-none"
                  />
                  <button
                    type="button"
                    aria-label={`Remove bullet ${bi + 1}`}
                    onClick={() => set(patchAt(list, i, { bullets: job.bullets.filter((_, k) => k !== bi) }))}
                    className="mt-1.5 grid size-8 shrink-0 place-items-center rounded-md text-fg/40 hover:bg-fg/10 hover:text-red-400"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => set(patchAt(list, i, { bullets: [...job.bullets, ""] }))}
              className="mt-2 text-sm font-medium text-brand-300 hover:text-fg"
            >
              + Add bullet point
            </button>
          </div>
        </ItemCard>
      ))}
      <AddButton onClick={() => set([...list, emptyJob()])}>Add experience</AddButton>
      <Tip>
        Start each bullet with an action word and add a number where you can:{" "}
        <span className="text-fg">{actionVerbs.slice(0, 8).join(", ")}</span>. For example: “Trained 80 farmers on new
        planting methods.”
      </Tip>
    </div>
  );
}

export function ProjectsStep({ cv, update }: StepProps) {
  const list = cv.projects;
  const set = (projects: typeof list) => update({ projects });
  return (
    <div className="space-y-4">
      <StepIntro title="Projects">Final-year projects, research, class projects or things you built on your own.</StepIntro>
      {list.map((p, i) => (
        <ItemCard
          key={p.id}
          title={p.name || `Project ${i + 1}`}
          onRemove={() => set(list.filter((_, k) => k !== i))}
          onUp={i > 0 ? () => set(move(list, i, -1)) : undefined}
          onDown={i < list.length - 1 ? () => set(move(list, i, 1)) : undefined}
        >
          <Field label="Project name" value={p.name} onChange={(name) => set(patchAt(list, i, { name }))} placeholder="Campus Marketplace App" />
          <TextArea
            label="What it was and what it achieved"
            rows={2}
            value={p.detail}
            onChange={(detail) => set(patchAt(list, i, { detail }))}
            placeholder="Co-built a React Native app where students buy and sell items on campus, used by 500+ students."
          />
        </ItemCard>
      ))}
      <AddButton onClick={() => set([...list, emptyProject()])}>Add project</AddButton>
      <Tip>No work experience yet? Projects are your best friend. Two or three strong ones can fill a student CV.</Tip>
    </div>
  );
}

export function SkillsStep({ cv, update }: StepProps) {
  const list = cv.skills;
  const set = (skills: typeof list) => update({ skills });
  return (
    <div className="space-y-4">
      <StepIntro title="Skills">Group your skills so they’re easy to scan, like Software, Clinical or Professional.</StepIntro>
      {list.map((g, i) => (
        <ItemCard key={g.id} title={g.label || `Skill group ${i + 1}`} onRemove={() => set(list.filter((_, k) => k !== i))}>
          <div className="grid gap-4 sm:grid-cols-[0.6fr_1.4fr]">
            <Field label="Group name" value={g.label} onChange={(label) => set(patchAt(list, i, { label }))} placeholder="Software" />
            <Field
              label="Skills (separate with commas)"
              value={g.items}
              onChange={(items) => set(patchAt(list, i, { items }))}
              placeholder="Excel, QuickBooks, Canva"
            />
          </div>
        </ItemCard>
      ))}
      <AddButton onClick={() => set([...list, emptySkillGroup()])}>Add skill group</AddButton>
      <Tip>List skills you could show in an interview. “Teamwork” is fine, but “Excel pivot tables” says more.</Tip>
    </div>
  );
}

export function ExtrasStep({ cv, update }: StepProps) {
  return (
    <div className="space-y-6">
      <StepIntro title="Extras">The small things that make you stand out. Leave any of these empty and they won’t show.</StepIntro>
      <TagInput
        label="Languages"
        values={cv.languages}
        onChange={(languages) => update({ languages })}
        placeholder="Type a language and press Enter"
        suggestions={["English (Fluent)", "Twi (Native)", "Ga (Good)", "Ewe (Native)", "Fante (Native)", "French (Basic)", "Dagbani (Native)"]}
      />
      <TagInput
        label="Certifications"
        values={cv.certifications}
        onChange={(certifications) => update({ certifications })}
        placeholder="Google Data Analytics Certificate"
      />
      <TagInput
        label="Awards and achievements"
        values={cv.awards}
        onChange={(awards) => update({ awards })}
        placeholder="Dean’s List, 2024/2025"
      />
      <TagInput
        label="Interests"
        values={cv.interests}
        onChange={(interests) => update({ interests })}
        placeholder="Football, Debate, Volunteering"
      />
    </div>
  );
}

export function ReferencesStep({ cv, update }: StepProps) {
  const list = cv.references;
  const set = (references: typeof list) => update({ references });
  return (
    <div className="space-y-4">
      <StepIntro title="References">Lecturers, supervisors or mentors who agreed to vouch for you.</StepIntro>
      {list.map((r, i) => (
        <ItemCard key={r.id} title={r.name || `Reference ${i + 1}`} onRemove={() => set(list.filter((_, k) => k !== i))}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" value={r.name} onChange={(name) => set(patchAt(list, i, { name }))} placeholder="Dr. Kwame Owusu" />
            <Field label="Role and organisation" value={r.role} onChange={(role) => set(patchAt(list, i, { role }))} placeholder="Senior Lecturer, KNUST" />
            <Field label="Phone or email" value={r.phone} onChange={(phone) => set(patchAt(list, i, { phone }))} placeholder="020 000 0000" />
          </div>
        </ItemCard>
      ))}
      {list.length < 3 && <AddButton onClick={() => set([...list, emptyReferee()])}>Add reference</AddButton>}
      <Tip>Always ask before listing someone, and tell them which jobs you’re applying for so they’re ready for the call.</Tip>
    </div>
  );
}

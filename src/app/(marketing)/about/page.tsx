import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { PageShell } from "@/components/marketing/page-shell";
import { templates } from "@/lib/templates";

export const metadata: Metadata = {
  title: "About CV11",
  description: "CV11 is a free CV builder made for students and graduates in Ghana. Here is why we built it and what we stand for.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <PageShell
      title="About CV11"
      intro="CV11 is a free CV builder made for students and fresh graduates in Ghana. It helps you turn what you have done into a clear, professional CV in minutes."
    >
      <h2>Why we built it</h2>
      <p>
        Most CV tools are made for people who already have years of work experience, and many charge you at the last step, after you
        have spent an hour typing. A student with a final-year project, a national service posting and a few campus roles still has
        plenty to show. They just need help presenting it.
      </p>
      <p>
        CV11 starts from your course. Pick it, and you see example wording written for students in your field, so you never face a
        blank page. You write your own details, see your CV update as you type, and download it.
      </p>

      <h2>What CV11 does</h2>
      <ul>
        <li>
          <strong>Builds your CV</strong> from a template, a blank page, or a CV you already have (upload it and keep editing).
        </li>
        <li>
          <strong>Offers {templates.length} templates</strong>, including plain one-column designs that hiring software reads reliably.
        </li>
        <li>
          <strong>Checks a CV</strong> against a job and gives a score out of 100 with clear fixes.
        </li>
        <li>
          <strong>Writes a cover letter</strong> for a job, an internship or national service, from your CV.
        </li>
        <li>
          <strong>Downloads</strong> as PDF or Word, free, with no watermark.
        </li>
      </ul>

      <h2>What we stand for</h2>
      <ul>
        <li>
          <strong>Free for students.</strong> Every template and every download, with no watermark and no trial that runs out.
        </li>
        <li>
          <strong>Private by default.</strong> There is no account. Your CV is saved on your own device, and files you upload are read
          in your browser and are not sent to us. Read the <a href="/privacy">privacy policy</a> for the details.
        </li>
        <li>
          <strong>Honest advice.</strong> We tell you what hiring software can and cannot do, and we do not promise jobs. A strong CV
          helps, but it is only one part of getting hired.
        </li>
      </ul>

      <p className="pt-4">
        <ButtonLink href="/builder" size="lg">
          Build my CV
        </ButtonLink>
      </p>
    </PageShell>
  );
}

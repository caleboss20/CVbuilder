import type { Metadata } from "next";
import { PageShell } from "@/components/marketing/page-shell";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The plain-language terms for using CV11, the free CV builder for students in Ghana.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <PageShell
      title="Terms of service"
      meta="Last updated 16 October 2026"
      intro="These terms explain how you can use CV11. By using the site you agree to them."
    >
      <h2>Using CV11</h2>
      <p>
        CV11 is free to use. You can build CVs and cover letters, check a CV, and download your work as PDF or Word. Please use it
        for your own applications and do not misuse it, for example by trying to break it or by using it to build something harmful.
      </p>

      <h2>Your content</h2>
      <p>
        Your CV is yours. You are responsible for what you put in it, so make sure it is true and that you have permission to list
        your referees. We do not check your CV for accuracy.
      </p>

      <h2>Our templates and software</h2>
      <p>
        The templates, designs and code of CV11 belong to us. You may use the CVs you create with them for your own job, internship
        and study applications. Please do not copy, resell or redistribute the templates themselves.
      </p>

      <h2>No promises about results</h2>
      <p>
        We try to make clear, professional CVs, and our CV checker and tips are based on common good practice. But no tool can
        promise you an interview or a job, or that every employer&apos;s software will read your CV the same way. The score from the
        CV checker is guidance, not a guarantee.
      </p>

      <h2>The service as it is</h2>
      <p>
        CV11 is provided as it is. We work to keep it available and accurate, but it may sometimes be unavailable or contain
        mistakes. Download and keep a copy of any CV you care about. To the extent the law allows, we are not responsible for losses
        that come from using, or being unable to use, the site.
      </p>

      {siteConfig.download.enabled && (
        <>
          <h2>Payments and refunds</h2>
          <p>
            Building and previewing a CV, the CV checker and the letters are free. Downloading a finished CV costs {siteConfig.download.price}, paid
            once through Paystack with mobile money or a card. One payment unlocks PDF and Word downloads of that one CV for{" "}
            {siteConfig.download.days} days, and you can edit the CV and download it again during that time. A new CV needs a new payment.
          </p>
          <p>
            If you were charged but could not download, or you were charged twice for the same CV, message us on WhatsApp with the email you
            signed up with and we will fix it or refund you. Because a downloaded file cannot be taken back, we do not refund a CV that you have
            successfully downloaded. We never see or store your card or mobile money details; Paystack handles them.
          </p>
        </>
      )}

      <h2>Changes</h2>
      <p>
        We may update these terms as CV11 grows, for example when accounts are added. The date at the top shows when they last
        changed. Continuing to use the site after a change means you accept the new terms.
      </p>

      <h2>Privacy</h2>
      <p>
        How we handle your data is explained in the <a href="/privacy">privacy policy</a>.
      </p>
    </PageShell>
  );
}

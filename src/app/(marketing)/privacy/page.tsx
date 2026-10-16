import type { Metadata } from "next";
import { PageShell } from "@/components/marketing/page-shell";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How CV11 handles your CV and your data. In short: your CV stays on your device.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <PageShell
      title="Privacy policy"
      meta="Last updated 16 October 2026"
      intro="The short version: your CV stays on your device. We do not ask you to create an account, and we do not receive the CV you build or the files you upload."
    >
      <h2>What we collect</h2>
      <p>
        <strong>We do not collect your CV.</strong> Everything you type into the builder, the cover letter tool or the CV checker is
        processed in your browser. There is no account and no sign-in.
      </p>

      <h2>What is saved on your device</h2>
      <p>To make the tools work, CV11 saves a few things in your browser&apos;s local storage:</p>
      <ul>
        <li>your CV and cover letter drafts, so they are still there when you come back</li>
        <li>your light or dark mode choice</li>
        <li>the fastest time you have built a CV, for the summary after you download</li>
      </ul>
      <p>
        This stays on the phone or computer you used. It is not sent to us. Clearing your browser data, or choosing{" "}
        <strong>New CV</strong> in the builder, removes it. If you use a shared computer, download your CV and clear it before you
        leave.
      </p>

      <h2>Files you upload</h2>
      <p>
        When you upload a PDF or Word file to import a CV or to check it, the file is read by your browser. It is not uploaded to our
        servers.
      </p>

      <h2>Voice typing</h2>
      <p>
        The &quot;Say it, we&apos;ll write it&quot; feature uses the speech recognition built into your browser. In browsers such as
        Chrome and Edge, that means your browser may send your voice to the browser company&apos;s own speech service to turn it into
        text. That is handled by them under their privacy policy, not by CV11. If you do not want this, type instead of speaking.
      </p>

      <h2>Cookies and tracking</h2>
      <p>
        CV11 does not use advertising cookies and does not sell or share personal data. We use Vercel Analytics for anonymous usage
        statistics, such as which pages are visited and how many CVs are downloaded. It does not use cookies and never receives
        what you write in your CV or letters.
      </p>

      <h2>Your choices</h2>
      <ul>
        <li>Delete your saved CV any time with New CV in the builder, or by clearing your browser&apos;s site data.</li>
        <li>Use the tools without voice typing if you prefer.</li>
      </ul>

      <h2>Changes to this policy</h2>
      <p>
        If we change how CV11 handles data, for example by adding accounts, we will update this page and show the new date at the
        top.
      </p>
    </PageShell>
  );
}

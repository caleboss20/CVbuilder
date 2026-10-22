# CV11: Investor Brief

> **How to read this.** CV11 is a working product, not a concept: everything described as "live" is on the public site and in the open code. This brief is deliberately honest. It separates **what exists**, **what is built but switched off**, and **what is only planned**, and it **does not claim traction numbers** (there is no revenue yet, because payments are not switched on). Square brackets like `[add from dashboard]` mark facts only the founder can supply. For depth, see [`PROJECT-GUIDE.md`](PROJECT-GUIDE.md), [`FEATURES.md`](FEATURES.md) and [`DEVELOPER-HANDBOOK.md`](DEVELOPER-HANDBOOK.md). Live site: <https://cv11-one.vercel.app>.

---

## 1. The one-liner

**CV11 is the free-to-start CV builder and job-hunt toolkit for students in Ghana, with a bulk certificate maker for the people who run their events.** It works on a phone, keeps the student's CV on their own device, and charges a small one-time fee only when a finished CV is downloaded.

---

## 2. The problem

**Students and fresh graduates (the main market).** A Ghanaian final-year student typically has no job history, little idea what a good CV looks like, and a phone rather than a laptop. The tools that exist are built for other markets: they demand an account first, hide basic features behind a paywall, and offer nothing for local realities (national service, attachments, a first CV with no work history). The result is a retyped Word file, a paid cafe, or a CV that applicant-tracking software cannot read. Many students also apply to several places and have no easy way to send a different, tailored version to each.

**Event organisers (the second market).** Student leaders, clubs, churches, NGOs, schools and small training centres need 50 to 500 certificates for every event. Today they design one in Canva or Word and retype each name, or wrestle with a mail merge. It is slow, error-prone, and repeated for every event.

**An important link between the two:** the people who receive certificates are the same students who need CVs.

---

## 3. The solution (what exists today)

**For students (live):** a step-by-step CV builder with a live A4 preview and 38 templates; example CVs for 30 courses; an automatic recommendation of the right CV type; plain-rule coaching on every bullet; a keyword matcher against a pasted job advert; voice input; PDF and Word download; a CV checker that scores any CV out of 100 with specific fixes; 8 letter types in the formal Ghanaian layout with a drawn signature; a tool to sign any existing letter and a Text-to-PDF tool; interview preparation for 9 fields; an application tracker; a national service checklist; and **CV versions**, which produces the same CV in up to 10 looks (one per company), each as its own real-text PDF.

**For organisers (live):** paste a list of names, choose from 35 original designs (wide and tall) or **upload their own certificate** (a Canva PDF or a photo), optionally add a logo anywhere on the page, and download a certificate for every person as a ZIP or one PDF to print. Free for up to 15 per batch.

**Live in test mode:** one-time payment (GH₵ 7 per CV) through Paystack with mobile money and cards (live keys need Paystack's business verification). **Built but switched off:** AI writing help (rewrite a bullet, tidy a project, write a summary, correct speech-recognition mistakes), restricted to the owner while quality is checked.

**Also live for organisers:** one shared link or QR so each person downloads only their own certificate (names pasted by the organiser, or added by attendees and then released), a verify QR on each certificate that opens a "this certificate is genuine" page, link management, and a bigger-batch unlock (50, 200 or 500) sold for about GH₵ 20, 50 or 100 and unlocked by an administrator today.

**Planned:** automatic payment for bigger certificate batches; bulk email to every recipient; attendance-gated certificates for online bootcamps; opening the AI to students.

### A three-minute demo script

1. Open the homepage on a phone. Tap *Build my CV*, choose *Data Science*, answer the three questions, and watch the CV type and template recommended with a one-line reason.
2. Type a messy bullet ("i was helping customers in my uncle shop and counting stock"). Show the one-line coach, tap a stronger opener.
3. Paste a job advert into *Match a job*; add the missing keywords in one tap. Download the PDF and open it (selectable text).
4. Open **Versions**, make three looks, name them after three companies, show the three file names.
5. Open **Certificates**: *Try it with sample Ghanaian names*, switch designs, drag a logo, download the ZIP of 10. Then switch to *Use my own certificate*, upload a Canva PDF, drag the name into place.
6. Open the CV checker, upload a PDF, show the score and the exact fixes.

---

## 4. Why this can work in Ghana

*(Qualitative; no market-size figures are asserted here. Add sourced figures if you want them in a deck.)*

- **Phone-first and WhatsApp-native.** Students share useful links in WhatsApp groups; CV11 is built around that loop (a share prompt after a download, a shareable score picture, an ask-for-help button).
- **Mobile money is the normal way to pay small amounts.** Paystack supports MTN, Telecel and AirtelTigo mobile money and cards in Ghana.
- **A recurring, calendar-driven need.** Every graduating class needs a first CV and a national service application; every event needs certificates.
- **Local content is a real barrier to entry for foreign tools:** course-specific examples, the formal Ghanaian letter layout, national service material, support for Ghanaian letters (Ɛ, Ɔ) in PDFs.
- **Low willingness to pay requires a very low price and no subscription.** A one-time GH₵ 7 and a free tier that is genuinely useful is designed for that.

---

## 5. Business model

### 5.1 Revenue streams

| # | Stream | State | Price (designed) | Notes |
|---|---|---|---|---|
| 1 | **CV download** | Live, test mode | GH₵ 7 once per CV, 30 days of PDF, Word and all versions | Free to build and preview; pay only to download. Priced just under a local competitor's GH₵ 9 |
| 2 | **Bulk certificates, paid batches** | Built; unlocked by hand today | Proposed: about GH₵ 20 up to 50, GH₵ 50 up to 200, GH₵ 100 up to 500 (to be tested) | Free up to 15 per batch applies to both built-in designs and uploaded certificates. Charging applies at the point of download beyond the free amount |
| 3 | **Certificate extras** | Built: share link, self-register, verify QR | To be set | QR verification, attendee sign-up link, WhatsApp delivery, "Made with CV11" footer removal |
| 4 | **Club or organisation plans** | Idea | To be set | For groups that issue certificates every month |
| 5 | **AI pro features** | Idea | To be set | Only if students ask for more than the free daily AI allowance |

### 5.2 Unit economics (illustrative arithmetic, not a forecast)

**One CV download**

| Item | Amount | Basis |
|---|---|---|
| Price | GH₵ 7.00 | `pay_settings` default |
| Paystack fee | about GH₵ 0.14 | About 1.95% in Ghana (Paystack's published rate; confirm for your account) |
| **Net per CV** | **about GH₵ 6.86** | |
| Cost to produce the PDF or Word file | about zero | Made on the student's device |
| Hosting and database | free tiers at early volume | Vercel and Supabase |
| AI cost per paying user | well under a cent, and zero on the free tier | Flash-Lite model; per-person and per-site daily limits in the database |

**What the numbers mean.** Gross margin is essentially the payment fee, so the business is constrained by **acquisition and conversion**, not by cost of service.

**Illustrative monthly net revenue from CV downloads alone** (`paid CVs × GH₵ 6.86`):

| Paid CVs per month | Net revenue |
|---|---|
| 100 | about GH₵ 686 |
| 500 | about GH₵ 3,430 |
| 1,000 | about GH₵ 6,860 |
| 5,000 | about GH₵ 34,300 |

These are **arithmetic, not predictions**. The decisive unknown is the conversion rate from "finished a CV" to "paid", which will be measured after launch. The price is a single value in the database and can be changed without a deploy.

**Certificates (illustrative, using the proposed tiers and the same fee):** a GH₵ 50 batch nets about GH₵ 49.03; 20 such batches a month would net about GH₵ 980. Organisers are a smaller but higher-value group than individual students.

### 5.3 The conversion funnel and how it is measured

`visit` → `CV started` → `CV finished (downloaded)` → `paid`. The first three are already recorded anonymously (events `first_visit`, `cv_started`, `cv_downloaded`) and shown on the admin dashboard, including the start-to-finish funnel. **Not yet measured:** "reached the pay screen" and "paid" (payments are off), and certificate and version counts are recorded but not yet on the dashboard (queries exist in `supabase/stats.sql`). Adding the pay-screen events is the first analytics task before launch.

---

## 6. Go-to-market (plan, to be executed)

1. **Search traffic from content that already exists.** 30 course-specific example CV pages, CV guides, 8 letter guides and interview prep for 9 fields, all prerendered and listed in the sitemap, each pointing into the product.
2. **The WhatsApp loop.** After a download the student is prompted to share; the CV checker produces a "My CV scored 86/100" picture designed to be shared; a support button opens a WhatsApp chat.
3. **Campus partnerships (to start).** Departments, SRCs and student societies, with the certificate maker as the entry point: an organiser who makes 140 certificates exposes CV11 to 140 students. Ambassadors and department-level introductions.
4. **Organisers as a second door.** Certificates are useful on their own and bring a different audience; each certificate shows the organiser's own branding, and the free tier can carry a small "Made with CV11" line (planned).
5. **Credibility.** Real student testimonials (three live; the founder should confirm each student's consent to be quoted), a clear privacy position, and a fair refund rule.

**Acquisition cost is intentionally near zero** in the plan; the first goal is the first 1,000 finished CVs and the first 20 organiser batches, then measure conversion and price.

---

## 7. Competition

| | CV11 | HerbbyCV (a local competitor, observed from its public site) | Global CV builders |
|---|---|---|---|
| CV download price | GH₵ 7 once per CV, 30 days of re-downloads, versions included (when payments are on) | GH₵ 9 per CV download | Often subscriptions, priced in dollars |
| Free to build and preview | Yes | Yes | Often limited |
| Account needed to build | No | Account for the dashboard | Usually yes |
| Where the CV is stored | The student's device | Its privacy policy says CV content is collected | On their servers |
| Tools around the CV | Checker, 8 letter types, signing, interview prep, tracker, NSS checklist, versions | AI writing, community chat, map, messaging | Varies |
| Bulk certificates | Yes (35 designs plus upload-your-own); verification planned | Yes (behind login; details not public) | Separate products |
| Ghana-specific content | 30 course examples, formal Ghanaian letters, NSS | Not observed | Rarely |
| Payment terms stated | Planned on Terms and Pricing | Not stated in the public terms we saw | Varies |

**Honest read.** The competitor is live, taking payments, and has a certificate tool already. CV11's edge is breadth of free tools, privacy, local content, a clearer payment promise and (planned) certificate verification. CV11's weakness today is that its own payments are not yet switched on and it has no operating history to show.

---

## 8. Defensibility, and what is easy to copy

**Harder to copy:** local content built over time (examples, guides, letter layouts, interview material); the habit loop through WhatsApp and campuses; the privacy position if it is kept as a promise; the certificate-to-CV loop once verification exists; and a codebase designed so new content and templates are cheap to add.

**Easy to copy:** the idea of a paid CV download; individual templates; generic AI rewriting. Defensibility therefore depends on **distribution, trust and speed of execution**, not on one clever technology.

---

## 9. Traction

**No traction is claimed in this document.** The admin dashboard (`/admin`) shows, from the day counting started: people (first visits), CVs started and finished, letters downloaded and signed, WhatsApp shares, backups, active devices, accounts, daily trends, template popularity and the start-to-finish funnel. Owner devices and test copies are excluded so the numbers reflect real students.

`[Add: people, CVs finished, accounts, certificate batches and certificates made, WhatsApp shares, week-over-week change, and the date counting began, copied from /admin and supabase/stats.sql at the time of the meeting.]`

---

## 10. Roadmap

| When | Milestone | State |
|---|---|---|
| Now | CV builder, checker, letters, signing, interview prep, tracker, versions, certificates (35 designs, own design, logo) | Live |
| Next | Switch payments on (Paystack keys, run the payments SQL, test mode, go live) and add pay-screen analytics | Built, needs keys |
| Next | Own email sender for sign-up emails; Vercel Analytics enabled; testimonial consents | Owner tasks |
| Done | Certificate share link, attendee sign-up and verify QR; manual bigger-batch unlocks | Live |
| Soon | Open the AI writing help to students with daily limits | Built, off |
| Later | Typing-time suggestions; a certificate-to-CV loop ("add this to my CV"); more fields and templates; automated tests and CI | Planned |

---

## 11. Risks and how they are handled

| Risk | Why it matters | Mitigation |
|---|---|---|
| **Students will not pay** | The whole CV revenue stream depends on it | Everything else stays free (traffic and trust); the price is one database value; measure the funnel at launch; test GH₵ 7 to 10; certificates provide a second, higher-value stream |
| **Paywall can be bypassed** | The download is generated in the browser, so a determined user could get around the gate | Accepted at GH₵ 7 and a mostly non-technical audience; the planned verification and attendee features are server-recorded and cannot be bypassed in the browser |
| **Free certificate limit is browser-side** | Someone can make several free batches | Same: enforce with accounts and server records when verification ships |
| **Payment fraud or forged payments** | Money | The server asks Paystack directly; the database function needs a secret only the server holds; signed webhooks; the price is set in the database; no privileged database key exists anywhere |
| **AI cost or abuse** | Open-ended spend | Daily limits per person and per site stored in the database; refunds on failure; the free Flash-Lite tier (about 500 requests a day) at launch; fail closed if limits are missing |
| **AI says untrue things on a CV** | A made-up number can cost someone a job | Strict rules, validation that rejects invented numbers, suggestions the student must accept, never automatic |
| **Data protection law** | CV11 handles personal data of people in Ghana | Privacy-by-default design (CV never leaves the device), explicit consent for AI, clear policy. **Confirm with a Ghanaian lawyer** whether registration with the Data Protection Commission and any notices are required (Ghana's Data Protection Act, 2012) |
| **Platform dependence** | Vercel, Supabase, Google (Gemini), Paystack | Standard, replaceable components; no lock-in code beyond Supabase SQL and Paystack calls; costs and free-tier limits documented |
| **Single developer** | Key-person risk | A complete handover document set (this folder), readable code, a decision log; automated tests and CI are the top technical gap |
| **Competitor response** | A live local rival | Breadth of free tools, privacy, price and certificate verification; distribution through campuses |
| **Content licensing** | Templates and certificate designs | All designs are original drawings; fonts are open-licence with their licence texts; user-uploaded designs never leave the device |

---

## 12. Team, ask and use of funds

`[Founder name, background and role; any advisers or contributors.]`

`[The ask: amount, instrument, and runway it buys.]`

**Suggested structure for use of funds** (fill in amounts): campus and organiser acquisition; verified certificate and payment features; email, security and legal set-up (own email sender, data-protection registration advice, terms review); automated tests and monitoring; a second contributor.

---

## 13. Frequently asked questions

**Why is most of it free? How does that make money?** Free tools bring traffic and trust; the paid moment is the finished download, which is when the student most clearly values the product. Certificates add a separate, higher-value stream from organisers.

**What stops people downloading for free?** Nothing absolute: the file is made on their device. At this price and audience we judged a browser-side gate acceptable. The features planned next (verification, attendee sign-up) are recorded on the server and cannot be bypassed that way.

**Why not just generate PDFs on a server?** That would send every CV to our server, breaking the privacy promise that differentiates us, and add per-file cost. A browser can only save a real-text PDF through its print dialog, so the product is designed around that.

**Is the AI a gimmick?** It is a small, safe layer (four features) with strict rules, validation and daily limits, and it is not yet open to students. The rule-based helpers (coach, summary starter, keyword match, voice tidy-up) deliver most of the value today without AI.

**What is the biggest technical gap?** No automated tests and no continuous integration. Quality is held by strict type-checking, linting, production builds, manual testing and a phone checklist.

**Who can maintain this if the founder steps back?** The repository includes a project guide, a features reference, a developer handbook with recipes for common changes, a decision log and an owner checklist. The code is commented in plain language.

**What happens to the CV data?** It stays in the student's browser. Optional cloud save stores one row per signed-in user, protected by row-level security. Analytics hold a random device id and event names, never personal data.

**Are the certificate designs copied from Canva?** No. They are original vector drawings made to match styles the owner chose. Organisers who want an exact branded look upload their own certificate, which stays on their device.

---

## 14. Diligence map: where to verify each claim

| Claim | Where to look |
|---|---|
| The CV never leaves the device | `src/lib/builder.ts` (storage key), `src/components/builder/builder.tsx` (autosave), no upload code in `src/lib/read-cv-file.ts` |
| No privileged database key | Search the repo for "service_role": none; `src/server/supabase-rest.ts` uses the anon key only |
| The price cannot be set by the browser | `supabase/payments.sql` (`payment_start`) and `src/app/api/pay/start/route.ts` |
| Payments are verified server-side | `src/server/pay/confirm.ts`, `src/server/pay/paystack.ts` (signature check), `supabase/payments.sql` (`payment_confirm`) |
| The AI cannot invent numbers or rewrite voice transcripts freely | `src/server/ai/validate.ts`, `src/server/ai/features/fix-transcript.ts` |
| AI spend is capped | `supabase/ai.sql`, `src/server/ai/guards.ts` |
| 38 templates driven by config | `src/lib/templates.ts`, `src/components/cv/cv-templates-ats.tsx` |
| 35 certificate designs, uploads and logo | `src/lib/certificate-designs*.ts`, `src/lib/certificate-own.ts`, `src/components/tools/*certificate*.tsx` |
| Free limits are settings | `src/lib/site.ts` (`certificates.freeBatch`, `cvVersions.max`, `download`) |
| What is measured | `src/lib/track.ts`, `supabase/schema.sql` (`admin_stats`), `supabase/stats.sql` |
| Status of each feature | `docs/PROJECT-GUIDE.md` section 6.1 |

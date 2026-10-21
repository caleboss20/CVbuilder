# CV11: Features in Depth

> The companion to [`PROJECT-GUIDE.md`](PROJECT-GUIDE.md). The guide says *what exists and why*; this file says *exactly how each feature behaves*: what the user sees, the rules and numbers behind it, where it stores data, and which files implement it. It is written from the source code, so the numbers (scoring weights, limits, thresholds) are the real ones. If you change a rule in code, change it here too.
>
> **Status key:** **Live** (on the public site), **Built, off** (finished, behind a switch), **Built, owner-only**.

## Contents

1. [A walk through the app, as a student](#1-a-walk-through-the-app-as-a-student)
2. [The CV builder](#2-the-cv-builder)
3. [Templates and the page-fitting system](#3-templates-and-the-page-fitting-system)
4. [Exporting: PDF and Word](#4-exporting-pdf-and-word)
5. [Saving, backup and cloud sync](#5-saving-backup-and-cloud-sync)
6. [Importing an existing CV](#6-importing-an-existing-cv)
7. [CV versions](#7-cv-versions)
8. [The CV checker](#8-the-cv-checker)
9. [Letters](#9-letters)
10. [Signing letters and Text to PDF](#10-signing-letters-and-text-to-pdf)
11. [Interview prep, tracker, national service checklist](#11-interview-prep-tracker-national-service-checklist)
12. [Accounts](#12-accounts)
13. [AI writing help](#13-ai-writing-help)
14. [Payments](#14-payments)
15. [The bulk certificate maker](#15-the-bulk-certificate-maker)
16. [Owner tools and analytics](#16-owner-tools-and-analytics)
17. [Content pages and search visibility](#17-content-pages-and-search-visibility)

---

## 1. A walk through the app, as a student

Meet Akosua, a final-year Statistics student at KNUST. She finds CV11 because a classmate shared it in a WhatsApp group.

**The homepage.** A dark, glowing page opens with "the free CV builder made for students" and a fanned stack of real CVs rising from the bottom edge. A floating green WhatsApp button offers help. Scrolling down, the page does the selling in order:

1. **The problems** students recognise (blank page, weak wording, CVs that software cannot read), each paired with what CV11 does about it.
2. **An animated demo** where a casual sentence ("i was helping customers in my uncle shop and counting stock") is typed and turns into a polished bullet on a live CV. *This demo is scripted* (`src/lib/ai-demo.ts`): it shows the idea, it is not a live AI call.
3. **How it works**, in steps with small animated visuals.
4. **The job-hunt toolkit** as six cards: CV, checker, letters, signing, interview prep, tracker.
5. **"Find your style":** real templates rendered as full A4 pages, with filter tabs, an accent colour picker, and a swipeable carousel on phones.
6. **Certificates for everyone who showed up:** a pinboard of real certificate previews and four plain benefits, aimed at event organisers.
7. **Course examples** drifting past in a marquee, then **three student testimonials**, a **FAQ**, and a final call to action.

**Starting.** Akosua taps *Build my CV*. The builder asks how she wants to begin: **use a course example**, **start blank**, or **upload my CV**. She taps the "Computing and data" chip, picks *Data Science*, and answers three plain questions (what she is applying for, how much experience she has, her strongest point). CV11 recommends a **Graduate CV** (education and projects first) and explains why in one sentence.

**Building.** The editor is a short series of steps (Personal, Summary, Education, Projects, Experience, Skills, Extras, References). Faint grey placeholder text from the Data Science example shows her what good looks like, but never becomes her text. Under each bullet she types, one quiet line of advice appears ("Add a number: how many, how often or how much"), with tappable stronger openers. On a phone, an **Edit / Preview** switch flips between the form and a whole A4 page.

**Finishing.** She pastes a job advert into *Match a job*; CV11 lists the keywords her CV is missing and adds them in one tap. She taps **Download PDF**; the browser's save dialog opens with the file already named `Akosua_Mensah_CV`. A card celebrates the time she took and offers next steps: track applications, share on WhatsApp, save a backup.

**Going further.** She has five internship applications, so she opens **Versions**, makes five looks of the same CV (a plain one for the bank, a modern one for the startup...), names each after the company, and downloads them. She writes a **national service letter** with the formal Ghanaian layout and signs it with her finger. She practises **interview questions** for her field and logs each application in the **tracker** with a follow-up date.

A classmate who runs the statistics society uses a different part of the same site: he pastes 140 attendee names into the **certificate maker**, picks a navy-and-gold design, drags the society's logo into the corner, and downloads a ZIP of 140 PDFs (the free version makes 10 at a time).

Everything above ran in the browser. Akosua never made an account.

---

## 2. The CV builder

**Status: Live.** Files: `src/components/builder/builder.tsx` (the editor), `sections.tsx` (the form steps), `fields.tsx`, `start-screen.tsx`, `type-guide.tsx`, `src/lib/builder.ts`, `cv-type.ts`, `course-groups.ts`, `course-match.ts`.

### 2.1 How the builder is organised

The builder is a small state machine with four states, in `builder.tsx`:

| State | What the student sees |
|---|---|
| `loading` | A one-line "Loading your CV…" while the saved CV is read from the browser |
| `start` | The start screen: three ways to begin |
| `guide` | The three-question guide that recommends a CV type (only for a brand-new CV) |
| `editing` | The editor with live preview |

On load it reads the address for a few hints: `?template=<id>` (a template chosen on the homepage always wins), `?import=1` (show the upload screen even if a CV is saved), `?fromChecker=1` (a CV handed over by the checker, found in `sessionStorage` under `cv11-checker-handoff`), and the payment hints `?download=1` and `?paid=1` (see section 14). If a CV is saved it goes straight to `editing`; otherwise `start`.

Starting a different CV when one is saved asks first ("Replace your saved CV?") and **Keep my CV** really keeps it.

### 2.2 Starting: course picker and typed courses

Courses are shown in **9 groups** (Health; Engineering and built environment; Computing and data; Business and finance; Sciences and agriculture; Law, social sciences and humanities; Education; Creative and media; National service) so a student finds "Physics" in one tap. There are **30 course examples**: accounting, agriculture, architecture, banking, biological sciences, business administration, civil engineering, computer science, data science, economics, electrical engineering, English, environmental science, graphic design, human resource management, information technology, journalism, law, marketing, mechanical engineering, medical laboratory science, medicine, midwifery, national service, nursing, pharmacy, physics, psychology, public health and teaching.

**Any course can be typed.** `course-match.ts` holds a table of word stems per field (for example "biolog", "microbio", "genetic" lead to *Biological Sciences*). The **first matching row wins**, so more specific fields are listed before general ones. If nothing matches, the fallback is *Business Administration*, the most general student CV. The matched example is then **relabelled** with the typed course ("BSc Geography", role "Geography Student"). It is only ever used as placeholder guidance, so it never needs to be a perfect match.

A new CV starts **empty** and remembers the course (`courseSlug` or `courseName`). The example appears only as dimmed placeholder text and as a sample preview until the student types a name. Students never delete someone else's details.

### 2.3 The three-question guide and CV types

| CV type | Best for | Section order on the page |
|---|---|---|
| **Standard** | Work history to show | Contact, summary, experience, education, projects, skills, research, rest, references |
| **Graduate** | Students, fresh graduates | Contact, summary, education, projects, experience, skills, research, rest, references |
| **Skills-based** | Thin experience or changing field | Contact, summary, skills, projects, experience, education, research, rest, references |
| **Academic** | Postgraduate study, lecturing | Contact, summary, education, research, experience, projects, skills, rest, references |

`recommendCvType` picks one from the three answers, in this priority: applying for *postgraduate study* gives **Academic**; strongest point *skills* gives **Skills-based**; *no experience* or strongest point *education* gives **Graduate**; otherwise **Standard**. Each type has a plain default template (Ruled Classic, Date Column, Grey Bars, Serif Executive), all one-column and ATS-safe. The student can change the type any time; the editor stays on the same step if the new type has it.

The type also decides **which editor steps show, and in what order** (`stepOrder` in `builder.tsx`): Academic adds a *Research* step with one line per item (citations, talks), and the order of Education / Projects / Experience / Skills follows the table above. On the page, `HideEmptySections` reorders sections with CSS `order` so every template follows the type.

### 2.4 The editor steps and what each field is for

Personal (name, target role, location, phone, email, links, optional photo); Summary; Education; Experience (title, place, dates, bullets); Projects (name and "what it was and what it achieved"); Skills (named groups, comma-separated items); Extras (languages with suggestions such as Twi and Ewe, certifications, awards, interests); References. Entries can be reordered with up/down buttons and removed. A photo is optional; only photo templates show it, and the preview never shows a sample photo.

### 2.5 The help built into the editor (no AI)

**Bullet coach** (`bullet-coach.ts`) gives **one tip at a time, in this priority**, so it never becomes a wall of warnings:

1. Fewer than 4 words: "Say a little more: what did you do, and what changed?"
2. Contains filler ("responsible for", "worked on", "hard-working", "team player"...): flagged, with six stronger openers to tap (Led, Built, Organised, Trained, Managed, Supported).
3. Does not start with an action verb: "Start with an action word," with openers.
4. No number anywhere: "Add a number... For example 'Trained 40 volunteers'."
5. More than 30 words: "A bit long."
6. Otherwise: "Strong bullet."

Tapping an opener (`startWith`) removes a leading filler phrase, lower-cases the rest unless it starts with an acronym, and puts the verb in front; the student finishes the grammar. The same verb and filler lists power the checker, so a bullet that passes here also scores well there.

**Summary starter** (`summary-starter.ts`): only while the summary box is empty (so it can never overwrite writing), the student picks what they want next (*An internship / National service / My first job / Further study*) and a first draft is built from what they already typed: their role (or "BSc X student"), school, first job, and top three skills, finishing "Looking for ...". It is a starting point to edit and says nothing it cannot back up.

**Job match** (`job-match.ts`, `job-match-panel.tsx`): paste a job advert; `extractKeywords` finds known skills from a list of 133 terms (Excel, QuickBooks, SQL, patient care, lesson planning...), drops shorter ones covered by longer ones ("excel" inside "microsoft excel"), adds up to 6 words the advert repeats, and caps at 20. `matchCv` reports which are present and missing and a match percentage. Missing skills can be added to the CV in one tap, formatted nicely ("power bi" becomes "Power BI").

**Voice input** (`voice-input.tsx`, `refine.ts`, `speech.ts`): the student speaks (browser speech recognition, Chrome, Edge, Android) or types naturally; `refineText` tidies it into CV lines using rules, not AI: removes fillers ("um", "you know", "basically"), splits at sentence breaks and joining words, drops "I"/"we" starts, rewrites openers ("was helping" becomes "Supported", "was selling" becomes "Sold"), and turns "maybe 50" into "around 50". The student reviews and edits before adding. (The AI voice check in section 13 is a separate, optional layer on top.)

### 2.6 The strength score and checklist

`cvStrength` is a simple, honest checklist, each item worth 10 percent: full name and role; phone and email; summary of 25 to 60 words; a degree or school; at least one experience; 2 or more bullets in each experience; a number in at least one bullet; a project; at least 5 skills; languages. The score drives a progress display, and **from 80 up** the preview and PDF stretch sections to fill the page (section 3.3).

### 2.7 Building time

`build-timer.tsx` measures *active* time (pausing after idle), stores the best time in `cv11-best-time`, and the first download shows "built in N minutes" with a new-best flourish. `finishedAt` and `timeSpent` are stored with the CV.

---

## 3. Templates and the page-fitting system

### 3.1 The 38 templates

Single-column, ATS-safe (plain headings, no photo): ATS Classic, Simple Bold, Ruled Classic, Serif Executive, Serif Navy, Grey Bars, Divided Simple, Icon Line, Date Column, Lavender Band, Spaced Rule, Label Column, Accent Icons, Contact Right. Photo-capable designs: Sage, Teal Header, Soft Bars, Grey Header, Clean Rule, Blue Diagonal, Navy Panel, Dark Header, Modern Photo, Slate Band, Navy Ring, Mono Split, Accent Portrait, Photo Classic. Other styles: Elegant Line, Bold Timeline, Soft Band. Two-column: Side Timeline, Side Stripe, Side Panel, Thin Split, Grid Left, Grid Band, Grid Spaced.

Each has tags (`simple`, `photo`, `ats`) in `src/lib/templates.ts`. The picker shows "ATS-safe", "Photo" and "Two columns" badges and a plain-language explanation of what ATS-safe means. `template-advice.ts` leads with suggested templates for the student's field with a one-line reason ("Recommended for Health").

### 3.2 The two layout engines

In `cv-templates-ats.tsx`, `makeStack` (one column) and `makeSidebar` (two columns) are driven by config objects. A stack config chooses:

- **Heading style:** `rule`, `thick`, `plain`, `bar`, `tint`, `divider`, `spaced`, `display`, `label`, `title`
- **Entry style:** `role-first`, `org-first`, `date-column`, `title-caps`, `stacked`, `italic-right`
- **Skills style:** `columns`, `groups`, `sections`, `inline`
- **Header:** `center`, `left`, `icons`, `photo`, `accent`, `split`
- plus `accent` colour, `serif`, name and role classes, contact separator, `labelColumn`, `skillCols`, and section titles.

Every config reads its colour from the CSS variable `--cv-accent`, so the colour picker, the PDF and the Word export keep working for all of them. **Rule:** each section heading is an `<h3>` that is a direct child of its `<section>`; `HideEmptySections` depends on that to hide empty sections and reorder by CV type.

### 3.3 One A4 page, edge to edge

A4 is laid out at **794 by 1123 pixels** (`page-fit.ts`). A CV is laid out at some width `w` and zoomed by `794 / w`; a narrower layout makes the content taller *and* the zoom bigger, so printed height grows. Two directions:

- **Short CV, fill the page** (`fillWidth`): binary-search for the narrowest layout width (never below 80 percent of A4, so text grows by up to 25 percent) at which the zoomed CV still fits one page. Applied only when the strength score is at least 80, so a half-written CV does not jump around while the student types.
- **Long CV, shrink to fit** (`PrintCopy`): if the CV is taller than one page, lay it out wider (up to 1 / 0.72) and zoom down so it fits exactly one page. Below a 0.72 shrink it is allowed to run onto a second page, and the builder warns the student.

`CvPageFrame` shows any CV like a PDF preview: laid out at real A4 width then scaled to the container, so a phone sees the same complete page a recruiter would, never a reflowed or cut-off version. It can be `lazy` (a blank A4 placeholder until near the screen).

---

## 4. Exporting: PDF and Word

**PDF** goes through the browser's print engine, deliberately (see decision D2 in the guide): the text stays real and selectable, which is what applicant-tracking software reads.

1. `PrintCopy` (`print-copy.tsx`) renders a full-size, off-screen copy of the CV with `id="cv-print"`. It is positioned off-screen, not `display:none`, so its height can be measured for fit-to-page.
2. A print stylesheet (`@media print`, A4, zero margin) hides everything except `#cv-print` and keeps colours exact. Lists, sections and paragraphs avoid page breaks; headings avoid being stranded.
3. The Download button sets `document.title` to the file name (`Name_CV`), because the browser uses the page title as the PDF's file name, calls `window.print()`, then restores the title.

**Word** (`docx-export.ts`, loaded only when clicked): one clean column with real headings and bullet lists, which applicant tracking systems read reliably; accent colour applied. The Word file is template-agnostic.

After the **first** download the CV is marked finished, `cv_downloaded` is counted, and a completion card appears (time taken, strength, next steps). Later downloads show a small closable share nudge instead.

---

## 5. Saving, backup and cloud sync

**Autosave:** the CV is written to `localStorage` (`cv11-builder-v1`) 500 ms after the last change, with a visible saved tick.

**Backup file** (`backup.ts`): one JSON bundle of everything a student has made, keyed by storage key. Keys included: the CV, the letter in progress, the signature, the application tracker, the national service checklist, and the CV versions. The file is `{ app: "cv11", version: 1, createdAt, data }`, downloaded as `CV11-backup-<date>.json`. Restoring checks everything first (right app marker, a CV present, valid JSON) and writes nothing if anything is wrong, so a bad file never leaves half a backup behind.

**Cloud sync** (`cloud-sync.ts`, `cloud-sync-panel.tsx`): for signed-in students, **buttons only** (no background sync): *Save to my account* upserts the same backup bundle into the `cv_sync` table (one row per user, protected by row-level security), *Load from my account* replaces the browser copy, and the panel shows when it was last saved. Errors are translated into plain language (for example "Saving to your account is not set up yet" if the SQL has not been run).

---

## 6. Importing an existing CV

**Reading the file** (`read-cv-file.ts`): PDF, Word (.docx) and text files, up to **8 MB** and **8 PDF pages**, entirely in the browser (the PDF and Word readers load only when needed). Old `.doc` files and scanned image PDFs get a clear "save as .docx or paste the text" message. A PDF stores loose text fragments with coordinates, so lines are rebuilt; if the page has **two columns**, `findGutter` finds the empty vertical strip between them and each column is read separately, top to bottom, starting with the one that holds the top of the page (usually the name).

**Turning text into fields** (`cv-import.ts`, rule-based and best-effort): the shared `splitSections` finds headings (a line of 5 words or fewer matching patterns like "Work Experience", "Education and Training", "Leadership", "Publications"). Then each section is read the way a person would:

- *Experience, leadership, volunteering:* a job is a header line with dates followed by bullets. Dates are recognised in many forms ("Jun – Aug 2025", "2022 – 2026", "Jan 2025 – present"). A header can be split by comma, bar, dash or "at". Wrapped bullets (a lowercase continuation line) are joined. A role on one line and "Organisation, Town  dates" on the next form one entry, not two.
- *Education:* lines with degree words (BSc, Diploma, WASSCE...) or dates start an entry; a following line with school and dates completes it.
- *Skills:* "Software: Excel, Canva" becomes a group; loose items go in one unnamed group.
- *Contact:* email and phone by pattern (Ghana mobile numbers like 024 123 4567 and +233 24 123 4567).

**Nothing is silently lost:** lines that could not be placed come back as `leftover`, shown to the student with counts of what was found ("3 jobs, 1 school, 6 skills") so they can copy them across by hand.

---

## 7. CV versions

**Status: Live.** Files: `src/components/builder/versions-maker.tsx`, `print-copy.tsx`, `src/lib/cv-versions.ts`, route `/builder/versions`.

**Idea:** a version is not a copy of the CV. It is `{ id, label, role, template, accent }` laid over the one saved CV by `deriveCv(base, version)`, so editing the CV in the builder changes every version at once. Limit: `siteConfig.cvVersions.max` (10).

**Flow:** the page loads the saved CV (needs a name; otherwise "Build your CV first"), gives an older CV a `cvId` if it has none, and loads saved versions or creates **three mixed ones**. `templatePool` offers the CV's own template first, then the ATS-safe templates, then the rest, and skips photo templates when the CV has no photo. Controls: *Add a version*, *Give each a different template*, *Use one template for all*, plus per-card name, role line, template and colour. Each card shows a live, lazily rendered thumbnail.

**Downloading:** `printQueue` goes through the versions in order. For each: render `PrintCopy` for the derived CV, wait three animation frames so it is laid out, set `document.title` to the file name (`versionFileName`: `Name_Label_CV`, de-duplicated), call `window.print()`, restore the title. The browser asks the student to save each file. **Why not a ZIP?** A browser can only save a real-text PDF through its print dialog; a ZIP would mean turning each CV into a picture (losing readable text) or sending it to a server (breaking the privacy promise). On phones the page advises downloading one at a time.

Downloads use the same payment gate as the builder; one payment for a CV covers all its versions. Anonymous count: `cv_versions_downloaded` (the number of versions, nothing else).

---

## 8. The CV checker

**Status: Live.** Files: `src/components/checker/cv-checker.tsx`, `score-card.tsx`, `src/lib/cv-check.ts`, `industries.ts`, `score-card.ts`.

**What the student does:** uploads a PDF or Word CV (or pastes text), optionally pastes a job advert, picks an industry (one of 10, or "Other" and types their own field), and picks "standard" or "academic". Everything runs in the browser; nothing is uploaded. A scanned image PDF yields almost no text, so fewer than 40 words triggers a "this looks like a picture" message.

**How the score works.** The CV text is split into sections and bullet points, and a list of small checks runs. Each check earns points out of its own maximum; the final score is `points earned / points available`, so a check that does not apply (no advert pasted) **drops out and the rest scale to 100**. A check is *good* at 80 percent or more, *ok* at 50 to 79, *fix* below 50. Bands: **80+ Strong**, **60 to 79 Good, with gaps**, below 60 **Needs work**. Results show the biggest problems first.

| Area | Check (id) | Max | How it is scored |
|---|---|---|---|
| Job fit | Keywords from the job advert (`keywords`) | 30 | % of advert keywords found in the CV. Only if an advert of 40+ characters yields at least 3 keywords |
| Industry | Words used in your field (`industry`) | 10 | Matches against the industry's keyword list; 8 matches (or all, for a short typed list) is full marks |
| Structure | Contact details (`contact`) | 4 | Half for an email, half for a phone number |
| Structure | Summary at the top (`summary`) | 4 | 25 to 70 words full; 12+ words 60%; shorter 30%; none 0 |
| Structure | Experience section (`experience-section`) | 5 | Heading present full; bullets but no heading half |
| Structure | Education (`education`) | 4 | A heading, or degree words (BSc, HND, WASSCE, SHS...) |
| Structure | Skills section (`skills`) | 3 | Items found divided by 5, capped at full |
| Structure | Research and publications (`research`) | 4 | **Academic CVs only** |
| Experience | Numbers in your bullet points (`numbers`) | 10 | Half the bullets containing a digit is full marks |
| Experience | Strong opening words (`verbs`) | 8 | 80% starting with an action verb is full marks |
| Experience | Enough detail (`amount`) | 4 | Bullets divided by 6 |
| Experience | Bullet points about your work (`bullets`) | 22 | **Replaces the three above when no bullets are found** (scores 0 and says how to write them) |
| Experience | Filler phrases (`filler`) | 3 | None full, one half, two or more 0 |
| Clarity | Length (`length`) | 6 | Under 150 words 20%; ramps to full at 300; full to 750 words (2,200 for academic); then 60% / 30% |
| Clarity | Dates (`dates`) | 3 | Years found divided by 3 |
| Clarity | Short, scannable bullets (`bullet-length`) | 3 | Average 24 words or fewer is full; over 32 is 30% |

Each check carries one or two plain sentences of advice and, where useful, the exact items to fix (missing keywords, the weakest bullets, the long bullets). The result also has a percentage per area, matched and missing keywords, notes about unscored areas ("No advert was added"), and stats. **Action verbs** are recognised in present or past form through likely past forms ("assist" finds "assisted"), plus a list of irregular verbs. **Section headings** are recognised by patterns (`^(work |professional )?(experience|history)$` and so on); a line over 45 characters or 5 words is never a heading.

**Hand-over:** *Fix this in the builder* stores the CV text in `sessionStorage` and opens `/builder?fromChecker=1`, where the import code (section 6) turns it into fields. **Share my score** draws a picture ("My CV scored 86/100") on a canvas in the browser, no server, and offers the phone's share sheet (WhatsApp included), a download, or a plain WhatsApp link.

---

## 9. Letters

**Status: Live.** Files: `src/components/builder/cover-letter.tsx`, `src/lib/cover-letter.ts`, `letter-guides.ts`, `src/app/cover-letter/page.tsx`, `src/app/(marketing)/letters/`.

**Eight letter types:** job, internship, national service, scholarship, university application, reference request, thank-you after an interview, follow-up. Each has its own form wording (`LetterKindConfig`: field labels, placeholders, quick picks that fill the organisation and role in one tap) and a subject line ("APPLICATION FOR ..."). Scholarship letters add questions about results, family situation (only if the scholarship asks about need), what the student does to help with costs, what they need help paying for, and enclosures.

**How a draft is written:** by templates, not AI (`draftLetter`). `profile(cv)` pulls from the saved CV: an introduction ("I am a final-year nursing student at KNUST"), the first experience with its first two bullets, up to four skills, a project, the degree and an award. These are dropped into letter-type-specific paragraphs with per-type endings (job: "make a real contribution to your team"; internship: "eager to learn"; service: "ready to serve with commitment"). The student's own extra detail is tidied by the same `refineText` used for voice input.

**Layout:** two styles: **formal** (the traditional Ghanaian layout: the sender's address, phone and email block-aligned to the right, the date, the recipient's name, organisation and address, "Dear ...", a subject line in capitals, the body, a closing, the signature, the typed name, and an "Enclosures:" list when documents are attached; the closing is **"Yours sincerely," when the recipient is named and "Yours faithfully," when they are not**) and **cv** (a letterhead matching the CV). The letter is editable, the signature (drawn or uploaded) sits between the closing and the name, and **Download letter as PDF** uses the same print-copy technique with an off-screen `#letter-print`. Letter guides at `/letters/<slug>` (8 pages) explain what each letter should contain, then send the student to the writer with that type chosen.

---

## 10. Signing letters and Text to PDF

**Status: Live.** Files: `src/components/tools/sign-letter.tsx`, `own-letter-editor.tsx`, `src/components/builder/signature-pad.tsx`, `src/lib/sign-pdf.ts`.

**Signature pad:** draw with a finger or mouse (undo, redo, clear; nothing is saved until *Use this signature*; the page does not scroll while drawing) or upload a photo of a signature on white paper (the paper is removed and the image cropped). Output is a tightly cropped PNG fitted to 600 by 150. Saved under `cv11-signature-v1`, shared by the letter writer and signing tool.

**Sign a letter you already have** (`sign-letter.tsx`): upload a PDF or a photo/scan; `toPdfBytes` returns PDF bytes either way (a photo is re-drawn as a JPEG and placed on its own page). `renderPages` shows each page as an image (pdf.js). The tool **finds the closing line** (`CLOSING` matches "Yours faithfully/sincerely", "Regards" and so on, taking the lowest match) and starts the signature there, even on the right side of the page; the student drags it. Left / Centre / Right align it. `stampSignature` writes it onto that page of the **original** PDF so text stays sharp and selectable.

**Text to PDF** (`own-letter-editor.tsx`): paste or type any text and download a PDF. `detectTextMode` guesses **letter** (has "Dear..." or a closing), **code** (indentation, SQL or language keywords, brackets and semicolons; monospace and indentation preserved) or **plain**; the student can override. A **title box** controls alignment, underline (placed below descenders), bold, capitals and size. A signature can be added to non-letters too. **Tap any line to edit it**: `buildLetterPdf` returns the bytes and the **regions** of each line so the preview can map taps back to text. Text with letters outside the standard PDF fonts (Ghanaian Ɛ and Ɔ) switches to an embedded Unicode font automatically. Word and PDF files can be uploaded as the source text.

Counted anonymously: `letter_signed`, `text_pdf_downloaded`.

---

## 11. Interview prep, tracker, national service checklist

- **Interview prep** (`interview-prep.ts`, `/interview-prep`, `/interview-prep/[field]`): general questions asked in almost every interview, plus questions for **9 fields** (health, engineering, computing, business, sciences, social, education, creative, service). Every question says *what the interviewer is really looking for* and how to build an honest answer, not a script to memorise. Folding cards built on `<details>` (works without JavaScript and is crawlable). No invented statistics.
- **Application tracker** (`applications.ts`, `application-tracker.tsx`): each application has company, role, status (**saved, applied, interview, offer, closed**), applied date, a follow-up date, a link and notes. Dates are plain `YYYY-MM-DD`. Follow-ups show as **overdue, today, soon, later, none**. Saved on the device only.
- **National service checklist** (`national-service-checklist.tsx`): general good-practice preparation steps with ticks saved on the device, clearly labelled as not official requirements.

---

## 12. Accounts

Email and password through Supabase Auth, with **email confirmation** and **password reset**. Sign-up, log-in and reset live in `(auth)` as full-screen pages in the style of Vercel's (logo left, switch button right, large heading, boxy 48-pixel fields, the site's blue button). `use-user.ts` keeps the signed-in user and access token up to date, **lazy by default**: the Supabase library (over 200 KB) is only downloaded when a saved login exists on the device (`sb-<project>-auth-token` in localStorage), so visitors who never log in never pay for it. Pages about accounts use `eager: true`.

An account is **never required** to build, check, write or sign. It is used for cloud save, to tie a payment to a person, and (for the owner) the admin tools. `AuthForm` has two palettes (site and neutral black-and-white for admin). Friendly error translations ("That email and password do not match"). After sign-up the student is told to tap the link in their email. If they were stopped at a Download button, `takeResume()` returns them to it afterwards.

---

## 13. AI writing help

**Status: Built, owner-only** (`AI_ACCESS=admin`). Files: `src/server/ai/*`, `src/app/api/ai/*/route.ts`, `src/lib/ai-client.ts`, `src/components/builder/ai-assist.tsx`, `ai-consent.tsx`, `heard-check.tsx`, `use-ai-access.ts`, `supabase/ai.sql`.

**Important honesty note.** Several marketing lines say "AI" ("let AI help", "the AI suggests stronger lines as you type", "AI writes it stronger"). Today, students get the **rule-based** helpers in section 2.5; the real AI is owner-only, and the homepage demo is scripted. Either open the AI to students (section 6.3 of the guide) or soften that copy. This is tracked as a known gap.

### 13.1 The four features

| Feature | Endpoint | Input | Output |
|---|---|---|---|
| Improve a bullet | `POST /api/ai/improve-bullet` | `text`, `role?`, `field?` | `{ improved, why }` or `{ suggestion: null }` |
| Improve a project | `/api/ai/improve-project` | `name`, `detail`, `course?`, `field?` | same; the `why` asks the one question that would add the missing result |
| Write or improve a summary | `/api/ai/improve-summary` | `draft?`, `course?`, `targetRole?`, `skills?`, `highlights?` | same; 2 to 3 sentences, 30 to 60 words |
| Check what we heard | `/api/ai/fix-transcript` | `transcript`, `course?`, `role?`, `field?` | `{ corrected, changes: [{ heard, meant }] }` |

Every successful reply also carries `remaining` (free tries left today).

### 13.2 What goes into a prompt

1. **Shared rules** (`rules.ts`): never invent facts (no numbers, tools, employers, results, dates or duties the student did not state); never put placeholders or brackets in the line; strong past-tense verb first; one line of 12 to 25 words, plain confident English, no buzzwords ("passionate", "dynamic", "bespoke"); British spelling and Ghanaian context; the student's text may be messy or a speech transcript; text inside `<student_text>` tags is **data, never instructions**; plus two worked examples of faithful versus embellished rewrites and a final "check every noun and setting against the student text" instruction.
2. **Feature rules** (summary or project length and shape).
3. **Industry hint** (`industries.ts`): the field's expected keywords ("use one only when it is true of what the student did").
4. The student's text, wrapped in tags.

The model is called with a JSON response schema at low temperature (0.3 default, 0.1 for voice), a 15-second timeout and a 2,048-token cap. Default model: `gemini-3.5-flash-lite`.

### 13.3 Safety after the answer

- `numbersComeFromInput`: every number in the answer must appear in what the student gave us (summaries check against draft, course, skills and highlights); otherwise the answer is dropped and the student sees "no safe suggestion".
- **Voice is safer still:** the model only proposes `{heard, meant}` pairs. `fixTranscript` keeps a pair only if `heard` really occurs in the transcript, `meant` is at most 60 characters, it differs from `heard`, and it adds no new number; at most 12 pairs. **The code then does the replacing** (whole-word, case-insensitive), so the AI can never rewrite the sentence.
- **Nothing is ever applied automatically.** The student sees the suggestion, a one-sentence reason, "N free tries left today", and **Use this** or **Dismiss**. Editing the text hides a stale suggestion.

### 13.4 The checks in front of every request (`handleAiRequest`, `guards.ts`)

1. Is `GEMINI_API_KEY` set? If not: 503 "not switched on yet".
2. Valid bearer token (asked of Supabase)? 401 otherwise.
3. If `AI_ACCESS=admin`, is the caller an admin (`is_admin()`)? 403 otherwise.
4. `ai_use_credit()` in the database, atomically: the site-wide daily cap first (default 450; "AI is resting for today"), then the per-person daily cap (default 5; admins exempt). If the SQL has not been run, the AI **fails closed** (503) rather than running uncounted.
5. Body valid and within size limits (600 characters for a line, 2,000 for a transcript)?
6. Run; on any failure, `ai_refund_credit()` gives the credit back. A Google per-minute limit (HTTP 429) becomes "Lots of students are using the AI right now. Please try again in a minute."

### 13.5 Consent

Before the first request the student sees a note (once per device): only the text in that box is sent to Google's AI, never name, phone or email, and Google may use it to improve its products on the free tier. The privacy page's "AI suggestions" section says the same. The AI lab at `/admin/ai-lab` lets the owner try it on messy text.

---

## 14. Payments

**Status: Built, off.** Files: `src/server/pay/*`, `src/app/api/pay/*`, `src/lib/payments.ts`, `src/components/builder/use-download-gate.tsx`, `pay-return.tsx`, `src/app/(marketing)/pay/return/page.tsx`, `supabase/payments.sql`.

**What is sold:** GH₵ 7 unlocks **one CV** (identified by a random `cvId` stored with it) for **30 days**, covering PDF, Word and all its versions. Editing and re-downloading in that window is free. A new CV needs a new payment.

**The gate** (`useDownloadGate`): with `NEXT_PUBLIC_PAYMENTS_ENABLED` off, every download runs as before. With it on, **not signed in** shows a "Create a free account to download" dialog (and remembers `/builder?download=1` so the student returns after signing up, even after confirming an email in another tab); **signed in** calls `cv_access(cvId)`; **unpaid** shows the price, what it covers, the payment methods and a **Pay GH₵ 7** button; **paid (or the owner)** runs the download. After payment, `/builder?paid=1` shows a "You're all set" dialog with PDF and Word buttons (the print dialog needs a fresh tap).

**The payment** is described step by step in the guide (section 12.2). Security properties worth knowing: the price comes from `pay_settings`, never from the browser; the **server asks Paystack** whether the money arrived (status success, currency GHS, matching reference) before unlocking; the confirmation database function needs a **secret** only the server holds; a signed **webhook** (HMAC-SHA512) covers a closed tab; confirming twice is safe. `/pay/return` asks up to 4 times, 2.5 seconds apart, then tells the student not to pay again and offers WhatsApp help.

**Copy follows the switch.** `siteConfig.download.enabled` rewrites the hero line, the final call to action, the FAQ, the About page, the share image, the Terms (adds Payments and refunds), the Privacy page (adds Payments) and the Pricing page (adds the GH₵ 7 card).

---

## 15. The bulk certificate maker

**Status: Live (free up to 15 per batch).** Files: `src/components/tools/certificate-maker.tsx`, `src/lib/certificates.ts`, `certificate-draw.ts`, `certificate-designs.ts`, `certificate-designs-more.ts`, `certificate-design-types.ts`, `certificate-names.ts`, `certificate-logo.ts`, `src/app/(marketing)/certificates/page.tsx`, `src/components/marketing/certificates-section.tsx`.

### 15.1 The page, top to bottom

1. **Choose a template**: a gallery of all 23 designs (thumbnails are drawn once, each in its own colours, one after another), then a colour row (Navy, Emerald, Burgundy, Royal blue, Purple, Black).
2. **Add the names**: paste a list; a live count and notes ("fixed capital letters on 12 · removed 3 repeated"); a *Try it with sample Ghanaian names* button.
3. **What it says**: kind of certificate, event, date (defaults to today, set after load so the prerendered page never depends on the clock), organised by, the sentence under the name, and the line under CERTIFICATE.
4. **Who signs**: up to two signers (name and title), each with their own optional drawn or uploaded signature pad. A second signer appears on the certificate once they have a name or a signature.
5. **Your logo (optional)**: choose a picture, drag it on the preview, resize with a slider, or put it back.

A live preview sticks beside the form (or below on a phone), with arrows to step through the names, and the download buttons.

### 15.2 Cleaning the list (`certificate-names.ts`)

A list with newlines is split on newlines; a single line is split on commas, semicolons or tabs. Per entry: take the **first Excel column** (before a tab); strip leading numbering and bullets (`1.`, `2)`, `3 -`, `•`); collapse spaces; drop trailing commas and full stops; skip anything without a letter. **Recasing:** a name written in one case, or at least 85 percent capitals (so "KOFI ɛNYONAM" with one stray lowercase Ghanaian letter still counts), becomes Title Case (after spaces, hyphens, apostrophes and full stops: "Nana Yaa Ofori-Atta"). A name that already mixes cases ("McDonald", "Nana Yaw") is left alone. **Duplicates** (case-insensitive) are dropped. At most `maxBatch` (500) names are kept; the **free tier uses the first `freeBatch` (10)**, with a notice and a WhatsApp link to ask for a bigger batch. File names are safe and unique (`Kwame_Boateng`, `Kwame_Boateng_2`).

### 15.3 Kinds and wording

| Kind | Line under CERTIFICATE | Default sentence |
|---|---|---|
| Participation | OF PARTICIPATION | For taking part in {event}, held on {date}. |
| Appreciation | OF APPRECIATION | In appreciation of your valuable contribution to {event}, held on {date}. |
| Achievement | OF ACHIEVEMENT | For outstanding achievement at {event}, held on {date}. |
| Completion | OF COMPLETION | For successfully completing {event} on {date}. |
| Award | OF AWARD | Awarded for winning {event}, held on {date}. |

All use "THIS CERTIFICATE IS PROUDLY PRESENTED TO" before the name. `{event}`, `{date}` and `{issuer}` are filled in and leftover commas or double spaces tidied.

### 15.4 The 23 designs

Wide (A4 landscape, 19): **Navy Waves** (wave bands, gold ribbons, seal), **Black & Gold** (dark curved panel, big wreath medal, gold frame), **Gold Frame** (notched corners, double gold frame, flourish), **Black Swoosh** (black and gold swooshes, fine gold line texture, wreath medal), **Emerald** (green waves with gold lines, big medal), **Hexagons** (purple-blue waves, hexagons, dots), **Blue Stripes** (diagonal blue stripes, thin frame, medal), **Sky Blades** (bright blue blades, "best award" badge, "1st" wreath), **Red Squares** and **Orange Squares** (rounded squares and a black ribbon badge), **Navy & Red** (navy wave, red and orange swooshes), **Dark & Gold** (deep navy page, gold writing), **Ribbon & Medal** (navy band, gold swoosh, hanging ribbon with medal), **Blue Wave** (light flowing lines, blue wave, gold rosette), **Royal Gold** (navy swooshes, thick gold frame, ribbon banner), **Navy Panel** (navy panel with crossing gold lines, big medal), **Clean Frame** (double gold frame, plain serif name, white-gold medal), **Blue Corners** (navy and light-blue corners, flat badge), **Ornate Border** (beaded border, scroll corners, name in capitals). Tall (A4 portrait, 4): **Teal Diagonal**, **White Wave**, **Ornate Cream** (cream page, gold frame, scroll corners, wreath shield, red wax seal) and **Excellence** (stripes, double frame, medal with navy ribbons).

All are **original drawings** matched in layout and mood to the reference templates the owner chose, not copies of any artwork. Each design defines a **background**, an optional **foreground** and a **layout** (positions, fonts, colours, whether the name sits on a line). The accent colour replaces the design's main colour.

### 15.5 How a certificate is drawn

`certificate-draw.ts`: **real PDF gradients** (axial and radial shading patterns registered on the page and filled by custom operators), polygons, rounded rotated squares, curves, flowing lines, laurel wreaths (leaves placed around a circle), and rosette medals (scalloped edge, ring, centre, optional star, wreath or two-line text, ribbon tails, soft shadow). `certificates.ts` then, per page: draws the design; the **logo** (if any); **CERTIFICATE** and the line under it; the "presented to" line; the **name**, as large as fits (script up to 68 points, shrinking in steps of 2 to a 24-point minimum); the **sentence** (wrapped, up to 4 lines); and the **signers** (a line, the signature image above the first, name and title below).

**Fonts** (subset into each PDF so files stay small): Marcellus (light serif titles), Playfair Display SC Bold (bold serif titles and capitals names), Poppins Regular, SemiBold and Bold (sentences, labels, heavy sans titles), Great Vibes (handwriting names). **DejaVu Sans** is loaded only if some text has a letter the others lack (Ghanaian Ɛ and Ɔ), and then used for just those pieces of text.

### 15.6 The logo

`readLogo` accepts any image up to 8 MB, shrinks it to fit 420 by 280 pixels and keeps it as a PNG (transparency preserved), so a batch of PDFs stays light. The position is stored as **fractions of the page** (`{ x, y, w }`: centre and width), so the same value works in the on-screen preview and in the PDF, on wide and tall pages. A new logo starts in the design's usual spot (a built-in default above the title, or a table of exceptions where artwork would collide), then the student drags it: **pointer events** (finger or mouse), arrow keys nudge 1 percent (5 with Shift), a slider sets width from 5 to 50 percent, and positions stay within 2 to 98 percent of the page. While a logo exists the preview image is drawn **without** it and an HTML copy floats above, so it moves instantly under the finger. Switching between a wide and a tall design resets the logo to the new design's usual spot; otherwise its place is kept.

### 15.7 Outputs and performance

- **One name:** a single PDF named after the person.
- **Several names:** a **ZIP of separate PDFs** (`buildSeparatePdfs` makes one document per person, then `fflate` zips them without compression since PDFs are already compressed) *or* **one PDF** with a page per person (`buildCombinedPdf`), best for printing.
- Measured: about 0.25 seconds per separate PDF (10 PDFs about 250 KB total), under a second for a combined PDF of a few names. The page yields to the browser between files so it never freezes. A 500-name ZIP would take about two minutes.
- Counted anonymously: `certificates_made` with the count and the design.

### 15.8 Use my own certificate (upload a Canva PDF or a photo)

**Status: Live.** Files: `src/components/tools/own-certificate-maker.tsx`, `certificates-tool.tsx`, `src/lib/certificate-own.ts`, `src/lib/save-file.ts`.

Many organisers already have a certificate (a Canva PDF, or a photo or scan) and only need the names added. The certificate page has two tabs, **Pick a design** and **Use my own certificate** (both stay mounted, so switching never loses what was typed).

1. **Upload.** A PDF (up to 15 MB; only the first page is used, and the student is told if there were more) or an image (shrunk so its longest side is at most 2,400 pixels, re-saved as a JPEG on a white backing so transparency cannot turn black). A **PDF is embedded as a page**, so Canva's artwork stays sharp vector art and its own text stays text; an **image** is placed on a page one A4 side wide, in the picture's own shape. A PDF that cannot be read (for example protected) gives a plain message suggesting downloading it again from Canva as a PDF.
2. **Place the name.** The preview shows the uploaded design with the name floating above it. The organiser **drags the name** with a finger or mouse (or nudges it with the arrow keys) to the blank spot, and chooses its **font** (handwriting, bold serif in capitals, clean sans, light serif), **colour** (swatches or any colour), **size** (16 to 140 points) and the **longest-name width** (20 to 95 percent of the page; longer names shrink to fit, to a 10-point minimum).
3. **Signatures (optional).** If the uploaded certificate has blank signature lines, up to **two signatures** can be drawn or uploaded and **dragged onto their lines** on the preview (with a size slider each); they are written onto every certificate in the batch.
4. **Add names and download.** The same name cleaner, free batch, notice and bigger-batch link as the built-in designs; one name gives a single PDF, several give a **ZIP of separate PDFs** or **one PDF with a page per name** (which shares one copy of the design, so it stays small). Ghanaian letters (Ɛ, Ɔ) fall back to the wider font automatically.

**Precision.** The position is stored as fractions of the page (`x`, `y`), the width as a fraction, and the size in PDF points, so the preview and the PDF agree: this was checked by overlaying the preview's own text on the rendered PDF output, on both an image design and a PDF design, and they coincide. The preview measures a name with the browser's canvas and the PDF measures it with the font's own metrics, so a very long name may differ by a hair in how it shrinks.

**Privacy.** The design and the names are read and written on the organiser's device. Nothing is uploaded. Counted anonymously as `certificates_made` with `design: "own"`.

### 15.9 How charging will work for certificates (design, not yet built)

**Today:** both modes share one free allowance, `siteConfig.certificates.freeBatch` (15). Beyond it, the page shows a notice and a WhatsApp link to ask for a bigger batch. The rule is enforced in the browser only.

**Planned when payments are live (reuses the CV payment system):**

- **The rule.** A batch of up to the free amount stays free, on a built-in design *or* on an uploaded one. When the pasted list is longer, the main button becomes **Pay GH₵ X and download N certificates**, where X is the price of the smallest tier that covers N (proposal, to be tested with organisers: up to 50 for about GH₵ 20, up to 200 for about GH₵ 50, up to 500 for about GH₵ 100).
- **Who pays.** The organiser, after signing up for a free account (so the payment is tied to a person), through Paystack with mobile money or card, exactly as for a CV.
- **Typo-fix rule.** A paid batch is unlocked for 30 days, so the organiser can correct a spelling and download again at no extra cost. The batch is identified by a random `batchId` made when the page opens and kept for the session.
- **Database.** Extend `payments` with a `kind` (`cv` or `certificates`) and a `quantity` (the most names the payment covers), add a `batch_access(batch_id)` function like `cv_access`, and keep the price table in `pay_settings` (or a new tiers table), so prices change without a deploy.
- **Honest limit.** Because certificates are made in the browser, a determined person could still bypass the gate, as with CVs. The plan makes the *valuable* parts server-recorded and therefore unbypassable: QR verification (each certificate gets a record the public can check) and the attendee sign-up link.
- **Growth lever.** The free tier may carry a small "Made with CV11" line, removed on paid batches.

---

## 16. Owner tools and analytics

- **`/admin`:** a black-and-white dashboard behind a login that only works for emails in the `admins` table, reading `admin_stats(days)` with the admin's own token (7, 30 or 90 days). It shows: people (first visits), CVs started, CVs finished, letters downloaded and signed, WhatsApp shares, backups saved, active devices and accounts; each with a change against the previous period; a daily chart; the most-finished templates; and the start-to-finish funnel by device.
- **Not shown yet** (recorded but not on the dashboard): certificates made and CV versions downloaded. Read them with queries 5 and 5b in `supabase/stats.sql`.
- **`/admin/ai-lab`:** paste a messy bullet, choose a field, see the AI's answer.
- **Counting rules:** events go to Vercel Analytics and to the `events` table, **except** on `localhost`, Vercel preview deployments, and any device flagged `cv11-owner` (set automatically the first time the admin logs in on it, or by hand at `/stop-tracking`). Only a fixed event name, a few words such as a template name, a random device id and the time are stored: never a name, email or CV content. Tracked events: `cv_started`, `cv_downloaded`, `letter_downloaded`, `letter_signed`, `text_pdf_downloaded`, `share_whatsapp`, `cv_backup_saved`, `certificates_made`, `cv_versions_downloaded` (plus `first_visit`, recorded by the analytics component).

---

## 17. Content pages and search visibility

- **Static by default.** All content pages are prerendered. Dynamic routes (`/cv-examples/[slug]`, `/blog/[slug]`, `/letters/[slug]`, `/interview-prep/[field]`) use `generateStaticParams`, so every page exists at build time.
- **Content is data.** 30 course example pages, 3 blog guides (how to write a CV, CV versus resume, the national service CV), 8 letter guides, 9 interview-prep fields. Adding one is a new entry in a data file; the index page, the article page, the sitemap and the metadata all pick it up.
- **Metadata:** every page sets a title and description; important pages set a canonical URL; personal pages (builder, versions, admin, pay return, auth) are `noindex`. `sitemap.ts` lists every public page, `robots.ts` controls crawling, `opengraph-image.tsx` generates the share picture at build time (so there is no image file to maintain), and the homepage carries `schema.org` JSON-LD for a web application.
- **Writing rules for guides:** plain language for students in Ghana, **no invented statistics**, only advice a student can act on.

### 15.10 Share one link (certificate events)

**Status: Built, needs `supabase/share.sql` run once in Supabase.** Files: `supabase/share.sql`, `src/lib/cert-share.ts`, `src/components/tools/share-panel.tsx`, `src/components/tools/claim-certificate.tsx`, `src/app/(marketing)/claim/page.tsx`.

A signed-in organiser (built-in designs only for now) taps "Make a link" under the download buttons. The design settings and the names are stored in `cert_events` / `cert_recipients`; the organiser shares ONE link (`/claim?e=<slug>`) and each person types their own name (plus an optional event code) to get only their own certificate, drawn in their own browser.

Rules: names are never sent to the public (the `cert_claim()` function returns one matched person or a status); an exact name wins, otherwise every typed word must start a word of the name and exactly one person must match; at most 40 lookups a minute per event; links expire after 30/90/365 days; the organiser can delete one at any time; 20 active events per organiser; the list shares the free batch limit (`siteConfig.certificates.freeBatch`, 15). Not yet built: self-registration, personal-link list, QR, uploaded-design events.

**Self-register mode (15.10b).** In the share box the organiser can choose "Let people add their own names". The link then shows a sign-up form (`cert_register()`: name, optional event code, duplicates ignored, capped at the free batch, 40 tries a minute). The organiser taps **Release** in "Your shared links" and the same link turns into the find-my-certificate page; until then `cert_claim()` answers `wait`. **Reopen** goes back to collecting names. Columns `mode`, `released`, `cap` were added to `cert_events` (re-run `supabase/share.sql`; it is safe to repeat).

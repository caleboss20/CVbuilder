# CV11: Developer Handbook

> For whoever works on this codebase next, human or AI. Read [`PROJECT-GUIDE.md`](PROJECT-GUIDE.md) first for the map and the principles, and [`FEATURES.md`](FEATURES.md) for how each feature behaves. This file is the practical manual: recipes for common changes, data shapes, exact API contracts, the security model, a troubleshooting log of real problems met while building this, testing guidance and an honest list of technical debt.

## Contents

1. [First hour: get oriented](#1-first-hour-get-oriented)
2. [Recipes: how to add things](#2-recipes-how-to-add-things)
3. [Data shape reference](#3-data-shape-reference)
4. [API reference](#4-api-reference)
5. [Security model](#5-security-model)
6. [Troubleshooting log: problems we already hit](#6-troubleshooting-log-problems-we-already-hit)
7. [Testing and quality assurance](#7-testing-and-quality-assurance)
8. [Performance notes](#8-performance-notes)
9. [Accessibility notes](#9-accessibility-notes)
10. [Dependencies and why each exists](#10-dependencies-and-why-each-exists)
11. [Technical debt and known rough edges](#11-technical-debt-and-known-rough-edges)
12. [Glossary](#12-glossary)

---

## 1. First hour: get oriented

1. **Read `AGENTS.md` and `node_modules/next/dist/docs/`** for the Next.js 16 rules. Do not trust memory of older Next versions.
2. `npm install`, copy `.env.example` to `.env.local`, `npm run dev`. The site works with no environment variables at all.
3. Open these in order to see the product: `/` (homepage), `/builder` (build a CV), `/builder/versions`, `/cv-checker`, `/certificates`, `/cover-letter`, `/sign-letter`.
4. Skim these files, which hold most of the product's logic: `src/lib/builder.ts` (the CV data), `src/lib/site.ts` (settings), `src/components/builder/builder.tsx` (the editor), `src/lib/cv-check.ts` (the checker), `src/lib/certificates.ts` (the certificate engine), `src/server/ai/handle.ts` and `src/server/pay/confirm.ts` (the two server flows), `supabase/payments.sql` (the rules that protect money).
5. Before any commit: `npx eslint src`, `npx tsc --noEmit`, `npx next build`.

**Mental model in three sentences.** Almost everything runs in the student's browser and is stored in `localStorage`. The server exists only for AI and payments, and it is walled off in `src/server` and `src/app/api`. The database (Supabase) owns every rule that must not be tampered with (the price, the limits, who is admin) through SQL functions, so neither the browser nor the server needs a privileged key.

---

## 2. Recipes: how to add things

### 2.1 Add a CV template (the common case: one more single-column or sidebar design)

1. **Add the id** to the `CvTemplateName` union in `src/lib/cv-examples.ts`.
2. **Write the config** at the bottom of `src/components/cv/cv-templates-ats.tsx`. Example (the whole of "Contact Right"):

   ```ts
   export const ContactRightCv = makeStack({
     accent: "#111827",
     header: "split",          // center | left | icons | photo | accent | split
     heading: "title",         // rule | thick | plain | bar | tint | divider | spaced | display | label | title
     entry: "italic-right",    // role-first | org-first | date-column | title-caps | stacked | italic-right
     skills: "groups",         // columns | groups | sections | inline
     titles: { summary: "Professional Summary", experience: "Professional Experience", education: "Education", skills: "Skills" },
   });
   ```
   For a two-column design use `makeSidebar({...})` (see `SideTimelineCv` and the other `Side*`/`Grid*` configs for the options).
3. **Wire it** into the `switch` in `src/components/cv/cv-templates.tsx` (one `case` returning `<ContactRightCv doc={doc} role={role} photo={photo} />`) and import it at the top.
4. **List it** in `src/lib/templates.ts`: `{ id, name, blurb, tags, exampleSlug }`. Tags: `ats` (one column, plain headings, no photo, safest for hiring software), `simple`, `photo`. Add the id to the `TWO_COLUMN` set if it has a side column. Optionally add it to `homepageTemplates()` or `template-advice.ts`.
5. Colours must come from `var(--cv-accent, <fallback>)` (the `A()` helper does this) so the colour picker, the PDF and Word keep working.
6. **Rule:** every section heading must be an `<h3>` that is a **direct child** of its section element, or `HideEmptySections` will not hide or reorder it.
7. Check: the gallery, the builder picker, a blank CV, a full CV, a photo and no photo, all four CV types (reordering), the print preview (one A4 page), and phone width.

A design that does not fit either engine (a unique layout) is a hand-written component like those in `cv-templates-more.tsx` and `cv-templates-single.tsx`.

### 2.2 Add a course example

1. Add an entry to `courseExamples` in `src/lib/cv-example-courses.ts`: `slug`, `course`, `icon`, `row`, `intro`, `tips`, `role`, `template`, and a full `cv` (`CvDoc`). Use the plain photo-free templates.
2. Add the slug to `groupBySlug` in `src/lib/course-groups.ts` (decides which chip it appears under on the start screen).
3. If the course name is not obvious, add a keyword row to `FIELD_KEYWORDS` in `src/lib/course-match.ts` (more specific fields first; the first match wins).
4. The example page `/cv-examples/<slug>`, the sitemap and the start screen pick it up automatically (`generateStaticParams`).
5. Content rule: realistic but invented people and employers; no real private data; no invented statistics in advice text.

### 2.3 Add a blog guide

Add an entry to `guides` in `src/lib/guides.ts` (`slug`, `title`, `summary`, `published` ISO date, `sections` of paragraphs and optional lists, `cta`). The index page, article page, sitemap and metadata follow. **Rule:** plain language for students in Ghana, no invented statistics, advice a student can act on.

### 2.4 Add a letter type

1. Add the kind to `LetterKind` and a `LetterKindConfig` to `letterKinds` in `src/lib/cover-letter.ts` (labels, placeholders, quick picks, subject line, recipient wording, any extra questions).
2. Write its drafting function in the same file and add a `case` in `draftLetter`.
3. Add a guide to `letterGuides` in `src/lib/letter-guides.ts` (its page `/letters/<slug>` and the sitemap follow).
4. Check both layouts (formal and cv), the print preview and the PDF.

### 2.5 Add an interview-prep field

Add a `FieldPrep` to `fieldPrep` in `src/lib/interview-prep.ts` with an `id` that matches a group id in `course-groups.ts`, a title, intro and questions (each with `q` and `tips`). The index, the page and the sitemap follow.

### 2.6 Add a certificate design

1. Add the id to `CertDesign` in `src/lib/certificate-design-types.ts`.
2. Add a `DesignDef` to `src/lib/certificate-designs-more.ts` (or `certificate-designs.ts`): `id`, `label`, `color` (default main colour), optional `orientation: "portrait"`, a `layout(main)` returning `layout({...})` overrides (positions are in PDF points **measured from the top-left**, text fonts and colours), a `draw({ page, main, bold })` for the background and an optional `foreground`.
3. Draw with the helpers in `certificate-draw.ts`: `fillPath` (SVG-like paths with `M`, `L`, `C`, `Z` only, absolute coordinates) with a colour or a gradient (`goldBetween`, `shadeBetween`), `polygon`, `roundedSquare`, `line`, `curve`, `frame`, `flowLines`, `laurel`, `seal`.
4. **Portrait designs** use the local `PW` and `PH` constants (`certificate-designs-more.ts`); the engine calls `setPageHeight` before drawing, so `Y()` and `fillPath` work for either orientation.
5. If the default logo spot (centred above the title) would collide with artwork, add an entry to `LOGO_SPOTS` in `certificates.ts`.
6. The gallery, the homepage count and the maker pick it up. Check the preview with a short name, a 50-character name, a Ghanaian-letter name (Ɛ, Ɔ), one and two signers, and a logo.

### 2.7 Add an AI feature

1. Create `src/server/ai/features/<name>.ts` (starts with `import "server-only"`): build the prompt from `CV_RULES` plus any feature rules, call `generateJson` with a response schema, **validate** the answer (at minimum `numbersComeFromInput`), return `null` when it breaks a rule.
2. Create `src/app/api/ai/<name>/route.ts` as a thin wrapper around `handleAiRequest(request, name, parse, run)` (parse returns the clean input or an error string).
3. Add the kind to `AiKind` and its text field to `TEXT_FIELD` in the browser side (`src/lib/ai-client.ts`, `src/components/builder/ai-assist.tsx`) and put an `<AiAssist kind=... />` under the right input.
4. **Rules:** never auto-apply; show a reason; update `/privacy` if the data sent changes; keep one credit per request.

### 2.8 Add a tracked event

1. Add the name to `TrackedEvent` in `src/lib/track.ts` (names are length-limited to 40 characters by the database).
2. Call `trackEvent("name", { small: "props" })` where it happens. **Never** put names, emails or CV text in the props.
3. To see it, add a query to `supabase/stats.sql` or extend `admin_stats()` in `supabase/schema.sql` (and `src/lib/admin-stats.ts` and the dashboard if it should be on screen).

### 2.9 Add a site-wide setting

Put it in `siteConfig` in `src/lib/site.ts` with a comment saying what it controls; if it must differ per deployment, read an environment variable there with a default. If it affects money or limits, the **real** value belongs in a database settings table (see `pay_settings`, `ai_settings`), with the site constant only for what the student reads.

### 2.10 Change what the "free" claims say

Anything about price or "free" must follow `siteConfig.download.enabled`. Search the repo for `download.enabled` to see every place that already does (hero, final call to action, FAQ, About, share image, Pricing, Terms, Privacy, account panel). Add new claims to that pattern.

### 2.11 Change the AI model or its limits

Model: set `GEMINI_MODEL` (the default is in `src/server/ai/config.ts`). **Check Google's current model list first**: names get retired (`gemini-2.5-flash` returned 404 for new accounts). Limits: edit the single row in the `ai_settings` table; no deploy needed. Access: `AI_ACCESS` (`admin` or `everyone`).

### 2.12 Change prices

The charged amount is `pay_settings.price_pesewas` (500 = GH₵ 5) and the window is `valid_days`. Update `siteConfig.download.price` and `days` so the words match. Existing paid rows keep what they paid.

---

## 3. Data shape reference

### 3.1 The CV the student edits (`BuilderCv`, `src/lib/builder.ts`)

```ts
{
  template: CvTemplateName;        // one of 38 ids
  accent: string | null;           // "#1d4ed8" or null for the template's own colour
  photo?: string;                  // data URL, optional
  name; role; location; phone; email: string;
  links: string[];
  summary: string;
  education:  { id; degree; school; date }[];
  experience: { id; title; place; date; bullets: string[] }[];
  projects:   { id; name; detail }[];
  skills:     { id; label; items: string }[];     // items are comma-separated
  languages; certifications; awards; interests: string[];
  references: { id; name; role; phone }[];
  cvType: "standard" | "graduate" | "skills" | "academic";
  research; publications; presentations: string[];  // academic: one line per item
  courseSlug?: string; courseName?: string;       // placeholders only, never written into the CV
  cvId?: string;                                  // random, for payments; made in an effect, never in blankCv
  timeSpent?: number; finishedAt?: number;
}
```

`toDoc(cv)` converts it to the `CvDoc` the templates draw: trims everything, drops empty entries, merges `label: items` into skill lines, and carries `type`. The templates never see `BuilderCv`.

### 3.2 A CV example (`CvExample`, `src/lib/cv-examples.ts`)

`{ slug, course, icon, row, intro, tips, cv: CvDoc, role, template, photo? }`. `CvDoc` has `name, contact[], summary, education[], experience[], skills[]` (lines like `"Software: Excel, Canva"`), plus optional `languages, certifications, projects, awards, interests, references, research, publications, presentations, type`.

### 3.3 A CV version (`src/lib/cv-versions.ts`)

`{ id, label, role, template, accent }`. `deriveCv(base, v)` returns `{ ...base, template: v.template, role: v.role.trim() || base.role, accent: v.accent ?? base.accent }`.

### 3.4 A CV checker report (`CvReport`, `src/lib/cv-check.ts`)

`{ score 0..100, band { label, tone }, checks: Check[], areas: { area, percent }[], matched[], missing[], notes[], stats { words, bullets, bulletsWithNumbers, sections[] } }`, with `Check = { id, area, label, points, max, status: "good"|"ok"|"fix", advice, examples? }`.

### 3.5 Certificates (`CertSettings`, `src/lib/certificates.ts`)

```ts
{
  design: CertDesign; color: "#rrggbb"; kind: CertKind;
  subtitle; intro; body: string;          // body has {event} {date} {issuer}
  event; date; issuer: string;
  signer1; signer2: { name; title };
  signature: string;                      // first signer's signature, PNG data URL or ""
  signature2: string;                     // second signer's signature
  logo: string;                           // PNG data URL or ""
  logoPlace?: { x; y; w };                // fractions of the page: centre x, centre y, width
}
```

### 3.6 A design (`DesignDef`, `src/lib/certificate-design-types.ts`)

`{ id, label, color, orientation?, layout(main) => Layout, draw({page, main, bold}), foreground? }`. `Layout` fields: `cx, w, title, subtitle, intro, name, nameLine, body, sig, slots(two), ink, grey, titleColor, subtitleColor, introColor, nameColor, lineColor, titleFont, titleSize`, and optional `titleSpacing, subtitleSize, subtitleSpacing, nameFont, nameCaps, noNameLine, logo`.

### 3.6b Application tracker entry (`Application`)

`{ id, company, role, status: "saved"|"applied"|"interview"|"offer"|"closed", applied: "YYYY-MM-DD", followUp: "YYYY-MM-DD", link, notes }`.

### 3.7 Database rows

See the table in `PROJECT-GUIDE.md` section 11 and the SQL files. `payments`: `reference` (primary key, `cv11_` plus 32 hex), `user_id`, `cv_id`, `amount_pesewas`, `status` (`pending` | `paid`), `created_at`, `paid_at`, `expires_at`.

### 3.8 Browser storage keys

`cv11-builder-v1` (CV), `cv11-versions-v1`, `cv11-letter-v1`, `cv11-signature-v1`, `cv11-applications-v1`, `cv11-nss-checklist-v1`, `cv11-theme`, `cv11-best-time`, `cv11-idle`, `cv11-ai-consent-v1`, `cv11-resume-v1`, `cv11-device`, `cv11-owner`, `cv11-admin-checked`, and `cv11-checker-handoff` in `sessionStorage`. The six data keys (CV, versions, letter, signature, tracker, checklist) are what a backup file and cloud save carry (`BACKUP_KEYS` in `backup.ts`): **add a new data key there** or it will be lost on restore.

---

## 4. API reference

All routes are `POST`, JSON in and out, authenticated with `Authorization: Bearer <Supabase access token>` (not cookies, so CSRF does not apply). Errors are `{ "error": "<message safe to show a student>" }`.

### 4.1 AI routes

| Route | Body | Success |
|---|---|---|
| `/api/ai/improve-bullet` | `{ text (<=600), role?, field? }` | `{ improved, why, remaining }` or `{ suggestion: null, remaining }` |
| `/api/ai/improve-project` | `{ name, detail (<=600), course?, field? }` | same |
| `/api/ai/improve-summary` | `{ draft? (<=600), course?, targetRole?, field?, skills?, highlights? }` (needs a draft, or a course plus skills or highlights) | same |
| `/api/ai/fix-transcript` | `{ transcript (<=2000), course?, role?, field? }` | `{ corrected, changes: [{ heard, meant }], remaining }` |

| Status | Meaning |
|---|---|
| 400 | Missing or invalid body (message says what) |
| 401 | No token, or expired ("Please log in again") |
| 403 | `AI_ACCESS=admin` and the caller is not an admin |
| 429 | Per-person daily limit reached, **or** Google's per-minute limit (message distinguishes) |
| 502 | The AI failed; the credit was refunded |
| 503 | AI not configured, **or** the site-wide daily limit reached, **or** the limits SQL is not installed |

### 4.2 Payment routes

| Route | Body | Success | Notes |
|---|---|---|---|
| `POST /api/pay/start` | `{ cvId }` | `{ url }` (Paystack checkout) | 503 if payments are not configured; 401 without a valid token; the database sets the price |
| `POST /api/pay/verify` | `{ reference }` | `{ paid: boolean }` | Asks Paystack; idempotent |
| `POST /api/pay/webhook` | Paystack's event | `ok` | No bearer token: authenticated by the `x-paystack-signature` HMAC-SHA512 of the raw body; 401 on a bad signature; only `charge.success` is acted on, and re-verified with Paystack |

### 4.3 Database functions (called through Supabase REST `rpc`)

`is_admin()`; `admin_stats(days)` (admin only); `ai_use_credit()` returns `{ allowed, reason?, remaining }` (`reason` is `user_limit` or `site_limit`); `ai_refund_credit()`; `payment_start(p_cv_id)` returns `{ reference, amount }`; `payment_confirm(p_reference, p_amount, p_secret)` returns boolean (raises if the secret is wrong); `cv_access(p_cv_id)` returns `{ paid, expires_at?, owner? }`.

---

## 5. Security model

### 5.1 What is protected

The student's CV and personal details; accounts; the integrity of payments; the Gemini and Paystack keys and the confirmation secret; the admin dashboard.

### 5.2 Controls

| Concern | Control |
|---|---|
| CV privacy | Stored in the browser only; uploads are read on the device; cloud save is an explicit button writing to the user's own row (row-level security) |
| Secrets in the browser | Server secrets are read only in files that start with `import "server-only"` (the build fails if a browser file imports them) and are never in `NEXT_PUBLIC_*` variables. The only keys in the browser are the public Supabase URL and anon key |
| Privileged database key | **None exists anywhere.** Even the server uses the anon key plus, where needed, the signed-in person's token; privileged actions are `security definer` SQL functions |
| Forged payments | The server verifies with Paystack (status, currency, reference); `payment_confirm` needs a secret only the server holds; `payments` has no write policy; the price is read from `pay_settings` in the database |
| Fake webhooks | HMAC-SHA512 of the raw body, constant-time compare; the event is then re-verified with Paystack anyway |
| Double payment or race | `payment_confirm` is idempotent; `payment_start` creates a unique reference per attempt |
| Quota abuse of the AI | Credits taken atomically in the database per person and per site; refunds on failure; fail closed if the limits are missing |
| Prompt injection | The student's text is wrapped in `<student_text>` tags with a rule to treat it as data; the output is validated; the worst outcome is a rewritten line **that only that student sees** and must accept by tapping |
| Admin access | `/admin` data comes from `admin_stats()`, which raises unless `is_admin()` is true for the caller's confirmed email; the page itself holds no secret |
| Analytics privacy | Fixed event names, a random device id, no personal data; owner and test traffic excluded |
| Cross-site scripting | React escapes all text; the only `dangerouslySetInnerHTML` is the homepage JSON-LD, with `<` escaped |
| Cross-site request forgery | The API uses bearer tokens, not cookies |
| Password and email | Handled by Supabase Auth (hashing, confirmation, reset links) |

### 5.3 Residual risks and gaps (be aware)

- **The download gate and the free certificate limit run in the browser** and can be bypassed by a determined person. Accepted for now (guide, decision D2).
- **No IP-level rate limiting** on `/api/pay/start` (it requires a valid login, and each call only creates a pending row). Add Vercel's firewall or a database-side attempt limit if abused.
- **`localStorage` is readable by any script on the origin.** The app ships no third-party scripts besides Vercel Analytics; keep it that way, and never store secrets there.
- **Supabase's default email sender** is rate-limited and not suitable for real volume; use custom SMTP.
- **Free-tier AI terms:** Google may use submitted text; consent is shown, but moving to a paid tier removes the issue.
- **Data protection law.** CV11 handles personal data of people in Ghana. Ghana's Data Protection Act (2012) may require the operator to register with the Data Protection Commission and to publish certain notices. **Get this confirmed by a Ghanaian lawyer before scaling**; the code's privacy-by-default design helps but is not legal advice.
- **No automated security scanning** is set up (dependency audit, secret scanning). Enable GitHub's Dependabot and secret scanning on the repository.

---

## 6. Troubleshooting log: problems we already hit

| Symptom | Cause | Fix |
|---|---|---|
| `tsc` or `next build` shows errors about routes or types that no longer exist | Stale generated types in `.next` after deleting or moving a route or a temporary page | Delete the `.next` folder, then rebuild |
| Console shows old compile errors that are not in the current code | Dev server hot-reload history, from mid-edit states | Reload the page; trust `eslint`, `tsc` and `next build` |
| Sign-up emails do not arrive, or "rate limit" errors | Supabase's built-in email sender allows only a few emails per hour | Set up custom SMTP in Supabase (for example a Gmail app password) and write friendlier templates |
| The AI answers 404 "model is no longer available to new users" | Google retired the model id | Set `GEMINI_MODEL` to a current model (check Google AI Studio's rate-limit page for the list) |
| The AI answers 429 after a few quick tests | The free tier's per-minute limit (varies by model: 5 per minute for the full Flash model, 15 for Flash-Lite) | Wait a minute; the app already shows a friendly message and refunds the credit |
| AI answers get cut off mid-sentence | Output token cap too small for models that think before answering | `maxOutputTokens` is 2,048 in `gemini.ts` |
| The AI adds duties or settings the student never said | Embellishment, worse in smaller models | The worked examples and the final "check every noun" instruction in `rules.ts`, plus validation; test with the messy bullets in `docs` before changing the model |
| A PDF font looks wrong or throws when embedded | Variable fonts (`Font[wght].ttf`) embed badly in PDFs | Use **static** TTF files (Poppins, Marcellus, Great Vibes, Playfair Display SC are static) |
| `pdf-lib` "WinAnsi cannot encode" for Ghanaian names | The standard fonts cover only Latin-1 | `certificates.ts` loads DejaVu only when needed; `sign-pdf.ts` switches to an embedded font when text needs it |
| `drawSvgPath` fills a stroke-only shape black | pdf-lib fills paths when only a border colour is given | Use `line` / `curve` helpers for strokes; `fillPath` for fills; gradients use custom PDF operators (see `certificate-draw.ts`) |
| A CV thumbnail in a grid renders at full size and cuts off | A grid column sized to its content (the unscaled 794 px page) so the scale never applies | `grid-cols-1` (which is `minmax(0, 1fr)`) and `min-w-0` on grid items |
| Print dialog shows the whole page, not just the CV | The print stylesheet hides `body > *:not(#cv-print)`; `PrintCopy` must render as a direct sibling of the page content, not nested in a wrapper | Keep `<PrintCopy />` at the top level of the page component |
| Print shows a blank page | The print copy used `display: none` so it could not be measured | It sits off-screen (`left: -10000px`) and is made visible only in `@media print` |
| The browser names the PDF "CV Versions \| CV11.pdf" | The file name comes from `document.title` at print time | Set the title just before `window.print()` and restore it after |
| "Hydration" or "prerender" errors mentioning random values or dates | `Math.random()`, `new Date()` or browser APIs ran during prerender | Create ids and dates inside `useEffect`; `blankCv()` uses fixed ids |
| The admin dashboard "logs me out" | A second `getSession` lookup raced; the token was not passed through | `fetchAdminStats` receives the access token from `useUser` and sends it directly |
| `git add` aborts on a path | Unquoted parentheses in a path like `src/app/(marketing)/...` | Quote the path |
| `LF will be replaced by CRLF` warnings on Windows | Git line-ending normalisation | Harmless |
| Pushes to GitHub intermittently fail with "Could not resolve host" | Network | Retry; verify with `git fetch` and `git status -sb` |
| A shell one-liner that edits a file with backticks, quotes or apostrophes fails | The shell tries to interpret them | Write the edit script to a file and run it, or use an editor tool, instead of a quoted one-liner |
| New Vercel environment variable seems ignored | Values apply to **new** builds | Redeploy after changing environment variables |
| Dev server shows "Page not found" for a page just created | The route compiles on first visit | Wait a few seconds and reload |
| Tests of Supabase-dependent features fail locally | Missing environment variables | The site degrades gracefully; add the variables in `.env.local` to test them |

---

## 7. Testing and quality assurance

**Today there are no automated tests.** Quality is held by: ESLint, the strict TypeScript compiler, production builds, manual testing in the browser at phone width, and `docs/phone-test-checklist.md` for things only a real phone can show. This is the biggest gap for a team handover.

### 7.1 Where to add tests first (pure functions, no mocking needed)

A test runner such as Vitest fits (TypeScript, fast). Start with these, with the expected behaviours below taken from the code:

| Module | Cases worth locking in |
|---|---|
| `certificate-names.ts` `parseNames` | `"1. KOFI ɛNYONAM\n2) kɔjo ɔpoku\n- Nana Yaa Asantewaa\n3. kofi ɛnyonam\nAma Serwaa"` gives 4 names, 2 recased, 1 duplicate; names in one line split on commas; first Excel column used; empty and symbol-only lines dropped; more than 500 names flagged `overLimit` |
| `cv-check.ts` `analyseCv` | A CV with an email, phone, 40-word summary, experience bullets starting with verbs and containing numbers scores high; the same without numbers loses the 10-point `numbers` check; no advert drops `keywords` and rescales; academic CVs add `research` |
| `bullet-coach.ts` | The priority order of tips (short, filler, verb, number, long, good); `startWith("Led", "Responsible for the till")` gives "Led the till" |
| `cv-import.ts` `importCv` | A text CV with "Work Experience", dated headers and bullets produces jobs with title, place, date, bullets; a two-line role then "Organisation, Town  dates" gives one job; unplaceable lines land in `leftover` |
| `cv-type.ts` `recommendCvType` | postgrad gives academic; skills gives skills-based; no experience gives graduate; otherwise standard |
| `course-match.ts` | "Geography" gives Environmental Science; unknown text falls back to Business Administration; relabelling sets role and degree |
| `job-match.ts` | `extractKeywords` drops covered shorter skills; caps at 20; `matchCv` percentages |
| `validate.ts` and `fix-transcript.ts` | `numbersComeFromInput`; a proposed change whose `heard` is not in the text is rejected; whole-word replacement |
| `cv-versions.ts` | `mixedVersions` gives distinct templates; `templatePool` excludes photo templates without a photo; `versionFileName` is safe and unique |
| `certificates.ts` `fillBody` | Placeholders and tidy-up of ", ," and double spaces |
| `payments` flow | Webhook signature accepts good, rejects tampered, missing and short signatures (a script for this exists in the history: HMAC-SHA512 with `timingSafeEqual`) |

### 7.2 End-to-end checks worth automating later (Playwright)

Build a CV and download; versions download sequence (stub `window.print`); certificates ZIP contains N PDFs; the 15-names case shows the notice and makes 10; logo drag changes position; sign-up then payment in Paystack test mode; AI routes return 401 without a token and 503 without a key.

### 7.3 Manual regression checklist

`docs/phone-test-checklist.md` (updated for certificates, versions and payments). Always check **light and dark mode**, **phone width (390 px)** and **no sideways scroll**.

### 7.4 CI

Add a GitHub Action that runs `npm ci`, `npx eslint src`, `npx tsc --noEmit` and `npx next build` on every push, so a broken build is caught before Vercel deploys it.

---

## 8. Performance notes

- **Static first.** Marketing, examples, guides, letters and interview pages are prerendered; dynamic routes use `generateStaticParams`. Personal pages (builder, versions) are client-rendered.
- **Load on demand.** The Supabase client (over 200 KB) loads only when a login exists or an account page is opened. PDF readers and writers, the Word exporter and `fflate` load inside the click handlers that need them. `LazyMount` and `CvPageFrame lazy` defer off-screen CV renders.
- **Images** go through `next/image`. Certificate fonts are fetched once and reused; each PDF embeds only the glyphs it uses.
- **A loading bar** (`nav-progress.tsx`) starts the instant a link is tapped, so slow phones feel responsive.
- **Known cost:** the certificate gallery draws 23 small PDFs and renders them with pdf.js when the page opens (a few seconds of CPU on a slow phone). A future improvement is to pre-render the thumbnails once and ship them as images, as the homepage section already does for six designs.
- **Certificates:** about 0.25 seconds per separate PDF, so 500 names is about two minutes; the combined PDF is much faster.

---

## 9. Accessibility notes

What exists: labelled form controls (visually hidden labels where a placeholder stands in), `aria-live` regions for coaching and AI and payment status, `aria-pressed` on toggles, `role="dialog"` and `aria-modal` on pop-ups, FAQ and interview cards built on `<details>` (work without JavaScript), the draggable logo is keyboard-operable (arrow keys, Shift for bigger steps) with an accessible name, reduced-motion handling for decorative animation, and the colour tokens support light and dark.

What does not exist yet: a formal accessibility audit; focus trapping inside the custom dialogs; screen-reader testing of the drag interactions (signature pad, logo); a skip-to-content link on every page. Treat these as backlog.

---

## 10. Dependencies and why each exists

| Package | Why |
|---|---|
| `next`, `react`, `react-dom` | Framework |
| `tailwindcss`, `@tailwindcss/turbopack` | Styling and its build integration |
| `@supabase/supabase-js` | Auth, REST and RPC calls to Supabase (loaded lazily in the browser) |
| `@vercel/analytics` | Anonymous page statistics |
| `pdf-lib`, `@pdf-lib/fontkit` | Write PDFs (signing, Text to PDF, certificates) and embed TrueType fonts |
| `pdfjs-dist` | Read and render PDFs (preview, CV import, signing) |
| `docx` | Write the Word CV |
| `mammoth` | Read Word files for CV and letter import |
| `fflate` | Make ZIP files of certificates, small and fast |
| `geist` | The site's UI font |
| `server-only` | Makes the build fail if browser code imports server-only files |
| `eslint`, `eslint-config-next`, `typescript`, `@types/*` | Quality tools |

To add a dependency: prefer small, well-maintained libraries; load heavy ones inside event handlers; check the licence (fonts and libraries must allow commercial use); note it here.

---

## 11. Technical debt and known rough edges

Honest list, roughly in order of value to fix.

1. **No automated tests or CI** (section 7).
2. **Marketing copy vs reality on AI.** Several lines promise AI that only the owner can use; the homepage AI demo is scripted. Either open the AI or reword (`site.ts`, `faqs.ts`, `hero.tsx`, `how-it-works.tsx`, `problems.tsx`, `final-cta.tsx`).
3. **Big files.** `cv-templates-ats.tsx` (about 1,300 lines), `cv-templates-more.tsx` (about 1,000), `builder.tsx` (about 860), `cv-example-courses.ts` and `cv-examples.ts` (data). Templates are the natural place to split; the config engines already limit duplication.
4. **The certificate gallery renders 23 PDFs on load** (section 8).
5. **Free limits and the paywall are browser-side** (section 5.3). Real enforcement needs server records; the QR-verification feature is the natural vehicle.
6. **Random ids.** `uid()` uses `Math.random` (fine for ids, not for secrets); `cvId` uses `crypto.randomUUID` where available.
7. **Two code paths for PDFs.** CV and letters print through the browser; Text to PDF and certificates draw with pdf-lib. Intentional (decision D2 and D13), but they share little code.
8. **Duplicate small helpers** (`clean`, `wordCount`, `titleCase`-like functions) exist in several lib files; some are exported from `cv-check.ts` and reused, others are local.
9. **`AuthShell`** is still used only by `/account`; the sign-in pages use `AuthScreen`.
10. **Docs drift.** `docs/phone-test-checklist.md` once said the Pro plan existed; keep docs updated in the same commit as the change.
11. **The pricing text for certificate tiers** is a proposal only; nothing in code charges for certificates yet.
12. **An empty `callycv/` folder** sits at the repository root and can be deleted.
13. **Backup and cloud save carry six data keys**; any new data key must be added to `BACKUP_KEYS` (`backup.ts`).

---

## 12. Glossary

| Term | Meaning |
|---|---|
| **ATS** | Applicant Tracking System: software employers use to read and filter CVs. "ATS-safe" here means one column, plain headings and real text |
| **NSS** | National Service Scheme: Ghana's mandatory national service for graduates |
| **WASSCE / SHS** | West African Senior School Certificate Examination / Senior High School |
| **GH₵ / pesewas** | Ghana cedis; 100 pesewas = 1 cedi. Paystack amounts are in pesewas |
| **MoMo** | Mobile money (MTN, Telecel, AirtelTigo) |
| **Paystack** | The payment provider (cards and mobile money in Ghana) |
| **RLS** | Row-level security: Postgres rules deciding which rows a person may read or change |
| **`security definer`** | A Postgres function that runs with its owner's rights, so it can do one privileged thing safely behind its own checks |
| **Anon key** | Supabase's public key, safe in the browser; it only does what RLS allows |
| **Service-role key** | Supabase's all-powerful key. **Never used in this project** |
| **Credit (AI)** | One AI request counted against a person's and the site's daily limit |
| **`cvId`** | The random id of a CV, used to tie a payment to it |
| **Print copy** | The off-screen full-size version of a CV that only the printer sees |
| **Version** | A template, colour and role line laid over the saved CV |
| **Free batch** | The most certificates a free user may make at once (10 by default) |
| **Stack / sidebar engine** | The two config-driven CV layout generators in `cv-templates-ats.tsx` |
| **Fail closed** | If a safety check cannot run, refuse the action rather than allow it |

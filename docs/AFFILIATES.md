# CV11 Affiliate Program: the complete handbook

> **Who this is for.** The owner, or any developer who inherits the project, if the people who built it are no longer around.
> Everything about the affiliate program is here: what it does, every decision, every file, every database function, the
> exact steps to run and test it, how to change each setting, the problems we already hit, and what is still missing.
> Read sections 1 to 3 for the picture, section 9 for what to do next, section 11 when something breaks.
>
> Written October 2026. The program is built and pushed to `main`. **It has not yet been tested end to end with real
> accounts and a real (test-mode) payment.** That test is the first job (section 9).

---

## 1. What it is

An **invite-only affiliate program** for CV11 (a free-to-start CV builder for students in Ghana). An affiliate is a person who
helps others finish a CV, such as a cyber café owner, a course rep, a teacher, an NSS coordinator or a bootcamp organiser.
They get a personal **code** and **link**. When someone they helped pays to download a CV with that code, the affiliate
earns a **share of that payment**. They are paid by hand by mobile money (MoMo).

It looks and feels like its own small site inside CV11 (own navbar, footer, colours, sign-in screens and an app-style
dashboard), but it uses the same website, the same Supabase project and the same user accounts.

Live at `https://cv11-one.vercel.app/affiliates`. It is **not listed by search engines** (`noindex`) while it is invite-only.

## 2. Decisions that were made (and why)

| Decision | Value | Where it lives | Why |
|---|---|---|---|
| Reward | **25% of each paid CV** (GH₵ 1.75 of GH₵ 7) | `siteConfig.affiliates.commission` / `commissionPercent` **and** `pay_settings.partner_commission_percent` | A percentage, not a flat amount, so it follows the price. It started at 6% and was raised to 25% by the owner. **Both places must match.** |
| CV price | GH₵ 7 (`price_pesewas = 700`) | `pay_settings`, `siteConfig.download.price` | Cheaper than the main competitor (GH₵ 9). |
| Reward counts only on a **successful** payment | Paystack-confirmed, status `paid` | `payment_confirm()` | Entering a code or opening a link earns nothing by itself. Failed, abandoned and refunded payments earn nothing. |
| Hold period | **14 days** before a reward is "owed" | `siteConfig.affiliates.holdDays` and `pay_settings.partner_hold_days` | Time to catch refunds and card chargebacks before paying. |
| Payouts | By hand, MoMo, on **the 1st of every month**, minimum **GH₵ 10** | `siteConfig.affiliates.payoutDay`, `minPayout` (wording only) | The owner sends the money and records it (see 5.3). The day and the minimum are **promises in the text**, the code does not enforce them. |
| Founding spots | **10** | `siteConfig.affiliates.spots` | Private beta. |
| Link credit | **30 days** on that device, newest link wins | `siteConfig.affiliates.linkDays`, `src/lib/payments.ts` | Standard affiliate "cookie" behaviour, kept in the browser's local storage rather than a tracking cookie. |
| Limits | **30** rewarded payments per code per 24 hours; **3** rewarded payments per paying account per code | `pay_settings.partner_daily_cap`, `partner_buyer_cap` | Stops farming. Over the limit the customer still gets their CV but the affiliate earns nothing and the payment is flagged. |
| One account for both | An affiliate uses a normal CV11 account | `affiliates.user_id` | Simpler, and an affiliate can also build a CV. |
| Visitor words | "Affiliate" everywhere, never "partner" | text only | Inside the database the old word **partner** remains (`partner_code`, `partner_commission_percent`, `cv11-partner`, `payment_start(…, p_partner)`). Those names are internal, leave them. |
| Design | CV11's own font (Geist), blue-violet `#5b5fe0` / deep violet `#16145f` / `#0c0b33`, **pill-shaped buttons**, no bordered boxes on the marketing page | components | Owner's repeated instructions. |
| Security stance | Only the public **anon** key is used. No service-role key and no database password anywhere in the repo. | whole app | Everything is protected by row-level security and `security definer` functions that check who is calling. |

## 3. The journey

### 3.1 An affiliate

1. Opens `/affiliates` (landing page) and presses **Become an affiliate**.
2. If not logged in they are sent straight to **`/affiliates/signup`** (dark, full-screen, no navbar or footer). Email + password only (no Google/authenticator for now). If email confirmation is on in Supabase they tap the link in the email.
3. They land on **`/affiliates/join`**: full name (as on their MoMo), phone, optional note, a tick to accept the terms, **Send my application**. Status becomes `pending`.
4. They see `/affiliates/dashboard` saying the application is with us.
5. The owner **approves** it (5.2). The affiliate must be told by the owner, **there is no email yet**.
6. The dashboard now shows their **code** and **link** (`https://…/?p=CODE`), a ready-made WhatsApp message, the figures, a 30-day chart, recent referrals and payout history.
7. Someone opens the link (the code is remembered 30 days) or types the code in the **Affiliate code** box on the download pay screen. They pay GH₵ 7 through Paystack.
8. When Paystack confirms, the affiliate's reward is **earned**. 14 days later it is **owed**. On the 1st the owner sends it by MoMo and records it. It appears in the affiliate's **Payout history** with a **receipt**.

### 3.2 The owner (admin dashboard, Affiliates panel)

Buttons: **Approve** (asks for a code, suggests one), **Pause / Resume**, **Record payout**, **Refund a payment**, plus lists of **Profile changes** (confirm or reject) and **Flagged payments**. Details in section 5.

## 4. Pages, routes and files

### 4.1 Routes

| Route | What | Layout |
|---|---|---|
| `/affiliates` | Landing page: hero → "Why join" → founding affiliates → "Who can become an affiliate" → celebration band → FAQ | marketing chrome (promo bar, sticky navbar, footer) |
| `/affiliates/join` | Application form (guests are redirected to sign-up; applied/approved people to the dashboard) | marketing chrome |
| `/affiliates/terms` | The affiliate terms (14 sections) | marketing chrome |
| `/affiliates/signup`, `/affiliates/login`, `/affiliates/reset-password` | Dark full-screen auth screens, no navbar/footer | route group `(affiliate-auth)` |
| `/affiliates/dashboard` | App-style dashboard: Dashboard, Share & code, Payouts, Profile, Help | route group `(affiliate-auth)` |
| `/receipt?ref=<payment reference>` or `/receipt?payout=<id>` | Printable receipt (student payment or affiliate payout). Only the owner of the row can open it (row-level security). | root layout only |
| `/partners`, `/partners/*` | Redirect to `/affiliates` (`next.config.ts`) | - |

Route groups matter: `(affiliates)` adds the navbar and footer; `(affiliate-auth)` is a plain pass-through (adds only `noindex`) so its pages draw everything themselves. **Do not put the same path in two groups** (see 11).

### 4.2 Files

```
src/app/(affiliates)/layout.tsx                      navbar + footer wrapper, noindex
src/app/(affiliates)/affiliates/page.tsx             landing page (assembles the sections)
src/app/(affiliates)/affiliates/{join,terms}/page.tsx
src/app/(affiliate-auth)/layout.tsx                  pass-through, noindex
src/app/(affiliate-auth)/affiliates/{signup,login,reset-password,dashboard}/page.tsx
src/app/receipt/page.tsx                             receipt page (noindex)

src/components/affiliates/
  affiliates-chrome.tsx      logo, header (promo bar + nav), footer (Rakuten-style, WhatsApp icon)
  affiliates-nav.tsx         sticky navbar that turns white when scrolled
  promo-bar.tsx              dismissible announcement bar
  affiliates-hero.tsx        hero (photo, headline)
  why-join.tsx               "how it works" steps
  founding-affiliates.tsx    founding section
  who-can-join.tsx           five audiences with photos
  celebrate-cta.tsx          round photo band; two photos cross-fade (CSS), seeded confetti
  affiliate-faq.tsx          15-question FAQ (reads numbers from siteConfig)
  affiliate-auth-screen.tsx  shell for the dark sign-in screens
  affiliate-panel.tsx        join/apply form (also the old panel UI)
  dashboard/affiliate-dashboard.tsx   the whole dashboard (client component)
src/components/auth/auth-form.tsx    shared form; `affiliate` prop = dark/pill look, plus loginHref/signupHref/confirmTo/resetTo
src/components/auth/password-input.tsx, reset-password-form.tsx   also take `affiliate`
src/components/receipts/receipt.tsx  printable receipt
src/components/admin/overview-panels.tsx   admin Affiliates panel (buttons, lists)
src/components/builder/use-download-gate.tsx   the "Affiliate code" box on the pay screen
src/lib/payments.ts                  rememberPartner / savedPartner (30-day credit), startCheckout
src/lib/site.ts                      siteConfig.affiliates (all the numbers)
src/lib/admin-stats.ts               AdminAffiliate type and the admin list fetch
src/app/api/pay/{start,verify,webhook}/route.ts, src/server/pay/*   Paystack
public/images/affiliates/*           photos (hero-woman.jpg, founding-cheers.webp, who-*.jpg, celebrate.webp, celebrate-alt.webp)
```

Dashboard sections are plain client state (`section`), not separate routes. `AffiliateDashboardView` draws the screen from data it is given (so it can be shown with sample figures); `AffiliateDashboard` loads the data and handles log-in/out.

## 5. The database

### 5.1 SQL files, and the order to run them

Run in **Supabase > SQL Editor > New query > paste > Run**. Every file is safe to run again.

Already part of the base set-up: `schema.sql`, `stats.sql`, `ai.sql` (only if AI is on), `payments.sql`, `share.sql`, `admin-more.sql`, `owner-devices.sql`.

Affiliate files, in this order:

| # | File | Gives you |
|---|---|---|
| 1 | `affiliates.sql` | Tables `affiliates`, `affiliate_payouts`; `payments.partner_code`, `commission_pesewas`; `affiliate_apply`, `affiliate_me`, `admin_affiliates`, `payment_start(p_cv_id, p_partner)`; settings in `pay_settings` |
| 2 | `affiliates-percent.sql` | Percentage rewards (`partner_commission_percent`) |
| 3 | `affiliate-activity.sql` | `affiliate_activity()`: recent referrals, payouts and 30-day earnings for the dashboard |
| 4 | `admin-affiliate-actions.sql` | `admin_affiliates` (now with `id`), `admin_affiliate_set` (approve/pause), `admin_affiliate_payout` |
| 5 | `refunds-and-limits.sql` | `refunded` status, `admin_payment_refund`, the two caps, new `payment_start`, trigger that keeps a refunded payment refunded |
| 6 | `admin-flagged.sql` | `admin_flagged_payments()` |
| 7 | `affiliate-profile.sql` | `pending_name`/`pending_phone`, `affiliate_update_profile`, `admin_affiliate_changes`, `admin_affiliate_decide` |

**`affiliate-update-all.sql` is files 2 to 7 in one file plus `update pay_settings set partner_commission_percent = 25`.** Running that one file after `affiliates.sql` is the quickest way to bring a database up to date.

Commission command on its own: `update public.pay_settings set partner_commission_percent = 25;`

### 5.2 What the pieces do

Tables
- `affiliates`: `id`, `user_id` (unique, the account), `name`, `phone`, `note`, `code` (unique, A-Z0-9, 3 to 12), `status` (`pending` / `approved` / `paused`), `pending_name`, `pending_phone`, `created_at`. An affiliate can **read only their own row**; only the admin can update it.
- `affiliate_payouts`: `affiliate_id`, `amount_pesewas`, `paid_at`, `note`. An affiliate can read only their own; only the admin writes.
- `payments` (extra columns): `partner_code`, `commission_pesewas` (the reward, decided when the payment starts), `partner_flag` (`daily cap` / `buyer cap`), `refunded_at`; status is now `pending` / `paid` / `refunded`.
- `pay_settings` (one row): `price_pesewas`, `valid_days`, `partner_commission_percent`, `partner_hold_days`, `partners_open` (set `false` to stop new applications), `partner_daily_cap`, `partner_buyer_cap`, plus the private `confirm_secret`.

Functions (all called through Supabase REST `rpc`; all `security definer`; each checks who is calling)
- `affiliate_apply(p_name, p_phone, p_note)`: signed-in user applies (fails with "closed" if `partners_open` is false).
- `affiliate_me()`: status, name, code, customers, earned, owed, waiting, paid_out, hold_days.
- `affiliate_activity()`: referrals (date, amount, reward, owed or waiting), payouts, and earnings for each of the last 30 days. No customer details are ever returned.
- `affiliate_update_profile(p_name, p_phone)`: before approval it saves directly; after approval it only stores a **request** (`pending_*`) for the owner to confirm. Returns `saved` or `requested`.
- `payment_start(p_cv_id, p_partner)`: creates the pending payment, takes the price from `pay_settings`, validates the code (must be approved, not the caller's own), applies the caps, works out the reward. The browser never sends an amount.
- `payment_confirm(...)`: called only by our server after asking Paystack (needs `confirm_secret`). Idempotent.
- Admin only (`is_admin()`): `admin_affiliates`, `admin_affiliate_set(p_id, p_status, p_code)`, `admin_affiliate_payout(p_id, p_amount_pesewas, p_note)`, `admin_payment_refund(p_reference)`, `admin_flagged_payments()`, `admin_affiliate_changes()`, `admin_affiliate_decide(p_id, p_accept)`.

How "earned / owed / waiting" are worked out: earned = sum of `commission_pesewas` on `paid` payments with the affiliate's code; **owed** = rewards older than `partner_hold_days` minus everything already paid out (never below 0); **waiting** = earned minus matured.

### 5.3 The money flow, step by step

1. **Pay screen:** the student (signed in) may type a code, or one is remembered from a link (`cv11-partner` in local storage, valid 30 days).
2. **`/api/pay/start`:** calls `payment_start`. A `pending` payment row is created with `commission_pesewas` already set (0 if no code, or if a cap was hit; then `partner_flag` is set and `partner_code` is left empty).
3. Paystack checkout (GHS). The student returns to `/pay/return`; Paystack also calls `/api/pay/webhook`.
4. **`confirmPayment`** (`src/server/pay/confirm.ts`) asks Paystack itself: status `success`, currency `GHS`, reference matches. Then `payment_confirm` marks it `paid` and opens downloads for `valid_days` (30). Safe to run twice (redirect and webhook both call it). The webhook signature is verified.
5. The reward is now **earned**. After 14 days it is **owed**.
6. **Payout (manual):** on the 1st the owner sends owed money by MoMo, then presses **Record payout** in the admin panel. The affiliate sees it under Payouts with a **Receipt**.
7. **Refund:** refund on Paystack, then press **Refund a payment** and paste the reference (it starts with `cv11_`). The payment becomes `refunded`: the reward disappears from earned/owed, the student's download access from that payment ends, and it stops counting as revenue. A trigger makes sure it can never become `paid` again, even if Paystack re-sends the confirmation. If the reward was already paid out the owner deals with it by hand (the terms allow taking it off a later payout).
8. **Receipts:** `/receipt?ref=…` for a student's payment (also listed under "Your payments" on their Account page), `/receipt?payout=…` for a payout.

## 6. Security and fraud

What is safe by design
- The reward **amount** is computed in the database. The browser cannot send or change it.
- The code is **validated on the server** at payment start (approved affiliates only; the code is cleaned to letters and digits; your own code on your own payment is refused).
- Editing the saved code in the browser can only switch to **another real code**.
- An affiliate cannot edit their own code, status, earnings or payouts (row-level security; only `is_admin()` can).
- Payments are marked `paid` only after our server asks Paystack, and a refunded payment cannot return to paid.
- Name/phone changes after approval wait for the owner (stops someone who takes over an account from redirecting money). **Call the old number before confirming.**
- Receipts and payout lists are readable only by their owner.
- No service-role key, no database password, no Paystack secret in the repository (Paystack secret and `PAYMENT_CONFIRM_SECRET` live only in Vercel / `.env.local`).

Why fraud is weak: a reward is a **share of a real payment**, so paying with your own second account loses money (pay GH₵ 7, earn GH₵ 1.75). It only works with stolen cards, and the 14-day hold plus manual monthly payouts give time to catch chargebacks.

Limits: 30 rewards per code per day, 3 per buyer per code. Over the limit the customer still gets the CV; the payment is flagged (`partner_flag`) and shown in the admin **Flagged payments** list.

Known weaknesses
- Credit is **per device/browser** (local storage, not a cookie and not a server-side fingerprint). Clicking on a phone and paying on a laptop is not credited unless the code is typed.
- No captcha on sign-up/apply (Supabase's rate limits only).
- No automatic detection of an affiliate misleading people (terms forbid it; the owner can pause a code).
- Payout day and minimum are not enforced by code.
- No email to the affiliate on approval or payout.

## 7. How to change things

| I want to… | Do this |
|---|---|
| Change the commission | Edit `commission` and `commissionPercent` in `src/lib/site.ts` **and** run `update public.pay_settings set partner_commission_percent = <n>;`. Keep them equal. The FAQ, terms, hero and dashboard read from `siteConfig`. Old payments keep the reward they were made with. |
| Change the hold days | `holdDays` in `site.ts` **and** `update public.pay_settings set partner_hold_days = <n>;` |
| Change the caps | `update public.pay_settings set partner_daily_cap = <n>, partner_buyer_cap = <m>;` |
| Change how long a link credits | `linkDays` in `site.ts` (browser side only) |
| Change payout day, minimum, founding spots | `payoutDay`, `minPayout`, `spots` in `site.ts` (wording only) |
| Stop new applications | `update public.pay_settings set partners_open = false;` |
| Change the CV price | `update public.pay_settings set price_pesewas = <pesewas>;` and `siteConfig.download.price/priceCedis` |
| Edit the FAQ | the `FAQS` array in `src/components/affiliates/affiliate-faq.tsx` |
| Edit the terms | the `SECTIONS` array in `src/app/(affiliates)/affiliates/terms/page.tsx` (update "Last updated") |
| Swap a photo | replace the file in `public/images/affiliates/` (keep the name), or change the path and `position` in the component |
| Open the program to everyone | remove the `robots` noindex line in `(affiliates)/layout.tsx` and `(affiliate-auth)/layout.tsx`, change the wording "invite-only", add the link to the main site |
| Add a social icon to the footer | edit `AffiliatesFooter` in `affiliates-chrome.tsx` (only WhatsApp exists now) |

## 8. Look and feel notes (so changes stay consistent)

- Landing page is **white sections** with violet accents; the celebration band, footer and sign-in screens are deep violet (`#16145f` / `#0c0b33`); the main action colour is `#5b5fe0` (hover `#4a4ed0`).
- **All buttons are pills** (`rounded-full`). Inputs on the affiliate screens are pills too.
- Logo: `LogoMark` + `Wordmark` from `src/components/ui/logo.tsx`; the wordmark and the word "Affiliates" are nudged down 2px (`translate-y-[2px]`) so they sit level with the mark.
- The celebration band cross-fades two photos with CSS keyframes (10 seconds, no dots, still image for people who prefer reduced motion). Confetti is positioned from a fixed seed so server and browser draw the same pieces (avoids hydration errors).
- Reference sites used for structure: Noon, FreshBooks, Semrush, Rakuten (landing, FAQ, footer), Impact (sign-in), two dashboard designs (dashboard layout).

## 9. What to do next (owner checklist)

1. **Run the SQL.** In Supabase run `affiliate-update-all.sql` (after the base files). If anything errors, read the message: a missing function or column means an earlier file is missing.
2. **Supabase > Authentication > URL Configuration:** make sure the Site URL is `https://cv11-one.vercel.app` and that these are all in the Redirect URLs list: `https://cv11-one.vercel.app/account`, `https://cv11-one.vercel.app/reset-password`, `https://cv11-one.vercel.app/affiliates/reset-password` (affiliate password reset) and `https://cv11-one.vercel.app/affiliates/dashboard` (where the affiliate sign-up confirmation email returns). A missing address means the email link lands on the Site URL instead.
3. **Vercel environment:** `NEXT_PUBLIC_PAYMENTS_ENABLED=true`, Paystack secret key, `PAYMENT_CONFIRM_SECRET` (same value as `pay_settings.confirm_secret`), webhook URL in Paystack set to `https://…/api/pay/webhook`. Set `NEXT_PUBLIC_FREE_CERTIFICATES` to 15 or remove it.
4. **Live test with three accounts** (yours as admin, an affiliate, a customer; Paystack **test** mode):
   - Affiliate signs up at `/affiliates/signup` and applies.
   - Admin presses **Approve**.
   - Customer (another account or a private window) opens the affiliate link, builds a CV, pays GH₵ 7 with the code.
   - Check: the affiliate dashboard shows 1 customer and GH₵ 1.75 (waiting), the chart/referral list update, both receipts open.
   - Press **Record payout**, check it in the affiliate's payout history with a receipt.
   - Press **Refund a payment** with the reference, check the reward disappears.
   - Try the cap: not needed in test, but you can lower `partner_buyer_cap` to 1 and pay twice to see a payment flagged.
   - Try **Forgot password** on the affiliate login.
   - Edit the profile phone after approval and confirm it under **Profile changes**.
5. **Have a Ghanaian lawyer read the terms** before real money moves. They were written in plain English by the developer, not by a lawyer.
6. **Paystack live keys** only after Paystack verifies the business.
7. Tell each approved affiliate yourself (WhatsApp) until emails exist.

## 10. Roadmap, in order of value

1. The live test above (nothing here has been proven with real data).
2. **Email** on approval and on payout (needs a sender such as Resend; the owner chooses).
3. **Paystack refund webhook** so refunds are marked automatically (needs a live test first).
4. Captcha on sign-up; server-side device fingerprint for fraud.
5. Social links in the footer (need the handles), real affiliate photos in place of stock, a success story section, levels (Silver/Gold) if wanted.
6. Pay-screen analytics (reached the pay screen / paid) on the admin dashboard.
7. Automatic payout list for the 1st (a "who is owed ≥ GH₵ 10" export).

## 11. Problems we already hit (and the fixes)

| Symptom | Cause | Fix |
|---|---|---|
| Hero/middle photos not showing after the partner→affiliate rename | A global search-and-replace changed `/images/partners/…` in code, but the files were still in `public/images/partners` | Move files to `public/images/affiliates/` (done). After any global rename, check image paths. |
| `git mv` of a folder says "Permission denied" | The dev server locks the folder on Windows | Stop the dev server, rename, start it again. |
| Bogus TypeScript errors about `.next/types/validator.ts` | Stale generated types after moving/deleting routes | Delete the `.next` folder; it regenerates. |
| "You cannot have two parallel pages that resolve to the same path" | The same URL exists in two route groups (it happened while moving the dashboard) | Keep one copy; restart the dev server and clear `.next`. |
| Page keeps showing the old design after moving a route | Turbopack cache | Stop the server, delete `.next`, start again. |
| Build error "unstable value `new Date()` while prerendering" | `cacheComponents` forbids the current date in a server component | Do not call `new Date()`/`Math.random()` in server components. The footer year is a fixed `2026`; confetti uses a seeded formula. |
| Lint: "setState in effect" | `react-hooks/set-state-in-effect` | Use a lazy `useState(() => …)` initialiser, or disable the rule on a data-load effect with a comment. |
| Lint: "purity" on `Math.random()` in a component | Same family of rules | Use a deterministic value (the suggested affiliate code uses the phone's last digits). |
| JS `String.replace` produces odd results with `$$` | `$` patterns in replacement strings | Always pass a **function** as the replacement. |
| Admin buttons say "Run supabase/… first" | The SQL for that feature is not run | Run `affiliate-update-all.sql`. |
| "Saving details is not switched on yet" on Profile | `affiliate-profile.sql` not run | Run it. |
| Dashboard shows no chart/referrals | `affiliate-activity.sql` not run (the panels hide themselves) | Run it. |
| Affiliate reset or sign-up confirmation email lands on the wrong page | The redirect URL is not in Supabase's allowed list | Add `/affiliates/reset-password` and `/affiliates/dashboard` to the Redirect URLs (section 9). |
| Reward is 6% but the site says 25% (or the reverse) | The two places disagree | Make `site.ts` and `pay_settings.partner_commission_percent` equal. |
| Long shell commands with heredocs fail to parse in the terminal tool | Quoting | Write scripts to a file and run them. |
| Next.js behaves differently from older versions | This project uses Next 16 with breaking changes | Read `node_modules/next/dist/docs/` before changing Next-specific code (see `AGENTS.md`). |

## 12. Test and quality checklist (after any change)

- `npx tsc --noEmit` and `npx eslint src` must print nothing.
- Open `/affiliates`, `/affiliates/signup`, `/affiliates/login`, `/affiliates/join`, `/affiliates/terms` and check them at phone width.
- Signed-out visit to `/affiliates/dashboard` must send you to `/affiliates/login`; signed-out `/affiliates/join` must go to signup.
- With an approved test affiliate: dashboard sections all open; Copy buttons work; Profile saves ("requested").
- After a test payment: reward appears; receipt opens; refund removes it.

## 13. Landmark commits (newest first, for orientation)

Search `git log` for these words: "Affiliate commission is now 25%", "Affiliate profile", "Admin dashboard: list of flagged", "reviewed terms, refunds", "Receipts for CV payments", "Affiliate dashboard: app-style layout", "sign-up and log-in are full-screen dark", "Rakuten-style footer", "FAQ", "celebration photos", "Who can become an affiliate", "Rename the partner program to the affiliate program".

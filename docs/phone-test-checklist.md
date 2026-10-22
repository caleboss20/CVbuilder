# Real-phone check list

Automated checks at phone size (390 x 844) already pass: no sideways scrolling and no
console errors on any screen. These are the things only a real phone can confirm.
Test on at least one Android (Chrome) and, if possible, one iPhone (Safari).

Tick each one. Write down the phone and browser for anything that fails.

## 1. Downloads (the most important)
- [ ] Build a CV, tap **Download PDF**. The PDF opens or saves, is **not blank**, has every section, fits one page.
- [ ] Tap **Download Word**. A `.docx` downloads and opens in Word or Google Docs with the right content.
- [ ] Open **Cover letter**, write a letter, tap **Download letter as PDF** (under the editor). It is **not blank**, uses the formal layout, and shows your name and the letter text.
- [ ] After the first download, the "Your CV is ready" summary appears and can be closed. Later downloads show the small closable share card instead.

## 2. Starting
- [ ] `/builder` shows three clear choices (Use a template, Start blank, Upload my CV). Tapping each works.
- [ ] The field chips (Health, Engineering ...) are easy to tap and narrow the course list.
- [ ] Search a course that is not on the list (for example "Geography"). A "Use ..." option appears and works.
- [ ] Answer the three guide questions. The recommended CV type makes sense, and tapping another type works.

## 3. Upload and import
- [ ] **Upload my CV** with a PDF from your phone: it fills the builder. Check name, contact details, jobs, school.
- [ ] Same with a Word file. Same with a two-column PDF.
- [ ] With a CV already saved, importing shows the "Replace your saved CV?" pop-up and **Keep my CV** really keeps it.

## 4. Editing
- [ ] Steps are easy to tap, and the **Edit / Preview** switch works. The preview shows a whole A4 page that you can read.
- [ ] Voice typing (the mic marked Beta) asks for permission, listens, and the text can be edited.
- [ ] Autosave: type something, close the browser, reopen `/builder`. Your work is still there. The check mark shows next to the logo.
- [ ] **Choose your template** card appears near the end and opens the picker. Thumbnails are readable, not too large.

## 5. Templates page
- [ ] The template carousel swipes smoothly and the arrows work. The page itself never scrolls sideways.
- [ ] "What does ATS-safe mean?" opens and closes.

## 6. CV checker
- [ ] Upload a PDF, add a job advert, pick an industry (try "Other"), tap **Check my CV**. The score and fixes appear and scroll into view.

## 7. Letters, signature and signing
- [ ] On the letter page, the form has clear space at the sides and the letter-type buttons sit in a neat grid.
- [ ] **Draw it**: sign with your finger. The page does not scroll while you draw. **Undo**, **Redo** and **Clear** work, and nothing saves until **Use this signature**.
- [ ] **Upload a photo** of a signature on white paper. The paper disappears and only the ink remains.
- [ ] Download the letter. The signature sits between "Yours faithfully," and your name, at a sensible size.
- [ ] `/sign-letter`: upload a PDF from your phone, and a photo of a printed letter. The signature starts near the closing line and drags smoothly with a finger. **Left / Centre / Right** move it. **Download signed letter** gives a PDF with the signature on it.

## 8. Backup and sharing
- [ ] In the builder, **Save backup** downloads a `.json` file. After you clear the site's data, **Restore backup** brings the CV back.
- [ ] **Share on WhatsApp** opens WhatsApp with the message and the CV11 link.

## 9. Pricing
- [ ] `/pricing` with payments **off**: one card, "Free", with PDF and Word downloads listed as included. No Pro plan anywhere.
- [ ] `/pricing` with payments **on** (`NEXT_PUBLIC_PAYMENTS_ENABLED=true`): a "Build" card (GH₵ 0) and a "Download" card (GH₵ 5 per CV). The price stays on one line and the badge sits on the card's top edge.

## 10. Everything else
- [ ] Light and dark mode both look right (toggle in the top bar).
- [ ] Nothing is cut off at the edges, and no text overlaps buttons.

## 11. CV versions (`/builder/versions`)
- [ ] With a CV saved, the page shows three version cards, each with a **full, readable thumbnail** (not cut off) and different templates.
- [ ] Rename a version, change its role line, template and colour. The thumbnail updates. Reload: your changes are still there.
- [ ] **Add a version**, **Give each a different template** and **Use one template for all** work.
- [ ] Tap **Download PDF** on one version: the save dialog opens with a file name like `Name_Company_CV`, and the PDF is not blank and fits one page.
- [ ] **Download all**: on a phone this may be unreliable. Note what happens, and confirm one-at-a-time downloads always work.
- [ ] With no CV saved, the page says "Build your CV first" and links to the builder.

## 12. Certificates (`/certificates`)
- [ ] The **Pick a design** and **Use my own certificate** tabs both work, and switching keeps what you typed.
- [ ] The gallery shows all 35 designs (wide and tall) without sideways scrolling. Tapping one changes the preview.
- [ ] **Try it with sample Ghanaian names** fills 10 names. The ZIP downloads, opens, and holds 10 PDFs named after the people.
- [ ] Paste 20 names: the amber notice says only the first 15 will be made. One name gives a single PDF, not a ZIP.
- [ ] Add a logo and **drag it with your finger** on the preview. The page does not scroll while dragging. The size slider works. The downloaded PDF has the logo where you left it.
- [ ] A name with a Ghanaian letter (for example `Kɔfi Ɛnyonam`) shows correctly in the preview and the PDF.
- [ ] **Use my own certificate**: upload a Canva PDF and then a photo of a certificate. Drag the name onto the blank line, change font, colour and size, and download. The name sits where the preview showed it.

## 13. Accounts and payments (only after payments are switched on and tested with Paystack test cards)
- [ ] Tap **Download PDF** while logged out: a "Create a free account to download" box appears. After signing up and confirming the email, you land back on your CV with the payment box.
- [ ] Pay with a test card: you return to your CV, see "You're all set", and the PDF downloads. A second download within 30 days asks for nothing.
- [ ] Close the payment page halfway, then return: nothing is charged twice, and the CV unlocks if the payment went through.
- [ ] Making versions of a paid CV needs no second payment.

## 14. Homepage
- [ ] The **Certificates for everyone who showed up** section shows a neat pinboard of wide and tall previews, and the button opens `/certificates`.
- [ ] The menu has a **Certificates** link, and the menu does not crowd or wrap badly at phone width.

import { siteConfig } from "./site";

export type Faq = { q: string; a: string };

const { enabled: paid, price, days } = siteConfig.download;

export const faqs: Faq[] = [
  {
    q: "What is CV11 and how does it work?",
    a: "CV11 is a free CV builder made for students and fresh graduates in Ghana. Pick a template, answer simple questions about your course, projects and activities, use the writing coach to tidy up your wording, then download a clean PDF. Most students finish their first CV in one sitting.",
  },
  {
    q: paid ? "How much does CV11 cost?" : "Is CV11 really free for students?",
    a: paid
      ? `Building your CV, previewing it, every template, the CV checker and the letters are free. Downloading a finished CV costs ${price}, paid once with mobile money or a card. That one payment covers PDF and Word downloads of that CV for ${days} days, so fixing a typo later costs nothing. There is no watermark with our name on your CV and no subscription.`
      : "Yes. You can build your CV, use every template and download your PDF for free. There is no watermark with our name on your CV and no trial that runs out.",
  },
  {
    q: "Do I need to create an account?",
    a: paid
      ? "Not to build or preview your CV. You need a free account when you download it, so your payment is tied to you and safe. An account also lets you open your CV from another phone or laptop."
      : "No. You can start building straight away. Creating a free account is only useful if you want to come back to your CV later from another phone or laptop.",
  },
  {
    q: "I have no work experience. What do I put on my CV?",
    a: "Plenty. Course projects, your final-year project, industrial attachment, national service, clubs, SRC or church roles, volunteering and part-time jobs all count. CV11 has sections for each one, and our CV examples show how students in your course present them.",
  },
  {
    q: "Will my CV pass ATS and hiring software?",
    a: "ATS means Applicant Tracking System, the software some employers use to sort CVs. Every template exports a text-based PDF, and the ones tagged ATS-safe use one column, plain headings and no photo, which software reads most reliably. Two-column and photo designs look great to a person but can confuse some software, so use them when you know someone will read your CV by eye.",
  },
  {
    q: "What is the difference between a CV and a resume?",
    a: "In Ghana, most employers use the two words to mean the same thing: a short, targeted document of one to two pages. Elsewhere, a resume is the short version for a specific job, while a CV is a longer, complete record of your education, research, publications and awards, mostly used for academic and research roles. For internships, national service and normal jobs, a one to two page CV is what you want.",
  },
  {
    q: "Can you check a CV I already have?",
    a: "Yes. The free CV checker lets you upload a PDF or Word CV, add the job you want and pick your industry. You get a score out of 100 and clear steps to improve it. Your file is read in your browser and is never uploaded.",
  },
  {
    q: "Can AI write my whole CV for me?",
    a: "AI suggestions are being tested and are coming to students soon. Today the writing coach points out weak lines as you type, and you stay in charge. Whatever tool you use, check that every line is true for you, because recruiters will ask about it in the interview.",
  },
  {
    q: "Should I add a photo to my CV?",
    a: "Most CVs do not need one. Many employers, and almost all international ones, prefer no photo, and plain layouts without one are safest for hiring software. Add a photo only if the employer asks for it or your industry expects it, such as media, hospitality or modelling. CV11 has templates both ways.",
  },
  {
    q: "How long should a student CV be?",
    a: "One page is best for most students and fresh graduates. Two pages is fine if you have a lot of relevant experience, research or projects. Keep only what helps you get the job you are applying for.",
  },
  {
    q: "Can I use CV11 on my phone?",
    a: "Yes. CV11 works in your phone’s browser, so you can build, edit and download your CV without a laptop.",
  },
  {
    q: "Can I make different CVs for internships, national service and jobs?",
    a: "Yes. Start from one CV and adjust it for each application. Change the summary, reorder your experience and highlight the skills that match what each employer is looking for.",
  },
  {
    q: "Is my information safe?",
    a: "Your CV belongs to you. We only use your details to build your CV, we do not sell your personal data, and you can delete your CV whenever you want.",
  },
];

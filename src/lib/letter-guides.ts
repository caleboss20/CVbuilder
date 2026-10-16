import type { LetterKind } from "./cover-letter";

/*
 * One guide per letter the letter writer can draft. Each becomes a page at
 * /letters/<slug> that explains what the letter should contain, then sends the
 * student to the writer with that letter type already chosen. They give the
 * letters their own place on the site, and in search results.
 *
 * Advice only: no invented statistics, nothing a student could not act on.
 */

export type LetterGuide = {
  slug: string;
  kind: LetterKind;
  /** The page heading. */
  title: string;
  /** A short name for cards and the footer. */
  short: string;
  /** One line for the card on the homepage and the index. */
  blurb: string;
  intro: string;
  include: string[];
  tips: string[];
  mistakes: string[];
};

export const letterGuides: LetterGuide[] = [
  {
    slug: "scholarship-application-letter",
    kind: "scholarship",
    title: "How to write a scholarship application letter",
    short: "Scholarship letter",
    blurb: "Show the committee you deserve the support and will use it well.",
    intro:
      "A scholarship letter has one job: to show the committee that you deserve the support and that you will use it well. It should be honest, specific and short enough to read in a minute.",
    include: [
      "The scholarship and the provider, named correctly, and who you are: your course, your school and your year.",
      "Your results: your CGPA or class, your WASSCE grades if they ask for them, and any awards.",
      "What you do outside class: leadership, clubs, volunteering or work, with one clear example.",
      "Your circumstances, only if the scholarship asks about need. Keep it short, honest and factual, and attach the proof they ask for.",
      "What you will do with the support, and how it will help others.",
      "A list of what you have enclosed (CV, transcript, referee letters), a thank-you and your contact details.",
    ],
    tips: [
      "Name the scholarship and the provider, so it is clear the letter was written for them.",
      "Follow the advert exactly: the length, the documents and the deadline.",
      "Pick two or three strong achievements and explain them, instead of listing everything.",
      "Ask a lecturer or a friend to read it before you send it.",
      "Keep it to one page.",
    ],
    mistakes: [
      "Sending the same letter to every scholarship.",
      "Listing duties instead of what you achieved.",
      "Spelling the committee's name or the scholarship wrongly.",
      "Writing more than one page.",
    ],
  },
  {
    slug: "university-application-letter",
    kind: "admission",
    title: "How to write a university or programme application letter",
    short: "University application letter",
    blurb: "Explain why this programme, and what you have already done in the field.",
    intro:
      "When you apply to a university, a master's or another programme, this letter tells the admissions team why you want to join and why you will do well. It is your chance to speak beyond your certificates.",
    include: [
      "The programme and the institution, named correctly.",
      "Your background: your degree, your school and the subjects that prepared you.",
      "Why this programme, and what you hope to learn.",
      "Relevant work: projects, research, a thesis, internships or leadership.",
      "What you will bring to the programme, and what you hope to do afterwards.",
    ],
    tips: [
      "Read the programme page and use its own words where they fit, so the letter shows you did your homework.",
      "Show your interest with a real example, such as a project or a course you enjoyed, instead of saying you are passionate.",
      "Keep a clear order: who you are, why this programme, what you offer, what you want next.",
      "Check the length and format the institution asks for.",
    ],
    mistakes: [
      "Writing about the institution's fame instead of the programme itself.",
      "Repeating your CV line by line.",
      "Big claims with nothing to back them up.",
      "Leaving it until the deadline day.",
    ],
  },
  {
    slug: "reference-request-letter",
    kind: "reference",
    title: "How to ask a lecturer or supervisor to be your referee",
    short: "Reference request",
    blurb: "A polite way to ask, with an easy way for them to say no.",
    intro:
      "A good reference can decide an application, and the best ones come from people who were asked politely and given what they need. This short letter does exactly that.",
    include: [
      "A friendly opening and a clear request: would you be willing to act as my referee?",
      "What you are applying for, so they know what to write about.",
      "How they know you, such as supervising your project or teaching you a course.",
      "Your CV attached, so they can see what you have done recently.",
      "An easy way to say no, and a thank-you.",
    ],
    tips: [
      "Ask early and ask in person or by message first when you can. A letter is a good follow-up.",
      "Tell them the deadline and how the reference should be sent.",
      "Remind them of something specific you did in their class or under them.",
      "Tell them the outcome afterwards, and thank them again.",
    ],
    mistakes: [
      "Listing someone as a referee without asking them.",
      "Asking the day before the deadline.",
      "Not saying what the reference is for.",
    ],
  },
  {
    slug: "thank-you-letter-after-interview",
    kind: "thanks",
    title: "How to write a thank-you letter after an interview",
    short: "Thank-you after an interview",
    blurb: "A short note that keeps you in their mind.",
    intro:
      "A short thank-you after an interview shows good manners and keeps you in the interviewer's mind. It takes five minutes, and many candidates skip it.",
    include: [
      "A thank-you for their time, naming the role.",
      "One specific thing you enjoyed or learned from the conversation.",
      "A sentence on why you are still keen and what you would bring.",
      "A polite close that says you look forward to hearing from them.",
    ],
    tips: [
      "Send it the same day or the next day.",
      "Keep it short: four short paragraphs at most.",
      "Mention something real from the interview so it does not read like a template.",
      "Proofread the interviewer's name and the company name.",
    ],
    mistakes: [
      "Waiting a week.",
      "Repeating your whole CV.",
      "Using it to raise salary or benefits.",
    ],
  },
  {
    slug: "follow-up-letter-after-applying",
    kind: "followup",
    title: "How to follow up on a job application",
    short: "Follow-up on an application",
    blurb: "Check on your application without sounding pushy.",
    intro:
      "Sometimes a good application gets lost in a busy inbox. A short, polite follow-up shows you are serious and can bring your name back to the top.",
    include: [
      "The role you applied for and roughly when you applied.",
      "A line saying you are still very interested.",
      "An offer to send anything else they need, such as references or certificates.",
      "A thank-you for their time.",
    ],
    tips: [
      "Wait about a week, unless the advert gave a date.",
      "Send one follow-up, not a string of them.",
      "Be friendly and brief. You are checking in, not complaining.",
      "Send it to the same person or email address you applied to.",
    ],
    mistakes: [
      "Following up the next day.",
      "Sounding upset that they have not replied.",
      "Sending the same message over and over.",
    ],
  },
  {
    slug: "national-service-cover-letter",
    kind: "service",
    title: "How to write a national service cover letter",
    short: "National service letter",
    blurb: "Ask for a placement and show you are ready to serve and learn.",
    intro:
      "Organisations that take national service personnel read many letters. Yours should be short, say clearly what you are asking for and show that you are ready to learn and to be useful.",
    include: [
      "The organisation, and the unit or work you would like to do if you know it.",
      "Who you are: your course, your school and your graduation year.",
      "Two or three things from your studies, projects or attachments that fit their work.",
      "Why you want to serve with them in particular.",
      "A polite request for a placement, and thanks.",
    ],
    tips: [
      "Read about the organisation first and mention something specific about its work.",
      "Say what you can do in your first month, not only what you hope to learn.",
      "Keep it to one page and use the same name for the organisation throughout.",
      "Send a CV with it. Our national service checklist has a full list of what to prepare.",
    ],
    mistakes: [
      "A general letter that could be sent to any organisation.",
      "Only talking about what you want to receive.",
      "Typing the organisation's name wrongly.",
    ],
  },
  {
    slug: "internship-cover-letter",
    kind: "internship",
    title: "How to write an internship cover letter",
    short: "Internship cover letter",
    blurb: "Show you are eager to learn and already useful.",
    intro:
      "Employers know interns are still learning. What they want to see is that you are keen, reliable and already have something useful to offer.",
    include: [
      "The internship and the company, named correctly.",
      "Who you are: your course, your school and your year.",
      "A relevant project, class or activity that shows you can do the work.",
      "Your skills, tied to what the advert asks for.",
      "A clear close that asks for the chance to talk.",
    ],
    tips: [
      "Match your words to the advert. If it asks for Excel, say how you have used Excel.",
      "Show enthusiasm with facts: a project, a club, something you built or organised.",
      "Keep it to about four short paragraphs.",
    ],
    mistakes: [
      "Saying you have no experience instead of showing what you have done.",
      "Copying a letter from the internet without changing it.",
      "Sending it without a CV.",
    ],
  },
  {
    slug: "job-cover-letter",
    kind: "job",
    title: "How to write a cover letter for a job",
    short: "Job cover letter",
    blurb: "Introduce yourself and show why you fit the role.",
    intro:
      "A cover letter introduces you and shows why you are right for this particular job. It supports your CV, so it should add something your CV cannot say as well.",
    include: [
      "The job and the company, and where you saw the advert.",
      "A short introduction: who you are and your strongest point.",
      "One or two examples of your work that match the job.",
      "Your key skills, in the words the advert uses.",
      "A confident close that asks for an interview.",
    ],
    tips: [
      "Address it to a named person when you can.",
      "Pick the experience that matters most for this job and explain it, instead of repeating your whole CV.",
      "Use numbers: how many, how often, how much.",
      "Keep it to one page and check every name and date.",
    ],
    mistakes: [
      "A general opening such as “To whom it may concern” when a name was available.",
      "Repeating the CV word for word.",
      "Making claims you could not discuss in an interview.",
    ],
  },
];

export const getLetterGuide = (slug: string) => letterGuides.find((g) => g.slug === slug);

/** The letter writer, opened with this letter type chosen. */
export const writerHref = (kind: LetterKind) => `/cover-letter?kind=${kind}`;

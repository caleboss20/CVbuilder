/*
 * CV guides for the /blog section. Written for students in Ghana, in plain language.
 * Each guide is data, so adding one is a new entry here: the index page, the article
 * page, the sitemap and the search metadata all pick it up.
 *
 * Rule for these guides: no invented statistics. Give advice a student can act on.
 */

export type GuideSection = {
  heading: string;
  /** Paragraphs, in order. */
  body: string[];
  /** An optional bullet list after the paragraphs. */
  list?: string[];
};

export type Guide = {
  slug: string;
  title: string;
  /** Used for the page description and the card on the index. */
  summary: string;
  /** ISO date, shown on the page and in the search metadata. */
  published: string;
  sections: GuideSection[];
  /** Where the call to action at the bottom sends the reader. */
  cta: { label: string; href: string };
};

export const guides: Guide[] = [
  {
    slug: "how-to-write-a-cv",
    title: "How to write a CV as a student in Ghana",
    summary:
      "A step-by-step guide for students and fresh graduates: what to include, what to leave out, and how to describe what you have done even without a job.",
    published: "2026-10-16",
    cta: { label: "Build my CV now", href: "/builder" },
    sections: [
      {
        heading: "Start with the basics",
        body: [
          "A student CV should be one page, or two at the most. Put your full name at the top, then your phone number, email address and the town or city you are in. Use an email address that looks professional, ideally some version of your name.",
          "You do not need your date of birth, your marital status, your religion or your home address. Recruiters do not need them, and leaving them out keeps the CV short.",
        ],
      },
      {
        heading: "Write a short summary",
        body: [
          "Under your name, write two or three sentences about who you are, what you are good at and what you want. A simple formula works well: who you are (course, year and school), what you are good at (two skills or experiences) and what you are looking for (an internship, national service, a first job).",
          "For example: Final-year Nursing student at KNUST with ward experience at Komfo Anokye Teaching Hospital. Careful with patient records and calm under pressure. Looking for a placement as a staff nurse.",
        ],
      },
      {
        heading: "Put your strongest section first",
        body: [
          "If you have worked, put your experience first. If you are still a student with little work history, lead with your education and projects instead. Employers hiring students expect this, and a strong final-year project says more than a vague job title.",
        ],
      },
      {
        heading: "Turn what you did into bullet points",
        body: [
          "Under each role, project or activity, write two to four bullet points. Start each one with an action word, say what you did, and add a number where you can. Numbers make your work easier to picture.",
          "Compare these two lines. Weak: Responsible for helping customers. Stronger: Served about 50 customers a day and balanced the cash box every evening.",
        ],
        list: [
          "Start with an action word such as Led, Built, Organised, Trained or Managed.",
          "Say how many, how often or how much: 40 volunteers, every week, 15% faster.",
          "Keep each bullet to one or two lines.",
          "Do not write filler such as hard-working or team player. Show it with what you did.",
        ],
      },
      {
        heading: "No work experience? You still have plenty",
        body: [
          "Many things count as experience: your final-year project, industrial attachment, national service, class projects, clubs, SRC or church roles, volunteering and part-time work. Describe each one the same way you would a job: what you did and what came out of it.",
        ],
      },
      {
        heading: "List skills you can prove",
        body: [
          "Group your skills so they are easy to scan, for example Software, Clinical or Professional. List only skills you could show in an interview. Excel pivot tables says more than computer skills.",
        ],
      },
      {
        heading: "Referees",
        body: [
          "Choose two people who know your work, such as a lecturer or a supervisor from your attachment. Ask their permission first, and tell them which roles you are applying for so they are ready if they are called.",
        ],
      },
      {
        heading: "Check it before you send it",
        body: [
          "Read your CV out loud, and ask a friend to read it too. Check names, dates, phone numbers and spelling. Save it as a PDF so the layout does not change, and name the file clearly, for example Ama_Mensah_CV.pdf.",
          "If an employer asks you to apply through an online form, use a simple one-column layout without a photo. It is the safest choice for the software some employers use to sort applications.",
        ],
      },
    ],
  },
  {
    slug: "cv-vs-resume",
    title: "CV vs resume: what is the difference?",
    summary:
      "In Ghana the two words usually mean the same thing. Elsewhere they can mean very different documents. Here is how to tell, and which one you need.",
    published: "2026-10-16",
    cta: { label: "Check my CV", href: "/cv-checker" },
    sections: [
      {
        heading: "The short answer",
        body: [
          "A resume is a short, targeted summary of your skills and experience for one specific job. A CV (curriculum vitae) is a fuller record of your education and professional life, including research, publications and awards.",
          "In Ghana, and in much of Europe, Asia and Australia, employers use the word CV for the short one to two page document you send with a job application. If someone asks for your CV or your resume here, they almost always want the same thing.",
        ],
      },
      {
        heading: "Where the two really differ",
        body: ["The difference matters most for applications abroad and for academic work."],
        list: [
          "Length: a resume is usually one to two pages. An academic CV has no strict limit and can run to several pages.",
          "Content: a resume highlights what is relevant to one role. A CV records everything: education, research, publications, presentations, awards and projects.",
          "Customising: a resume is changed for each application. An academic CV changes only when you have something new to add.",
          "Use: a resume is for jobs and internships. A CV is for academic, research and teaching roles, grants and fellowships.",
        ],
      },
      {
        heading: "Which one do you need?",
        body: [
          "For an internship, national service or a normal job in Ghana, write a one to two page CV that is tailored to the role. Lead with your strongest section and cut anything that does not help.",
          "For postgraduate study, lecturing, research roles or fellowships, an academic CV is what reviewers expect. It lists your research, publications and conference talks, and it can be longer.",
        ],
      },
      {
        heading: "Applying abroad",
        body: [
          "Read the job advert carefully. In the United States, resume means the short document and CV usually means the academic one. In the United Kingdom and many other countries, CV is the short document. When the advert is unclear, send the short, tailored version for a job, and the academic version for research.",
        ],
      },
    ],
  },
  {
    slug: "national-service-cv",
    title: "How to write a CV for national service",
    summary:
      "National service applications often reach someone who reads many CVs a day. Here is how to make yours clear, relevant and quick to read.",
    published: "2026-10-16",
    cta: { label: "Write my national service CV", href: "/builder" },
    sections: [
      {
        heading: "What a national service CV needs to do",
        body: [
          "Organisations that take national service personnel want to see that you are reliable, that your course fits their work and that you can learn quickly. You are not expected to have long work experience, so the CV is mostly about your education, your projects and the way you have worked with others.",
        ],
      },
      {
        heading: "What to include",
        body: ["Keep it to one page and put the most relevant things first."],
        list: [
          "Your contact details and the town where you can serve.",
          "A short summary that says your course, your school and that you are looking for a national service placement.",
          "Your degree, school and graduation year.",
          "Your final-year project, with what you did and what you found or built.",
          "Industrial attachments, internships, clubs and volunteering, each with two or three bullet points.",
          "Skills that match the work of the organisation, such as software, clinical or lab skills.",
          "Two referees, with their permission.",
        ],
      },
      {
        heading: "Match it to the organisation",
        body: [
          "Read about the organisation before you apply. If they work in banking, bring your accounting, Excel and customer-handling experience to the top. If they are a hospital, lead with clinical placements and patient care. Use the same words the organisation uses where they are true for you.",
        ],
      },
      {
        heading: "Show you are ready to serve",
        body: [
          "A short cover letter helps. Say why you want to serve with that organisation and what you can contribute. Keep it to a few paragraphs, and make sure it is true and specific rather than a general letter you send to everyone.",
        ],
      },
      {
        heading: "Common mistakes",
        body: ["These are easy to fix before you send your CV."],
        list: [
          "Sending one CV to every organisation without changing the summary.",
          "A long list of duties instead of what you actually achieved.",
          "Missing phone numbers or an email address that looks unprofessional.",
          "A file called CV1.pdf. Name it with your own name.",
        ],
      },
    ],
  },
];

export const getGuide = (slug: string) => guides.find((g) => g.slug === slug);

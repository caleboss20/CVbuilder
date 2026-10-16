import type { CvTemplateName } from "./cv-examples";

/*
 * CV types. Students should not have to know the difference between a skills-based
 * and a graduate CV, so the builder asks three plain questions and picks one for
 * them (see recommendCvType). They can always change it afterwards.
 *
 * The type decides which steps the builder shows, in what order, and (in the
 * newer templates) the order of sections on the page.
 */

export type CvType = "standard" | "graduate" | "skills" | "academic";

export const cvTypes: { id: CvType; label: string; summary: string }[] = [
  {
    id: "standard",
    label: "Standard",
    summary: "Work experience first. Best for jobs, and when you already have work history.",
  },
  {
    id: "graduate",
    label: "Graduate",
    summary: "Education and projects first. Best for students and fresh graduates.",
  },
  {
    id: "skills",
    label: "Skills-based",
    summary: "Skills and projects first. Best if your experience is thin or you are changing field.",
  },
  {
    id: "academic",
    label: "Academic",
    summary: "Adds research, publications and talks. For postgraduate study, lecturing and grants.",
  },
];

/** The three questions, and the answers a student can give. */
export type GuideAnswers = {
  goal?: "intern" | "job" | "postgrad" | "unsure";
  experience?: "none" | "some" | "lots";
  strength?: "experience" | "education" | "skills";
};

export const guideQuestions: {
  key: keyof GuideAnswers;
  title: string;
  options: { value: string; label: string; hint?: string }[];
}[] = [
  {
    key: "goal",
    title: "What are you applying for?",
    options: [
      { value: "intern", label: "An internship or national service" },
      { value: "job", label: "A job" },
      { value: "postgrad", label: "Postgraduate study, research or lecturing" },
      { value: "unsure", label: "I’m not sure yet" },
    ],
  },
  {
    key: "experience",
    title: "How much work experience do you have?",
    options: [
      { value: "none", label: "None yet", hint: "School and projects only" },
      { value: "some", label: "Some", hint: "Internships, part-time work, volunteering" },
      { value: "lots", label: "A lot", hint: "Several jobs or years of work" },
    ],
  },
  {
    key: "strength",
    title: "What is your strongest point?",
    options: [
      { value: "experience", label: "My work experience" },
      { value: "education", label: "My degree and projects" },
      { value: "skills", label: "My skills and what I can do" },
    ],
  },
];

export type Recommendation = {
  type: CvType;
  /** One plain sentence saying why, shown to the student. */
  reason: string;
  /** A sensible starting template for this type. */
  template: CvTemplateName;
};

/** Picks a CV type, with the reason, from the three answers. Unanswered questions are ignored. */
export function recommendCvType(a: GuideAnswers): Recommendation {
  if (a.goal === "postgrad") {
    return {
      type: "academic",
      reason: "You are applying for research, postgraduate study or lecturing, so we added research, publications and talks sections and let the CV run longer.",
      template: "serifExecutive",
    };
  }
  if (a.strength === "skills") {
    return {
      type: "skills",
      reason: "Your skills are your strongest point, so they and your projects come first, ahead of your work history.",
      template: "greyBars",
    };
  }
  if (a.experience === "none" || a.strength === "education") {
    return {
      type: "graduate",
      reason:
        a.experience === "none"
          ? "You have no work history yet, so your education and projects come first. That is what employers look at for a student."
          : "Your degree and projects are your strongest point, so they come first.",
      template: "dateColumn",
    };
  }
  return {
    type: "standard",
    reason: "You have work experience to show, so a standard CV with your experience near the top works best.",
    template: "ruledClassic",
  };
}

/** Whether a student has answered every question. */
export const guideComplete = (a: GuideAnswers) => !!a.goal && !!a.experience && !!a.strength;

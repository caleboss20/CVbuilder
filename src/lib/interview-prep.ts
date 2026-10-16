/*
 * Interview preparation content. For each question we say what the interviewer is
 * really looking for and how to build an honest answer, not a script to memorise.
 * The field ids match course-groups.ts, so the same fields appear everywhere.
 *
 * No invented statistics: advice a student can act on.
 */

export type Question = {
  q: string;
  /** What to do: the points a good answer covers. */
  tips: string[];
};

/** Asked in almost every interview, whatever the field. */
export const generalQuestions: Question[] = [
  {
    q: "Tell us about yourself.",
    tips: [
      "Keep it to about a minute: who you are, what you study or did, and why you are here.",
      "Start with your course and school, add one or two things you are proud of (a project, a placement), then say what you want next.",
      "Do not read out your whole CV. Pick the parts that fit this role.",
    ],
  },
  {
    q: "What are your strengths?",
    tips: [
      "Choose two or three strengths that matter for this job, not a long list.",
      "Back each one with a short real example: a time you showed it.",
      "Say it plainly, for example: “I am organised. In my final-year project I kept a team of four on schedule.”",
    ],
  },
  {
    q: "What is your weakness?",
    tips: [
      "Pick a real weakness that does not stop you doing the job, such as speaking up in big groups.",
      "Say what you are doing about it and a small sign of progress.",
      "Avoid fake weaknesses like “I work too hard”. Interviewers hear them every day.",
    ],
  },
  {
    q: "Why should we choose you?",
    tips: [
      "Match what they asked for in the advert with something you have actually done.",
      "Mention your attitude too: you learn fast, you turn up, you take feedback well, if it is true.",
      "End with what you would bring in your first few months.",
    ],
  },
  {
    q: "Tell us about a time you worked in a team.",
    tips: [
      "Use the STAR method: Situation, Task, Action, Result (explained below).",
      "Say what YOU did, not only what the group did, and what the outcome was.",
      "A group assignment, a club or a placement is a perfectly good example.",
    ],
  },
  {
    q: "Where do you see yourself in five years?",
    tips: [
      "Show you want to grow in this field and are not just passing through.",
      "Keep it realistic: gaining skills, taking on more responsibility, maybe further study.",
      "Do not name the interviewer's own job.",
    ],
  },
  {
    q: "Do you have any questions for us?",
    tips: [
      "Always have two or three ready. Having none can look like low interest.",
      "Good ones: What does a good first three months look like? What would you want me to learn first? Who would I work with day to day?",
      "Do not start with salary or leave. Ask about the work first.",
    ],
  },
];

export type FieldPrep = {
  /** Matches an id in course-groups.ts. */
  id: string;
  /** Short heading for the page. */
  title: string;
  intro: string;
  questions: Question[];
};

export const fieldPrep: FieldPrep[] = [
  {
    id: "health",
    title: "Health and medical sciences",
    intro: "Employers in health want safe, calm and honest people. Show how you treat patients, handle pressure and own your mistakes.",
    questions: [
      {
        q: "Tell us about a time you dealt with a difficult patient or a worried family.",
        tips: [
          "Describe the situation calmly, then what you did: listened, explained, asked a senior for help if needed.",
          "Show respect and patience. Never share anything that could identify a patient.",
          "End with what happened and what you learned.",
        ],
      },
      {
        q: "What would you do if you made a mistake with a medication or a record?",
        tips: [
          "The safe answer is honesty: tell your supervisor straight away, help put it right, and write it up properly.",
          "Say you would learn from it so it does not happen again.",
          "Never suggest hiding it. Safety comes first.",
        ],
      },
      {
        q: "How do you cope with long shifts and pressure?",
        tips: [
          "Give real habits: sleep, food, asking for help, handing over clearly.",
          "Mention teamwork. Good clinicians know when to ask.",
          "Use an example from a ward or clinical placement.",
        ],
      },
      {
        q: "Why do you want to work in this unit or hospital?",
        tips: [
          "Show you looked at them: their services, their patients, their reputation.",
          "Link it to your own placement or interest.",
          "Avoid “it was the only one hiring”.",
        ],
      },
    ],
  },
  {
    id: "engineering",
    title: "Engineering and built environment",
    intro: "Engineering interviews test how you think and how you stay safe. Explain your reasoning, not just your answers.",
    questions: [
      {
        q: "Describe a technical project you are proud of.",
        tips: [
          "Say the problem, your part, the tools you used and the result, with a number if you can.",
          "Be clear about what you did yourself in a group project.",
          "Finish with what you would improve if you did it again.",
        ],
      },
      {
        q: "How do you check your work for errors or safety problems?",
        tips: [
          "Name your steps: checking calculations twice, following standards, asking someone to review.",
          "Give an example where a check caught a problem.",
          "Show that safety and accuracy matter more to you than speed.",
        ],
      },
      {
        q: "Tell us about a time a design or plan did not work.",
        tips: [
          "Explain what went wrong, how you found the cause and how you fixed it.",
          "Own your part without blaming others.",
          "What you learned matters most.",
        ],
      },
      {
        q: "How do you work with people who are not engineers, like technicians or clients?",
        tips: [
          "Say you explain things in plain language and listen to people who work with the equipment every day.",
          "Give a placement or site example.",
          "Show respect for their experience.",
        ],
      },
    ],
  },
  {
    id: "computing",
    title: "Computing and data",
    intro: "Be ready to talk about what you built, how you solve problems and how you learn. Real projects beat long lists of tools.",
    questions: [
      {
        q: "Walk us through a project you built.",
        tips: [
          "Say what problem it solved, who it was for and the tools you chose and why.",
          "Describe one hard part and how you solved it.",
          "Have the code or a demo ready to show.",
        ],
      },
      {
        q: "How do you debug a problem you cannot find?",
        tips: [
          "Explain a method: reproduce it, narrow it down, read error messages, test one change at a time, search, ask.",
          "Give a real example, including how long it took.",
          "It is fine to say you ask for help after trying properly.",
        ],
      },
      {
        q: "How do you keep learning new tools?",
        tips: [
          "Name what you learned recently and how: a course, documentation, building something small.",
          "Show a habit, not a one-off.",
          "Be honest about what you are still learning.",
        ],
      },
      {
        q: "Tell us about working with others on code or data.",
        tips: [
          "Mention version control, splitting work and reviewing each other's changes.",
          "Say how you handled a disagreement or a merge problem.",
          "Show you write clearly so others can use your work.",
        ],
      },
    ],
  },
  {
    id: "business",
    title: "Business and finance",
    intro: "Banks and firms look for accuracy, honesty with money and good manners with customers. Show all three with real examples.",
    questions: [
      {
        q: "How would you handle a customer who is angry about a mistake?",
        tips: [
          "Stay calm, listen without interrupting, apologise for the problem, and say what you will do.",
          "Know when to bring in a senior colleague.",
          "Use a real example from a job, a shop or a campus role.",
        ],
      },
      {
        q: "Tell us about a time you used numbers to solve a problem.",
        tips: [
          "Describe the problem, the data (even a simple Excel sheet), what you found and what changed.",
          "Mention accuracy checks, such as reconciling or double-checking totals.",
          "Give the result in numbers if you can.",
        ],
      },
      {
        q: "Why do you want to work in this company or sector?",
        tips: [
          "Show you read about them: what they do and how they are different.",
          "Connect it to your course and a project or attachment.",
          "Keep it specific, not “it is a good company”.",
        ],
      },
      {
        q: "How do you keep information confidential?",
        tips: [
          "Say you only share what is needed, keep records secure and never discuss clients outside work.",
          "Give an example where you held back information properly.",
          "Show that you understand trust is the core of the job.",
        ],
      },
    ],
  },
  {
    id: "sciences",
    title: "Sciences and agriculture",
    intro: "Reliable results and clear explanations win interviews in science. Be ready to explain your work simply.",
    questions: [
      {
        q: "Explain your research or final-year project to someone who is not a scientist.",
        tips: [
          "Start with why it matters, then what you did, then what you found, in plain words.",
          "Avoid jargon, or explain each term once.",
          "Practise it out loud with a friend.",
        ],
      },
      {
        q: "How do you make sure your results are reliable?",
        tips: [
          "Talk about repeating measurements, controls, calibration and recording everything.",
          "Give an example of catching an error.",
          "Be honest about limits in your own work.",
        ],
      },
      {
        q: "Tell us about a lab or field problem you solved.",
        tips: [
          "Describe the situation, what went wrong, your steps and the result.",
          "Show you stayed safe and followed the procedure.",
          "Mention who you asked for help.",
        ],
      },
      {
        q: "How do you handle safety and ethics in your work?",
        tips: [
          "Mention the rules you follow, such as protective equipment, waste handling and consent where it applies.",
          "Say what you would do if you saw someone cut corners.",
          "Give a concrete lab or field example.",
        ],
      },
    ],
  },
  {
    id: "social",
    title: "Law, social sciences and humanities",
    intro: "These interviews test how you argue, write and think. Give reasons for your views and show you can listen.",
    questions: [
      {
        q: "Tell us about a time you persuaded someone or argued a point well.",
        tips: [
          "Set the scene briefly, then show your reasoning: evidence first, then conclusion.",
          "Mention how you handled the other side's view.",
          "Moot court, debate or a group discussion all work.",
        ],
      },
      {
        q: "How do you research a topic quickly and check that your sources are reliable?",
        tips: [
          "Describe your steps: start broad, find the best sources, cross-check, note where each fact came from.",
          "Say how you spot weak or biased sources.",
          "Use an assignment or a case as your example.",
        ],
      },
      {
        q: "How do you handle sensitive or confidential information?",
        tips: [
          "Say you only share what is needed and with the right people.",
          "Show you understand why it matters in your field.",
          "An internship or chambers example is ideal.",
        ],
      },
      {
        q: "Tell us about a piece of writing or a presentation you are proud of.",
        tips: [
          "Say who it was for, what you wanted them to understand and how you structured it.",
          "Mention feedback you received and used.",
          "Bring a short sample if the interviewer would like to see it.",
        ],
      },
    ],
  },
  {
    id: "education",
    title: "Education",
    intro: "Schools look for patience, clear explanations and a good way with children and parents. Show what you did in the classroom.",
    questions: [
      {
        q: "How would you handle a noisy or struggling class?",
        tips: [
          "Describe calm steps: clear routines, firm and fair expectations, praising good behaviour.",
          "Say you would find out why a pupil is struggling before blaming them.",
          "Use an example from teaching practice.",
        ],
      },
      {
        q: "How do you explain a difficult idea to a pupil?",
        tips: [
          "Give an example: start from something they already know, use a simple picture or object, check understanding with a question.",
          "Show you change your method when it does not work.",
          "Pick a real topic from your subject.",
        ],
      },
      {
        q: "Describe a lesson you planned.",
        tips: [
          "State the aim, the activities, how you checked learning and what you would change.",
          "Mention pupils of different levels.",
          "Be ready to share the plan itself.",
        ],
      },
      {
        q: "How would you work with parents?",
        tips: [
          "Say you would keep them informed with kindness and clear facts, good and bad.",
          "Listen to their concerns before replying.",
          "Show respect and professionalism.",
        ],
      },
    ],
  },
  {
    id: "creative",
    title: "Creative and media",
    intro: "Bring your work. Creative interviews are mostly about your portfolio, your process and how you take feedback.",
    questions: [
      {
        q: "Walk us through a project from the brief to the finished work.",
        tips: [
          "Cover the brief, your ideas, what you chose and why, and how it turned out.",
          "Show drafts or sketches if you can, not only the final piece.",
          "Say what the client or audience thought.",
        ],
      },
      {
        q: "How do you take feedback on your work?",
        tips: [
          "Show you listen first, ask questions and separate the work from yourself.",
          "Give a time feedback made a piece better.",
          "Avoid sounding defensive.",
        ],
      },
      {
        q: "How do you meet a deadline when you are not happy with the work yet?",
        tips: [
          "Explain how you decide what matters most and when something is good enough to deliver.",
          "Say you communicate early if a deadline is at risk.",
          "Give a real example.",
        ],
      },
      {
        q: "Which tools do you use and how do you learn new ones?",
        tips: [
          "Name the tools you are strongest in and what you made with them.",
          "Show how you learn: tutorials, practice projects, asking others.",
          "Be honest about what you do not know yet.",
        ],
      },
    ],
  },
  {
    id: "service",
    title: "National service",
    intro: "Organisations want someone reliable who is ready to learn and to be posted somewhere new. Show attitude as much as skill.",
    questions: [
      {
        q: "Why do you want to serve with us?",
        tips: [
          "Show you read about the organisation and connect it to your course.",
          "Say what you hope to learn and what you can give back.",
          "Avoid sounding like you only need a posting.",
        ],
      },
      {
        q: "How would you handle being posted somewhere unfamiliar?",
        tips: [
          "Show you are flexible and see it as a chance to learn.",
          "Mention a time you adapted, such as a new school, a placement or a move.",
          "Be practical about how you would settle in.",
        ],
      },
      {
        q: "What can you contribute in your first month?",
        tips: [
          "Name two specific skills from your course or projects that would help right away.",
          "Add the attitude: punctual, willing to learn, takes instructions well.",
          "Keep it modest and realistic.",
        ],
      },
      {
        q: "Tell us about a time you took responsibility without being asked.",
        tips: [
          "Use the STAR method: describe the situation, the need you spotted, what you did and what changed.",
          "A campus role, a church group or a family business all count.",
          "Show initiative and follow-through.",
        ],
      },
    ],
  },
];

export const getFieldPrep = (id: string) => fieldPrep.find((f) => f.id === id);

/** The STAR method, explained once and shown on every page. */
export const starSteps = [
  { letter: "S", label: "Situation", text: "Set the scene in one or two sentences." },
  { letter: "T", label: "Task", text: "What was your job or the problem to solve?" },
  { letter: "A", label: "Action", text: "What did YOU do, step by step? This is the longest part." },
  { letter: "R", label: "Result", text: "What changed? Add a number if you can, and what you learned." },
];

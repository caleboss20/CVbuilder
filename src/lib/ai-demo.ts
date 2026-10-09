export type DemoSection = "summary" | "experience" | "activities" | "projects";

export type DemoLine = {
  section: DemoSection;
  input: string;
  output: string;
  /** Entry header shown above the line on the CV (role, place, dates). */
  meta?: { title: string; place: string; date: string };
};

export type DemoPersona = {
  id: string;
  name: string;
  role: string;
  template: "sidebar" | "classic" | "serif";
  templateName: string;
  photo?: string;
  labels: Record<DemoSection, string>;
  examples: DemoLine[];
};

/** Scripted students for the auto-playing homepage demo, one template each. */
export const demoPersonas: DemoPersona[] = [
  {
    id: "ama",
    name: "Ama Mensah",
    role: "Computer Science Student",
    template: "sidebar",
    templateName: "Monochrome",
    photo: "/images/demo/ama-mensah.webp",
    labels: {
      summary: "Summary",
      experience: "Experience",
      activities: "Activities",
      projects: "Projects",
    },
    examples: [
      {
        section: "summary",
        input: "final year cs student at knust, i like building apps",
        output:
          "Final-year Computer Science student at KNUST with hands-on experience building web and mobile apps, eager to grow as a software engineer.",
      },
      {
        section: "experience",
        meta: { title: "Software Engineering Intern", place: "Hubtel", date: "Jun – Aug 2025" },
        input: "internship at hubtel, i fixed bugs with a team of 6",
        output:
          "Resolved software bugs and supported feature releases as a Software Engineering Intern at Hubtel, collaborating in an agile team of 6.",
      },
      {
        section: "activities",
        meta: { title: "Organising Committee", place: "CS Departmental Week", date: "2024" },
        input: "i helped organise our department week, about 300 students came",
        output:
          "Coordinated a week-long departmental event for 300+ students, managing logistics, sponsors and a team of volunteers.",
      },
      {
        section: "projects",
        meta: { title: "Campus Marketplace App", place: "Team project", date: "2025" },
        input: "me and 3 friends built an app for selling stuff on campus",
        output:
          "Co-developed a campus marketplace app with a team of 4, enabling students to buy and sell items safely and quickly.",
      },
    ],
  },
  {
    id: "osborn",
    name: "Osborn Appiah",
    role: "Electrical Engineering Graduate",
    template: "classic",
    templateName: "Classic Blue",
    photo: "/images/demo/osborn-appiah.webp",
    labels: {
      summary: "Summary",
      experience: "Work Experience",
      activities: "Leadership",
      projects: "Projects",
    },
    examples: [
      {
        section: "summary",
        input: "electrical engineering grad from knust, good with solar and electronics",
        output:
          "Electrical Engineering graduate from KNUST with practical experience in solar PV installation and electronics, ready to contribute to Ghana’s growing energy sector.",
      },
      {
        section: "experience",
        meta: { title: "National Service Personnel, ECG", place: "Kumasi", date: "Nov 2025 – Present" },
        input: "doing my national service at ecg, i check meters and help with faults",
        output:
          "Inspected customer meters and supported fault response teams across Kumasi, helping restore power to affected areas faster.",
      },
      {
        section: "projects",
        meta: { title: "Solar-Powered Irrigation System", place: "Final-year project", date: "2025" },
        input: "for final year project we built solar irrigation for a farm",
        output:
          "Designed and built a solar-powered irrigation system for a local farm, cutting daily manual watering time and running costs.",
      },
      {
        section: "activities",
        meta: { title: "Vice President, Engineering Students’ Association", place: "KNUST", date: "2023 – 2024" },
        input: "i was vice president of our engineering association, about 200 members",
        output:
          "Served as Vice President for 200+ members, organising technical workshops and industry visits with local engineering firms.",
      },
    ],
  },
  {
    id: "caleb",
    name: "Caleb Antwi",
    role: "Software Developer",
    template: "serif",
    templateName: "Elegant Serif",
    labels: {
      summary: "Professional Profile",
      experience: "Work Experience",
      activities: "Leadership",
      projects: "Projects",
    },
    examples: [
      {
        section: "summary",
        input: "software dev, i build mobile and web apps with react native and next.js",
        output:
          "Software developer specialising in mobile and web apps with React Native and Next.js, focused on building fast, clean products people enjoy using.",
      },
      {
        section: "experience",
        meta: { title: "Co-founder & Mobile Engineer", place: "Husker AI (Kumasi, Ghana)", date: "2025 – present" },
        input: "co-founded husker ai, i build the mobile app and the website",
        output:
          "Co-founded Husker AI and lead mobile and web development, shipping the company’s app and SEO-focused website from the ground up.",
      },
      {
        section: "projects",
        meta: { title: "Fintech Wallet App", place: "Personal project", date: "2025" },
        input: "built a fintech app with 2fa and a dashboard",
        output:
          "Built a fintech wallet app with two-factor authentication and a real-time dashboard, with a focus on security and smooth onboarding.",
      },
      {
        section: "activities",
        meta: { title: "Lead Organiser", place: "Campus Developer Meetups (KNUST)", date: "2024" },
        input: "i organise coding meetups for students on campus",
        output:
          "Organised monthly coding meetups on campus, running hands-on sessions that helped beginners ship their first projects.",
      },
    ],
  },
];

const verbs: [RegExp, string][] = [
  [/^(helped|help) (to )?organi[sz]e?d?/, "Coordinated"],
  [/^organi[sz]e?d?/, "Coordinated"],
  [/^(helped|help) (to )?/, "Supported"],
  [/^(did|do)/, "Completed"],
  [/^(made|make)/, "Created"],
  [/^(fixed|fix)/, "Resolved"],
  [/^(built|build)/, "Developed"],
  [/^(led|lead)/, "Led"],
  [/^(taught|teach)/, "Taught"],
  [/^(worked|work) (on|with|at|as)/, "Contributed"],
  [/^(was|am) (the )?/, "Served as"],
];

const suffix: Record<DemoSection, string> = {
  summary: "",
  experience: ", building strong professional and teamwork skills",
  activities: ", strengthening leadership, teamwork and communication skills",
  projects: ", applying problem-solving skills to a real campus need",
};

function detectSection(text: string): DemoSection {
  if (/intern|job|work|national service|company|attachment/.test(text)) return "experience";
  if (/club|organi[sz]|event|president|lead|volunteer|rep|association|church|team captain/.test(text))
    return "activities";
  if (/app|website|project|built|build|code|research|design/.test(text)) return "projects";
  return "summary";
}

/**
 * Offline stand-in for the AI rewrite used on the marketing page.
 * Rewrites casual student phrasing into a stronger CV line.
 */
export function improveLine(raw: string): DemoLine {
  const text = raw.trim().toLowerCase().replace(/\s+/g, " ").replace(/[.!]+$/, "");
  const section = detectSection(text);

  let body = text
    .replace(/^(so |um |well )/, "")
    .replace(/^(me and [^ ]+ (friends?|others?)|my friends? and i|we) /, "")
    .replace(/^i('m| am)? /, "")
    .replace(/\bi\b/g, "I");

  if (section === "summary") {
    const output = `Motivated ${body}, eager to apply my skills and keep learning in a professional role.`;
    return { section, input: raw, output: output.charAt(0).toUpperCase() + output.slice(1) };
  }

  let matched = false;
  for (const [pattern, verb] of verbs) {
    if (pattern.test(body)) {
      body = body.replace(pattern, verb + " ");
      matched = true;
      break;
    }
  }
  if (!matched) body = `Contributed to ${body}`;

  body = body.replace(/\s+/g, " ").trim();
  const output = `${body.charAt(0).toUpperCase()}${body.slice(1)}${suffix[section]}.`;
  return { section, input: raw, output };
}

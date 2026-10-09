export type CvIcon =
  | "health"
  | "code"
  | "money"
  | "build"
  | "law"
  | "book"
  | "flask"
  | "chart"
  | "megaphone"
  | "leaf"
  | "pen"
  | "briefcase"
  | "gear"
  | "flag";

export type CvJob = {
  title: string;
  place: string;
  date: string;
  bullets: string[];
};

export type CvDoc = {
  name: string;
  contact: string[];
  summary: string;
  experience: CvJob[];
  education: { degree: string; school: string; date: string }[];
  skills: string[];
};

export type CvExample = {
  slug: string;
  course: string;
  icon: CvIcon;
  row: 0 | 1 | 2;
  /** One-line hook used for the page intro and meta description. */
  intro: string;
  tips: string[];
  cv: CvDoc;
};

const contact = (name: string, city = "Kumasi") => [
  `${city}, Ghana`,
  "024 000 0000",
  `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@email.com`,
];

export const cvExamples: CvExample[] = [
  // ---------------------------------------------------------------- row 0
  {
    slug: "nursing",
    course: "Nursing",
    icon: "health",
    row: 0,
    intro: "A nursing CV that shows your ward experience, patient care skills and how calmly you work under pressure.",
    tips: [
      "List every clinical rotation with the hospital, ward and dates. Recruiters read this first.",
      "Mention practical skills by name: vital signs, wound dressing, IV monitoring, patient education.",
      "Add your Nursing and Midwifery Council (NMC) index or licence status once you have it.",
    ],
    cv: {
      name: "Abena Owusu",
      contact: contact("Abena Owusu"),
      summary:
        "Final-year Nursing student at KNUST with ward experience at Komfo Anokye Teaching Hospital. Careful with records, calm under pressure and confident explaining care to patients in English and Twi.",
      experience: [
        {
          title: "Clinical Rotation Student",
          place: "Komfo Anokye Teaching Hospital, Kumasi",
          date: "Jan 2025 – present",
          bullets: [
            "Assist nurses with admissions, vital signs and medication rounds on a 30-bed surgical ward.",
            "Update patient charts accurately across day and night shifts.",
            "Explain discharge instructions to patients and families in English and Twi.",
          ],
        },
        {
          title: "Volunteer Health Educator",
          place: "Ghana Red Cross Society, Kumasi",
          date: "2023 – 2024",
          bullets: ["Ran malaria and hygiene awareness sessions in 6 community schools."],
        },
      ],
      education: [{ degree: "BSc Nursing", school: "KNUST, Kumasi", date: "2022 – 2026" }],
      skills: [
        "Clinical: vital signs, wound dressing, infection control, patient education",
        "Languages: English, Twi",
        "Computer: MS Office, electronic health records",
      ],
    },
  },
  {
    slug: "computer-science",
    course: "Computer Science",
    icon: "code",
    row: 0,
    intro: "A Computer Science CV that puts your projects, internships and tech stack where recruiters can see them in seconds.",
    tips: [
      "Lead with projects if you have little work experience. Link your GitHub and any live demos.",
      "Name the tools you used for each project instead of listing 20 languages in a skills block.",
      "Say what you built and who used it: “a campus app used by 500 students” beats “an app”.",
    ],
    cv: {
      name: "Ama Mensah",
      contact: [...contact("Ama Mensah"), "github.com/amamensah"],
      summary:
        "Final-year Computer Science student at KNUST with hands-on experience building web and mobile apps. Enjoys turning messy problems into simple, fast products.",
      experience: [
        {
          title: "Software Engineering Intern",
          place: "Hubtel, Accra",
          date: "Jun – Aug 2025",
          bullets: [
            "Fixed bugs and shipped small features in an agile team of 6.",
            "Wrote unit tests that raised coverage on a payments module to 80%.",
          ],
        },
        {
          title: "Campus Marketplace App",
          place: "Team project",
          date: "2025",
          bullets: ["Co-built a React Native app where students buy and sell items on campus."],
        },
      ],
      education: [{ degree: "BSc Computer Science", school: "KNUST, Kumasi", date: "2022 – 2026" }],
      skills: [
        "Languages: TypeScript, Python, SQL",
        "Tools: React, React Native, Node.js, Git, Figma",
      ],
    },
  },
  {
    slug: "accounting",
    course: "Accounting",
    icon: "money",
    row: 0,
    intro: "An accounting CV that proves you are accurate, organised and comfortable with numbers and the software firms use.",
    tips: [
      "Mention the accounting software you know: QuickBooks, Sage, Tally or advanced Excel.",
      "Show progress on ICAG or ACCA papers. Even partial passes count.",
      "Use numbers carefully and correctly. An accounting CV with a typo in a figure is a red flag.",
    ],
    cv: {
      name: "Kwabena Ofori",
      contact: contact("Kwabena Ofori"),
      summary:
        "Accounting student at KNUST School of Business with internship experience in reconciliations and payroll. Detail-focused, reliable with deadlines and studying for ICAG Level 1.",
      experience: [
        {
          title: "Finance Intern",
          place: "GCB Bank, Kumasi",
          date: "Jun – Sep 2025",
          bullets: [
            "Prepared daily cash reconciliations for 3 branch accounts.",
            "Helped the team clear a backlog of supplier invoices before month end.",
          ],
        },
        {
          title: "Treasurer",
          place: "Business Students’ Club",
          date: "2024 – 2025",
          bullets: ["Managed the club budget and published a clear spending report each semester."],
        },
      ],
      education: [{ degree: "BSc Accounting", school: "KNUST, Kumasi", date: "2022 – 2026" }],
      skills: ["Software: QuickBooks, Sage, advanced Excel", "Professional: ICAG Level 1 (in progress)"],
    },
  },
  {
    slug: "midwifery",
    course: "Midwifery",
    icon: "health",
    row: 0,
    intro: "A midwifery CV that highlights your deliveries, antenatal care experience and how you support mothers.",
    tips: [
      "Record the number of supervised deliveries and antenatal visits you took part in.",
      "Mention the facilities you trained in, including district or community health centres.",
      "Show soft skills that matter in labour wards: calm communication and teamwork.",
    ],
    cv: {
      name: "Efua Asante",
      contact: contact("Efua Asante", "Cape Coast"),
      summary:
        "Final-year Midwifery student with supervised delivery and antenatal clinic experience. Gentle with mothers, steady in emergencies and committed to safe maternal care.",
      experience: [
        {
          title: "Midwifery Student (Clinical Placement)",
          place: "Cape Coast Teaching Hospital",
          date: "2024 – present",
          bullets: [
            "Assisted with supervised deliveries and postnatal checks on the maternity ward.",
            "Took antenatal histories and educated mothers on nutrition and danger signs.",
          ],
        },
      ],
      education: [{ degree: "BSc Midwifery", school: "University of Cape Coast", date: "2022 – 2026" }],
      skills: ["Clinical: antenatal care, partograph use, newborn care", "Languages: English, Fante"],
    },
  },
  {
    slug: "civil-engineering",
    course: "Civil Engineering",
    icon: "build",
    row: 0,
    intro: "A civil engineering CV that shows site experience, design software skills and the projects you worked on.",
    tips: [
      "Describe each site attachment: the type of project, your role and the stage of construction.",
      "List design software clearly: AutoCAD, Civil 3D, Revit, SAP2000 or ETABS.",
      "Mention safety training or site supervision, even if it was on a small project.",
    ],
    cv: {
      name: "Yaw Boateng",
      contact: contact("Yaw Boateng"),
      summary:
        "Civil Engineering graduate from KNUST with site experience on road and building projects. Comfortable with AutoCAD and quantity take-offs, and keen to grow as a site engineer.",
      experience: [
        {
          title: "Industrial Attachment, Site Engineering",
          place: "Ghana Highway Authority, Kumasi",
          date: "Jun – Aug 2024",
          bullets: [
            "Supported site inspections and recorded daily progress on a 4 km road project.",
            "Helped prepare quantity take-offs for drainage works.",
          ],
        },
      ],
      education: [{ degree: "BSc Civil Engineering", school: "KNUST, Kumasi", date: "2021 – 2025" }],
      skills: ["Software: AutoCAD, Civil 3D, MS Project", "Site: surveying basics, materials testing"],
    },
  },
  {
    slug: "pharmacy",
    course: "Pharmacy",
    icon: "flask",
    row: 0,
    intro: "A pharmacy CV that covers dispensing experience, patient counselling and your path to licensure.",
    tips: [
      "Separate hospital and community pharmacy experience so employers see both.",
      "Mention dispensing, counselling and stock management by name.",
      "Add your Pharmacy Council housemanship or licence status when you have it.",
    ],
    cv: {
      name: "Nana Adjei",
      contact: contact("Nana Adjei"),
      summary:
        "Doctor of Pharmacy student at KNUST with community and hospital pharmacy experience. Careful with prescriptions and clear when counselling patients on their medicines.",
      experience: [
        {
          title: "Pharmacy Intern",
          place: "Ernest Chemists, Kumasi",
          date: "Jun – Sep 2025",
          bullets: [
            "Dispensed prescriptions under supervision and counselled patients on dosage.",
            "Helped track stock levels and flag items close to expiry.",
          ],
        },
      ],
      education: [{ degree: "Doctor of Pharmacy (PharmD)", school: "KNUST, Kumasi", date: "2020 – 2026" }],
      skills: ["Dispensing, patient counselling, inventory management", "Languages: English, Twi"],
    },
  },
  {
    slug: "law",
    course: "Law",
    icon: "law",
    row: 0,
    intro: "A law CV that shows strong writing, research and moot court experience, ready for chambers and firms.",
    tips: [
      "Put moot court, legal aid clinics and law journal work near the top.",
      "Keep sentences short and precise. Your CV is a writing sample.",
      "Mention internships in chambers or firms with the areas of law you worked on.",
    ],
    cv: {
      name: "Akosua Darko",
      contact: contact("Akosua Darko", "Accra"),
      summary:
        "Final-year LLB student with chambers internship and moot court experience. Strong researcher and clear writer with a growing interest in corporate and commercial law.",
      experience: [
        {
          title: "Legal Intern",
          place: "Private chambers, Accra",
          date: "Jun – Aug 2025",
          bullets: [
            "Researched case law and drafted memos on contract disputes for senior counsel.",
            "Organised case files and court documents for 10+ active matters.",
          ],
        },
        {
          title: "Mooter",
          place: "Faculty Moot Court Competition",
          date: "2024",
          bullets: ["Reached the semi-finals arguing a constitutional law problem."],
        },
      ],
      education: [{ degree: "Bachelor of Laws (LLB)", school: "KNUST, Kumasi", date: "2022 – 2026" }],
      skills: ["Legal research, drafting, Westlaw and LexisNexis", "Languages: English, Twi, French (basic)"],
    },
  },

  // ---------------------------------------------------------------- row 1
  {
    slug: "national-service",
    course: "National Service",
    icon: "flag",
    row: 1,
    intro: "A national service CV that helps you land a good placement and turns your service year into real experience.",
    tips: [
      "Treat your service post like a full job: list duties and results, not just the institution.",
      "Mention your NSS number only if the application asks for it.",
      "Tailor your CV to the placement you want, not just your degree.",
    ],
    cv: {
      name: "Osborn Appiah",
      contact: contact("Osborn Appiah"),
      summary:
        "Electrical Engineering graduate serving with ECG. Practical, safety-minded and comfortable working in the field with technical teams.",
      experience: [
        {
          title: "National Service Personnel",
          place: "Electricity Company of Ghana, Kumasi",
          date: "Nov 2025 – present",
          bullets: [
            "Inspect customer meters and support fault response teams across Kumasi.",
            "Log faults and repairs so supervisors can track response times.",
          ],
        },
      ],
      education: [{ degree: "BSc Electrical and Electronic Engineering", school: "KNUST, Kumasi", date: "2021 – 2025" }],
      skills: ["Technical: AutoCAD, MATLAB, solar PV design", "Languages: English, Twi, Ga"],
    },
  },
  {
    slug: "banking",
    course: "Banking Intern",
    icon: "money",
    row: 1,
    intro: "A banking internship CV that shows you are trustworthy, good with customers and accurate with money.",
    tips: [
      "Show customer service experience, even from a part-time job or church role.",
      "Mention accuracy with cash or records. Banks care about it more than anything.",
      "Keep the design simple and professional. Banking is a conservative industry.",
    ],
    cv: {
      name: "Esi Mensah",
      contact: contact("Esi Mensah", "Accra"),
      summary:
        "Banking and Finance student at UPSA looking for a banking internship. Friendly with customers, careful with cash and quick to learn new systems.",
      experience: [
        {
          title: "Customer Service Assistant (Holiday Job)",
          place: "MTN Service Centre, Accra",
          date: "Dec 2024 – Jan 2025",
          bullets: [
            "Helped 40+ customers a day with SIM registration and MoMo issues.",
            "Balanced daily cash and float records without errors.",
          ],
        },
      ],
      education: [{ degree: "BSc Banking and Finance", school: "UPSA, Accra", date: "2023 – 2027" }],
      skills: ["Customer service, cash handling, Excel", "Languages: English, Twi, Ewe"],
    },
  },
  {
    slug: "teaching",
    course: "Teaching",
    icon: "book",
    row: 1,
    intro: "A teaching CV that highlights your classroom practice, lesson planning and how you help students learn.",
    tips: [
      "Describe your teaching practice: school, class level, subjects and class size.",
      "Mention lesson planning, assessment and any extra-curricular clubs you led.",
      "Add your licensure status from the National Teaching Council when you have it.",
    ],
    cv: {
      name: "Kofi Asamoah",
      contact: contact("Kofi Asamoah", "Winneba"),
      summary:
        "B.Ed Mathematics graduate with a full year of teaching practice. Patient, well prepared and good at explaining hard topics in simple steps.",
      experience: [
        {
          title: "Student Teacher (Mathematics)",
          place: "Winneba Senior High School",
          date: "2024 – 2025",
          bullets: [
            "Planned and taught Core and Elective Mathematics to 3 classes of 45 students.",
            "Ran an after-school maths clinic for students preparing for WASSCE.",
          ],
        },
      ],
      education: [{ degree: "B.Ed Mathematics", school: "University of Education, Winneba", date: "2021 – 2025" }],
      skills: ["Lesson planning, classroom management, assessment", "Tools: MS Office, Google Classroom"],
    },
  },
  {
    slug: "medical-laboratory-science",
    course: "Medical Lab Science",
    icon: "flask",
    row: 1,
    intro: "A medical laboratory science CV that shows bench skills, accuracy and the lab equipment you can run.",
    tips: [
      "List the lab sections you rotated through: haematology, microbiology, chemistry, blood bank.",
      "Name the analysers and equipment you can operate.",
      "Mention quality control and safety practices you followed.",
    ],
    cv: {
      name: "Adwoa Kyei",
      contact: contact("Adwoa Kyei"),
      summary:
        "Medical Laboratory Science graduate with hospital lab rotations across haematology and microbiology. Accurate, organised and strict about sample handling and safety.",
      experience: [
        {
          title: "Laboratory Intern",
          place: "Kumasi South Hospital",
          date: "2024 – 2025",
          bullets: [
            "Processed blood and urine samples and recorded results for clinicians.",
            "Ran daily quality control checks on haematology analysers.",
          ],
        },
      ],
      education: [{ degree: "BSc Medical Laboratory Science", school: "KNUST, Kumasi", date: "2021 – 2025" }],
      skills: ["Haematology, microbiology, sample handling, QC", "Computer: LIS, MS Office"],
    },
  },
  {
    slug: "marketing",
    course: "Marketing",
    icon: "megaphone",
    row: 1,
    intro: "A marketing CV that shows campaigns you ran, the results and the tools you used to get them.",
    tips: [
      "Share results: followers gained, event turnout, sales from a campaign.",
      "Link a small portfolio or social page you grew.",
      "Name the tools: Canva, Meta Ads, Google Analytics, Mailchimp.",
    ],
    cv: {
      name: "Selasi Agbeko",
      contact: contact("Selasi Agbeko", "Accra"),
      summary:
        "Marketing student at the University of Ghana Business School who has run real social campaigns for campus events. Creative, data-curious and comfortable on camera.",
      experience: [
        {
          title: "Social Media Lead",
          place: "SRC Entertainment Committee",
          date: "2024 – 2025",
          bullets: [
            "Grew the committee’s Instagram from 1,200 to 4,800 followers in one semester.",
            "Planned posts and reels that helped sell out a 600-seat hall week concert.",
          ],
        },
      ],
      education: [{ degree: "BSc Administration (Marketing)", school: "University of Ghana, Legon", date: "2022 – 2026" }],
      skills: ["Canva, Meta Ads, Google Analytics", "Copywriting, content planning, photography"],
    },
  },
  {
    slug: "economics",
    course: "Economics",
    icon: "chart",
    row: 1,
    intro: "An economics CV that shows your analysis, research and data skills for policy, banking or consulting roles.",
    tips: [
      "Mention your dissertation topic and the data or methods you used.",
      "List data tools clearly: Excel, Stata, EViews, R or Python.",
      "Explain research in plain words so non-economists understand it.",
    ],
    cv: {
      name: "Kwame Ansah",
      contact: contact("Kwame Ansah", "Accra"),
      summary:
        "Economics graduate with research and data analysis experience. Comfortable cleaning data, running regressions and turning results into clear short reports.",
      experience: [
        {
          title: "Research Assistant",
          place: "Department of Economics",
          date: "2024 – 2025",
          bullets: [
            "Cleaned and analysed household survey data for a study on mobile money use.",
            "Wrote short summaries of findings for the lead researcher.",
          ],
        },
      ],
      education: [{ degree: "BA Economics", school: "University of Ghana, Legon", date: "2021 – 2025" }],
      skills: ["Data: Excel, Stata, R", "Research writing, presentations"],
    },
  },

  // ---------------------------------------------------------------- row 2
  {
    slug: "mechanical-engineering",
    course: "Mechanical Engineering",
    icon: "gear",
    row: 2,
    intro: "A mechanical engineering CV that shows hands-on workshop and plant experience alongside your design skills.",
    tips: [
      "Describe plant or workshop attachments: machines you maintained and procedures you followed.",
      "List CAD tools: SolidWorks, AutoCAD, ANSYS.",
      "Add your final-year project with what you designed, built or tested.",
    ],
    cv: {
      name: "Kojo Bekoe",
      contact: contact("Kojo Bekoe", "Takoradi"),
      summary:
        "Mechanical Engineering graduate with plant maintenance experience and strong CAD skills. Practical, safety-conscious and happiest solving problems on the floor.",
      experience: [
        {
          title: "Maintenance Intern",
          place: "Ghana Ports and Harbours Authority, Takoradi",
          date: "Jun – Aug 2024",
          bullets: [
            "Supported preventive maintenance on cranes and pumps with the engineering team.",
            "Recorded equipment faults and helped order replacement parts.",
          ],
        },
      ],
      education: [{ degree: "BSc Mechanical Engineering", school: "KNUST, Kumasi", date: "2021 – 2025" }],
      skills: ["SolidWorks, AutoCAD, ANSYS", "Maintenance planning, workshop safety"],
    },
  },
  {
    slug: "agriculture",
    course: "Agriculture",
    icon: "leaf",
    row: 2,
    intro: "An agriculture CV that shows field work, farm management and the practical results you achieved.",
    tips: [
      "Describe field work with crops, livestock, hectares or yields where you can.",
      "Mention extension work with farmers. It shows communication skills.",
      "Add tools like GIS, soil testing or farm record software.",
    ],
    cv: {
      name: "Abdul-Rahman Issah",
      contact: contact("Abdul-Rahman Issah", "Tamale"),
      summary:
        "Agriculture graduate with hands-on field and extension experience in Northern Ghana. Practical, patient with farmers and interested in climate-smart farming.",
      experience: [
        {
          title: "Agricultural Extension Assistant",
          place: "Ministry of Food and Agriculture, Tamale",
          date: "2024 – 2025",
          bullets: [
            "Trained 80+ smallholder farmers on improved maize seed and planting methods.",
            "Collected field data on yields for the district agriculture office.",
          ],
        },
      ],
      education: [{ degree: "BSc Agriculture", school: "University for Development Studies, Tamale", date: "2020 – 2024" }],
      skills: ["Crop management, soil sampling, farmer training", "Languages: English, Dagbani, Twi"],
    },
  },
  {
    slug: "graphic-design",
    course: "Graphic Design",
    icon: "pen",
    row: 2,
    intro: "A graphic design CV that stays clean and lets your portfolio do the talking.",
    tips: [
      "Put your portfolio link at the very top, next to your contact details.",
      "Keep the CV itself simple. A messy design CV is the fastest way to be rejected.",
      "List clients or brands you designed for, even small campus ones.",
    ],
    cv: {
      name: "Edem Kpodo",
      contact: [...contact("Edem Kpodo", "Accra"), "behance.net/edemkpodo"],
      summary:
        "Graphic designer and Communication Design student who has designed brands and event campaigns for campus groups and small businesses.",
      experience: [
        {
          title: "Freelance Graphic Designer",
          place: "Self-employed",
          date: "2023 – present",
          bullets: [
            "Designed logos and social media kits for 12 small businesses in Accra.",
            "Created event posters and merch for 3 campus festivals.",
          ],
        },
      ],
      education: [{ degree: "BA Communication Design", school: "KNUST, Kumasi", date: "2022 – 2026" }],
      skills: ["Figma, Adobe Illustrator, Photoshop, InDesign", "Branding, typography, layout"],
    },
  },
  {
    slug: "journalism",
    course: "Journalism",
    icon: "megaphone",
    row: 2,
    intro: "A journalism CV that shows your published work, deadlines met and the stories you covered.",
    tips: [
      "Link your best published pieces, broadcasts or podcast episodes.",
      "Mention the beats you covered: politics, sports, education, business.",
      "Show you can work fast and accurately under deadlines.",
    ],
    cv: {
      name: "Naa Ayeley Tetteh",
      contact: contact("Naa Ayeley Tetteh", "Accra"),
      summary:
        "Journalism student with campus radio and online news experience. Curious, quick on deadlines and comfortable on air and in print.",
      experience: [
        {
          title: "News Reporter and Presenter",
          place: "Campus Radio, Accra",
          date: "2024 – present",
          bullets: [
            "Report and present a weekly campus news bulletin.",
            "Interviewed student leaders and lecturers on fees and housing issues.",
          ],
        },
      ],
      education: [{ degree: "BA Journalism", school: "University of Media, Arts and Communication", date: "2022 – 2026" }],
      skills: ["News writing, interviewing, audio editing (Audacity)", "Languages: English, Ga, Twi"],
    },
  },
  {
    slug: "architecture",
    course: "Architecture",
    icon: "build",
    row: 2,
    intro: "An architecture CV that pairs with your portfolio and shows the software and studio work behind it.",
    tips: [
      "Link a short PDF portfolio with 4 to 6 of your strongest projects.",
      "List design tools: Revit, ArchiCAD, SketchUp, Lumion, AutoCAD.",
      "Mention studio awards, competitions or exhibitions.",
    ],
    cv: {
      name: "Elikem Dzansi",
      contact: contact("Elikem Dzansi"),
      summary:
        "Architecture student at KNUST with studio and office internship experience. Strong in 3D modelling and passionate about climate-responsive buildings in West Africa.",
      experience: [
        {
          title: "Architectural Intern",
          place: "Design studio, Accra",
          date: "Jun – Aug 2025",
          bullets: [
            "Produced Revit drawings and 3D views for two residential projects.",
            "Prepared presentation boards for client meetings.",
          ],
        },
      ],
      education: [{ degree: "BSc Architecture", school: "KNUST, Kumasi", date: "2022 – 2026" }],
      skills: ["Revit, SketchUp, Lumion, AutoCAD", "Model making, hand sketching"],
    },
  },
  {
    slug: "data-science",
    course: "Data Science",
    icon: "chart",
    row: 2,
    intro: "A data science CV that shows real datasets you worked with, the tools you used and what you found.",
    tips: [
      "Describe projects as question, data, method, result.",
      "Link notebooks or dashboards on GitHub or Kaggle.",
      "List tools: Python, pandas, SQL, Power BI or Tableau.",
    ],
    cv: {
      name: "Kwesi Nyarko",
      contact: [...contact("Kwesi Nyarko", "Accra"), "github.com/kwesinyarko"],
      summary:
        "Statistics graduate moving into data science, with projects on public health and transport data. Enjoys finding the story in messy datasets.",
      experience: [
        {
          title: "Data Analyst Intern",
          place: "Fintech startup, Accra",
          date: "Jun – Sep 2025",
          bullets: [
            "Built a Power BI dashboard tracking weekly app sign-ups and drop-offs.",
            "Cleaned transaction data with SQL and pandas for the growth team.",
          ],
        },
      ],
      education: [{ degree: "BSc Statistics", school: "University of Ghana, Legon", date: "2021 – 2025" }],
      skills: ["Python, pandas, SQL, Power BI", "Statistics, data visualisation"],
    },
  },
  {
    slug: "business-administration",
    course: "Business Administration",
    icon: "briefcase",
    row: 2,
    intro: "A business administration CV that shows leadership, organisation and the results you delivered.",
    tips: [
      "Highlight leadership roles in clubs, SRC or church groups.",
      "Show results with numbers: budgets managed, events run, members grown.",
      "Match your CV to the role: HR, operations, sales or management trainee.",
    ],
    cv: {
      name: "Kwabena Ofori",
      contact: contact("Kwabena Ofori"),
      summary:
        "Business Administration student at KNUST with leadership and operations experience from campus clubs and a retail internship.",
      experience: [
        {
          title: "Operations Intern",
          place: "Melcom, Kumasi",
          date: "Jun – Aug 2025",
          bullets: [
            "Tracked stock movement and helped reduce out-of-stock items on the floor.",
            "Supported the branch manager with weekly sales reports.",
          ],
        },
        {
          title: "Treasurer",
          place: "Business Students’ Club",
          date: "2024 – 2025",
          bullets: ["Managed the club budget and cut event costs by negotiating with vendors."],
        },
      ],
      education: [{ degree: "BSc Business Administration", school: "KNUST, Kumasi", date: "2022 – 2026" }],
      skills: ["Excel, reporting, customer service", "Leadership, budgeting, negotiation"],
    },
  },
];

export function getCvExample(slug: string) {
  return cvExamples.find((e) => e.slug === slug);
}

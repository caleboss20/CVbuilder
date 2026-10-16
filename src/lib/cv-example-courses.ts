import type { CvExample } from "./cv-examples";

/**
 * More course examples, covering fields the first set did not (electrical
 * engineering, biological and physical sciences, public health, humanities and
 * human resources). Each is a realistic CV a student in that field could build
 * from. They use the plain, photo-free templates, since a photo is optional.
 *
 * Kept in its own file so adding a course is one entry here, plus (if its name
 * is not obvious) a keyword in course-match.ts.
 */

/** Phone and email the way the other examples write them. */
const contact = (name: string, city: string, extra: string[] = []) => [
  `${city}, Ghana`,
  "024 000 0000",
  `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@email.com`,
  ...extra,
];

export const courseExamples: CvExample[] = [
  {
    slug: "information-technology",
    course: "Information Technology",
    icon: "code",
    row: 1,
    role: "Information Technology Student",
    template: "dateColumn",
    intro: "An IT CV that shows the systems you have supported, the networks you have set up and the tools you can use, with real examples.",
    tips: [
      "Name the systems and tools you used: Windows, Linux, Cisco Packet Tracer, helpdesk software, SQL.",
      "Say how many users or tickets you handled. Numbers make support work concrete.",
      "Add certificates you hold or are working towards, like Google IT Support, CompTIA A+ or Cisco CCNA, and say which are in progress.",
    ],
    cv: {
      name: "Nana Adjei",
      contact: contact("Nana Adjei", "Accra", ["github.com/nanaadjei"]),
      summary:
        "Final-year BSc Information Technology student at the Ghana Communication Technology University with hands-on helpdesk and networking experience. Patient with users, careful with documentation and keen to start as an IT support or network technician.",
      experience: [
        {
          title: "IT Support Intern",
          place: "Vodafone Ghana, Accra",
          date: "Jun – Aug 2025",
          bullets: [
            "Resolved 15 to 20 helpdesk tickets a week on hardware, software and email problems.",
            "Set up laptops and user accounts for 40 new staff, and installed the software each team needed.",
            "Wrote a short fix guide for the ten most common faults, which the team now uses.",
          ],
        },
        {
          title: "Network Lab Assistant",
          place: "Department of Information Technology, GCTU",
          date: "2024 – 2025",
          bullets: [
            "Helped 50 students configure routers and switches in Cisco Packet Tracer labs.",
            "Kept the lab computers updated and reported hardware faults to the technician.",
          ],
        },
      ],
      education: [
        { degree: "BSc Information Technology", school: "Ghana Communication Technology University, Accra", date: "2022 – 2026" },
        { degree: "WASSCE (General Science)", school: "Achimota School, Accra", date: "2018 – 2021" },
      ],
      skills: [
        "Support: troubleshooting, helpdesk tickets, Windows and Linux administration",
        "Networking: TCP/IP, DNS, DHCP, VLANs, Cisco Packet Tracer, basic firewall setup",
        "Web and data: HTML, CSS, JavaScript, SQL, Python basics",
      ],
      languages: ["English (Fluent)", "Twi (Native)", "Ga (Conversational)"],
      certifications: ["Google IT Support Professional Certificate", "Cisco CCNA: Introduction to Networks (in progress)"],
      projects: [
        {
          name: "School Results Portal",
          detail: "Built a PHP and MySQL portal where about 400 students check their results, replacing paper notice boards.",
        },
        {
          name: "Campus Wi-Fi Survey",
          detail: "Mapped weak Wi-Fi spots in three hostels and gave the IT office a short report with fixes.",
        },
      ],
      awards: ["Best Final-Year Project, Department of Information Technology 2025"],
      interests: ["Open-source projects", "Tech meetups in Accra", "Football"],
      references: [
        { name: "Mr. Kojo Antwi", role: "IT Support Lead, Vodafone Ghana", phone: "020 000 0000" },
        { name: "Dr. Mary Ofori", role: "Senior Lecturer, GCTU Department of IT", phone: "020 000 0000" },
      ],
    },
  },
  {
    slug: "medicine",
    course: "Medicine",
    icon: "health",
    row: 0,
    role: "Medical Student (MBChB)",
    template: "ruledClassic",
    intro: "A medical student CV that shows your clinical rotations, the skills you can do safely, and your community and research work.",
    tips: [
      "List every clinical rotation with the hospital, unit and dates: medicine, surgery, paediatrics, obstetrics and gynaecology.",
      "Name procedures you have done under supervision, such as cannulation, suturing or ECG recording. Do not claim what you have only watched.",
      "Add research, audits, outreach and any electives. Say what you did and the result in one line each.",
    ],
    cv: {
      name: "Adwoa Frimpong",
      contact: contact("Adwoa Frimpong", "Kumasi"),
      summary:
        "Final-year MBChB student at the KNUST School of Medical Sciences with clinical clerkships in medicine, surgery, paediatrics and obstetrics at Komfo Anokye Teaching Hospital. Careful with histories, clear in case presentations and committed to community health. Looking for a house officer (housemanship) placement.",
      experience: [
        {
          title: "Clinical Clerkship Student",
          place: "Komfo Anokye Teaching Hospital, Kumasi",
          date: "Jan 2025 – present",
          bullets: [
            "Take histories and examine patients on ward rounds, then present each case to the consultant team.",
            "Write clear clerking notes and follow up laboratory and imaging results for the patients I clerk.",
            "Assist with minor procedures under supervision, including cannulation, suturing and urinary catheterisation.",
          ],
        },
        {
          title: "Community Health Outreach Volunteer",
          place: "KNUST Medical Students’ Association, Kumasi",
          date: "2022 – present",
          bullets: [
            "Screened residents for blood pressure, blood sugar and BMI at monthly community outreaches, and referred high-risk patients to the nearest clinic.",
            "Gave short health talks on hypertension and diabetes in English and Twi.",
          ],
        },
        {
          title: "Research Assistant",
          place: "Department of Community Health, KNUST",
          date: "Jun – Aug 2024",
          bullets: [
            "Collected and entered survey data on hypertension awareness in two Kumasi communities.",
            "Helped prepare tables and a short summary for the supervising lecturer.",
          ],
        },
      ],
      education: [
        { degree: "MBChB (Bachelor of Medicine and Bachelor of Surgery)", school: "KNUST School of Medical Sciences, Kumasi", date: "2020 – 2026" },
        { degree: "WASSCE (General Science)", school: "Wesley Girls’ High School, Cape Coast", date: "2016 – 2019" },
      ],
      skills: [
        "Clinical: history taking, physical examination, case presentation, clerking notes",
        "Procedures (supervised): cannulation, suturing, urinary catheterisation, ECG recording",
        "Research and computer: SPSS, MS Office, reference managers, data entry",
      ],
      languages: ["English (Fluent)", "Twi (Native)", "Fante (Fluent)"],
      certifications: ["Basic Life Support (BLS), Ghana Red Cross", "Good Clinical Practice (GCP), online course"],
      projects: [
        {
          name: "Ward Handover Audit",
          detail: "Reviewed 60 patient handovers on a medical ward and proposed a one-page checklist that the team now uses.",
        },
        {
          name: "Hypertension Awareness Survey",
          detail: "Co-authored a short report on how well residents in two communities know their blood pressure status.",
        },
      ],
      awards: ["Dean’s List, Level 400", "Best Case Presentation, Surgery Rotation 2025"],
      interests: ["Community health outreach", "Debating", "Football"],
      references: [
        { name: "Prof. Kwame Asare", role: "Consultant Physician and Lecturer, KNUST School of Medical Sciences", phone: "020 000 0000" },
        { name: "Dr. Efua Danquah", role: "Senior Registrar, Komfo Anokye Teaching Hospital", phone: "020 000 0000" },
      ],
    },
  },
  {
    slug: "electrical-engineering",
    course: "Electrical and Electronics Engineering",
    icon: "gear",
    row: 0,
    role: "Electrical Engineering Student",
    template: "sideTimeline",
    intro: "Show your circuits, your lab work and the systems you have actually wired or programmed.",
    tips: [
      "Name the tools you used, like MATLAB, Proteus, AutoCAD Electrical or Arduino.",
      "Put your final-year project near the top and say what it did, with a number.",
      "Mention safety training and any work with real installations.",
    ],
    cv: {
      name: "Kwabena Asiedu",
      contact: contact("Kwabena Asiedu", "Kumasi", ["linkedin.com/in/kwabenaasiedu"]),
      summary:
        "Final-year Electrical and Electronics Engineering student at KNUST with hands-on experience in power systems and embedded programming. Built and tested a solar-powered irrigation controller and looking for a graduate engineering or national service placement.",
      experience: [
        {
          title: "Engineering Intern",
          place: "Electricity Company of Ghana, Kumasi",
          date: "Jun – Aug 2025",
          bullets: [
            "Assisted technicians with transformer inspections and load readings across 12 distribution points.",
            "Recorded faults and helped prepare weekly maintenance reports for the district engineer.",
            "Learned to read single-line diagrams and substation protection schemes.",
          ],
        },
        {
          title: "Lab Assistant",
          place: "KNUST Electrical Engineering Department",
          date: "2024 – 2025",
          bullets: [
            "Set up circuits and measuring equipment for 60 first-year students each practical session.",
            "Helped students debug breadboard circuits and explained basic AC and DC theory.",
          ],
        },
      ],
      education: [
        { degree: "BSc Electrical and Electronic Engineering", school: "KNUST, Kumasi", date: "2021 – 2025" },
        { degree: "WASSCE (General Science)", school: "Prempeh College, Kumasi", date: "2017 – 2020" },
      ],
      skills: [
        "Software: MATLAB, Proteus, AutoCAD Electrical, Python, C",
        "Hardware: Arduino, Raspberry Pi, PLC basics, soldering, oscilloscope use",
        "Professional: Technical writing, teamwork, safety awareness",
      ],
      languages: ["English (Fluent)", "Twi (Native)"],
      certifications: ["PLC Programming Basics, KNUST Short Course", "Electrical Safety Induction, ECG"],
      projects: [
        {
          name: "Solar Irrigation Controller",
          detail: "Built an Arduino controller that waters a small farm using soil sensors, cutting water use by about 30%.",
        },
        {
          name: "Home Power Monitor",
          detail: "Designed a low-cost meter that shows a household's daily electricity use on a phone.",
        },
      ],
      awards: ["Best Final-Year Project Proposal, Electrical Engineering 2025"],
      interests: ["Renewable energy", "Robotics club", "Football"],
      references: [
        { name: "Dr. Kofi Mensah", role: "Senior Lecturer, KNUST Electrical Engineering", phone: "020 000 0000" },
        { name: "Eng. Ama Boateng", role: "District Engineer, ECG Kumasi", phone: "020 000 0000" },
      ],
    },
  },
  {
    slug: "biological-sciences",
    course: "Biological Sciences",
    icon: "flask",
    row: 1,
    role: "Biological Sciences Student",
    template: "greyBars",
    intro: "Lab skills, field work and research are your strongest points. Show them with specifics.",
    tips: [
      "List the lab techniques you can do, like PCR, microscopy or culturing.",
      "Describe your research project in one line: the question, the method and the result.",
      "Add any field trips, sampling work or data analysis tools you used.",
    ],
    cv: {
      name: "Efua Mensimah",
      contact: contact("Efua Mensimah", "Cape Coast"),
      summary:
        "Biological Sciences student at the University of Cape Coast with lab and field experience in microbiology and ecology. Careful, organised and good at turning data into clear reports. Looking for a research assistant or lab internship.",
      experience: [
        {
          title: "Research Assistant",
          place: "UCC Department of Biochemistry",
          date: "2025",
          bullets: [
            "Prepared bacterial cultures and recorded growth results for a water quality study.",
            "Analysed 120 samples in Excel and helped present the findings to the supervising lecturer.",
            "Followed biosafety rules and kept the lab notebook up to date.",
          ],
        },
        {
          title: "Field Survey Volunteer",
          place: "Kakum National Park, Central Region",
          date: "Jul 2024",
          bullets: [
            "Counted and recorded plant species along 5 survey routes.",
            "Entered field data into a shared spreadsheet at the end of each day.",
          ],
        },
      ],
      education: [
        { degree: "BSc Biological Sciences", school: "University of Cape Coast", date: "2022 – 2026" },
        { degree: "WASSCE (General Science)", school: "Wesley Girls' High School, Cape Coast", date: "2018 – 2021" },
      ],
      skills: [
        "Laboratory: Microscopy, culturing, titration, PCR basics, sterile technique",
        "Data: Excel, SPSS, R basics, scientific writing",
        "Professional: Attention to detail, teamwork, time management",
      ],
      languages: ["English (Fluent)", "Fante (Native)", "Twi (Good)"],
      certifications: ["Laboratory Safety Training, UCC", "Introduction to R, Coursera"],
      projects: [
        {
          name: "Final-year project",
          detail: "Tested drinking water from 8 community sources for bacteria and compared the results with national guidelines.",
        },
        {
          name: "Mangrove Survey",
          detail: "Mapped mangrove cover along a short stretch of coast and wrote a summary for the class.",
        },
      ],
      awards: ["Dean's List, 2024/2025"],
      interests: ["Conservation", "Science writing", "Netball"],
      references: [
        { name: "Dr. Yaa Owusu", role: "Lecturer, UCC Biochemistry", phone: "020 000 0000" },
        { name: "Mr. Kojo Arthur", role: "Park Officer, Kakum National Park", phone: "020 000 0000" },
      ],
    },
  },
  {
    slug: "public-health",
    course: "Public Health",
    icon: "health",
    row: 2,
    role: "Public Health Student",
    template: "dateColumn",
    intro: "Community work counts here. Show the people you reached and what changed.",
    tips: [
      "Give numbers for outreach: how many people, how many communities.",
      "Mention any data collection, surveys or health education you led.",
      "Add tools like KoboToolbox, Excel, SPSS or Epi Info.",
    ],
    cv: {
      name: "Abena Frimpong",
      contact: contact("Abena Frimpong", "Accra"),
      summary:
        "Public Health student at the University of Ghana with experience in community outreach and health surveys. Clear communicator who has trained volunteers and collected data in rural communities. Looking for a health programme internship or national service placement.",
      experience: [
        {
          title: "Community Health Intern",
          place: "Ghana Health Service, Ga East Municipal",
          date: "Jun – Aug 2025",
          bullets: [
            "Helped run immunisation outreach days reaching about 400 children.",
            "Recorded attendance and vaccine stock in the clinic register each day.",
            "Taught mothers about handwashing and safe water storage.",
          ],
        },
        {
          title: "Health Education Volunteer",
          place: "Red Cross Society, Accra",
          date: "2023 – 2025",
          bullets: [
            "Led malaria prevention talks in 6 schools.",
            "Trained 15 new volunteers to give basic first aid.",
          ],
        },
      ],
      education: [
        { degree: "BSc Public Health", school: "University of Ghana, Legon", date: "2022 – 2026" },
        { degree: "WASSCE (General Science)", school: "Aburi Girls' SHS", date: "2018 – 2021" },
      ],
      skills: [
        "Public health: Health education, community engagement, survey design, report writing",
        "Tools: KoboToolbox, Excel, SPSS, Epi Info",
        "Professional: Communication, leadership, teamwork",
      ],
      languages: ["English (Fluent)", "Ga (Native)", "Twi (Good)"],
      certifications: ["First Aid and CPR, Red Cross", "Introduction to Epidemiology, Coursera"],
      projects: [
        {
          name: "Hand Hygiene Survey",
          detail: "Surveyed 150 households on handwashing habits and presented the results to the district health team.",
        },
        {
          name: "School Nutrition Project",
          detail: "Measured pupils' weight and height in 2 schools and shared a simple nutrition guide with teachers.",
        },
      ],
      awards: ["Best Community Project, School of Public Health 2025"],
      interests: ["Community service", "Reading", "Volleyball"],
      references: [
        { name: "Dr. Efua Nkrumah", role: "Lecturer, UG School of Public Health", phone: "020 000 0000" },
        { name: "Mrs. Grace Quartey", role: "Municipal Health Officer, Ga East", phone: "020 000 0000" },
      ],
    },
  },
  {
    slug: "physics",
    course: "Physics",
    icon: "flask",
    row: 0,
    role: "Physics Student",
    template: "gridLeft",
    intro: "Show your problem solving, your lab work and the programming that goes with your degree.",
    tips: [
      "Name your lab work, like optics, electronics or radiation measurements.",
      "Physicists code too. List Python, MATLAB or LaTeX if you use them.",
      "Describe one project where you solved a real measurement problem.",
    ],
    cv: {
      name: "Nana Yaw Osei",
      contact: contact("Nana Yaw Osei", "Kumasi"),
      summary:
        "Physics student at KNUST with strong maths, Python and lab skills. Analysed solar panel output for a final-year project and enjoys turning messy measurements into clear results. Looking for a research, data or teaching role.",
      experience: [
        {
          title: "Teaching Assistant",
          place: "KNUST Department of Physics",
          date: "2024 – 2025",
          bullets: [
            "Marked weekly problem sets and held tutorials for 80 first-year students.",
            "Explained mechanics and waves using simple worked examples.",
          ],
        },
        {
          title: "Science Tutor (Part-time)",
          place: "Private tutoring, Kumasi",
          date: "2023 – 2025",
          bullets: [
            "Tutored 6 senior high students in physics and core maths.",
            "Helped two students raise their mock exam grades by a full grade.",
          ],
        },
      ],
      education: [
        { degree: "BSc Physics", school: "KNUST, Kumasi", date: "2022 – 2026" },
        { degree: "WASSCE (General Science)", school: "Opoku Ware School, Kumasi", date: "2018 – 2021" },
      ],
      skills: [
        "Technical: Python, MATLAB, LaTeX, Excel, data analysis",
        "Laboratory: Optics, electronics, radiation measurement, error analysis",
        "Professional: Problem solving, teaching, report writing",
      ],
      languages: ["English (Fluent)", "Twi (Native)"],
      certifications: ["Python for Everybody, Coursera", "Radiation Safety Induction, KNUST"],
      projects: [
        {
          name: "Solar Panel Output Study",
          detail: "Measured the output of 3 panel types over 6 weeks and plotted how dust and heat reduced power.",
        },
        {
          name: "Pendulum Simulation",
          detail: "Wrote a Python program that models a damped pendulum and compared it with lab data.",
        },
      ],
      awards: ["Physics Department Prize for Best Lab Report, 2024"],
      interests: ["Astronomy", "Chess", "Teaching"],
      references: [
        { name: "Prof. Samuel Ofori", role: "Department of Physics, KNUST", phone: "020 000 0000" },
        { name: "Dr. Akua Darko", role: "Lecturer, KNUST Physics", phone: "020 000 0000" },
      ],
    },
  },
  {
    slug: "psychology",
    course: "Psychology",
    icon: "book",
    row: 1,
    role: "Psychology Student",
    template: "serifNavy",
    intro: "Show how you listen, how you research and the people you have supported.",
    tips: [
      "Say which research methods you have used, like interviews or surveys.",
      "Mention counselling or peer support work, and keep client details private.",
      "Add SPSS or other analysis tools you can use.",
    ],
    cv: {
      name: "Adwoa Kyeremeh",
      contact: contact("Adwoa Kyeremeh", "Accra"),
      summary:
        "Psychology student at the University of Ghana with peer counselling and research experience. Calm, patient listener who has run workshops on stress and study skills for students. Looking for a counselling, HR or research assistant role.",
      experience: [
        {
          title: "Peer Counsellor",
          place: "UG Counselling Centre, Legon",
          date: "2024 – 2025",
          bullets: [
            "Supported first-year students with stress and study habits through weekly one-to-one sessions.",
            "Ran 4 workshops on exam anxiety with about 50 students each.",
            "Referred students to professional counsellors when needed.",
          ],
        },
        {
          title: "Research Assistant",
          place: "UG Department of Psychology",
          date: "Jun – Aug 2025",
          bullets: [
            "Interviewed 40 students for a study on sleep and exam results.",
            "Entered and cleaned survey data in SPSS.",
          ],
        },
      ],
      education: [
        { degree: "BA Psychology", school: "University of Ghana, Legon", date: "2022 – 2026" },
        { degree: "WASSCE (General Arts)", school: "Holy Child School, Cape Coast", date: "2018 – 2021" },
      ],
      skills: [
        "Psychology: Active listening, interviewing, survey design, basic counselling skills",
        "Tools: SPSS, Excel, Word, Google Forms",
        "Professional: Empathy, confidentiality, public speaking",
      ],
      languages: ["English (Fluent)", "Twi (Native)", "Fante (Good)"],
      certifications: ["Mental Health First Aid", "Research Ethics Training, UG"],
      projects: [
        {
          name: "Sleep and Study Survey",
          detail: "Surveyed 200 students on sleep habits and exam stress and presented the findings to the department.",
        },
        {
          name: "Campus Wellness Week",
          detail: "Helped organise a week of talks and activities on mental health that reached about 600 students.",
        },
      ],
      awards: ["Outstanding Peer Counsellor, UG Counselling Centre 2025"],
      interests: ["Mental health advocacy", "Journaling", "Debate"],
      references: [
        { name: "Dr. Naana Appiah", role: "Lecturer, UG Psychology", phone: "020 000 0000" },
        { name: "Mr. Kwesi Boakye", role: "Counsellor, UG Counselling Centre", phone: "020 000 0000" },
      ],
    },
  },
  {
    slug: "english",
    course: "English",
    icon: "pen",
    row: 2,
    role: "English Student",
    template: "lavenderBand",
    intro: "Writing is your product. Show what you have written, edited or presented.",
    tips: [
      "Link to your writing: a blog, articles or a portfolio.",
      "Say where your work was published and roughly how many people read it.",
      "Mention editing, proofreading or public speaking experience.",
    ],
    cv: {
      name: "Akosua Pokua",
      contact: contact("Akosua Pokua", "Kumasi", ["akosuapokua.com/writing"]),
      summary:
        "English student at KNUST who writes for the campus magazine and a personal blog. Strong editor with a clear voice and experience in content writing and social media. Looking for a content, communications or publishing internship.",
      experience: [
        {
          title: "Features Writer",
          place: "KNUST Campus Magazine",
          date: "2023 – 2025",
          bullets: [
            "Wrote 15 feature articles on student life and campus issues.",
            "Interviewed lecturers and student leaders and edited other writers' drafts.",
            "Grew the magazine's Instagram following from 800 to 3,000 with weekly posts.",
          ],
        },
        {
          title: "Content Writing Intern",
          place: "A digital agency, Kumasi",
          date: "Jun – Aug 2025",
          bullets: [
            "Wrote blog posts and product descriptions for 5 small business clients.",
            "Proofread website copy and fixed grammar and style errors.",
          ],
        },
      ],
      education: [
        { degree: "BA English", school: "KNUST, Kumasi", date: "2022 – 2026" },
        { degree: "WASSCE (General Arts)", school: "Yaa Asantewaa Girls' SHS, Kumasi", date: "2018 – 2021" },
      ],
      skills: [
        "Writing: Feature writing, copywriting, editing, proofreading, research",
        "Tools: Canva, WordPress, Google Docs, Instagram, Grammarly",
        "Professional: Creativity, deadlines, public speaking",
      ],
      languages: ["English (Fluent)", "Twi (Native)", "French (Basic)"],
      certifications: ["Content Writing Basics, Coursera", "Creative Writing Workshop, Ghana Writers"],
      projects: [
        {
          name: "Personal Blog",
          detail: "Writes weekly essays on student life, read by about 1,200 people a month.",
        },
        {
          name: "Campus Poetry Night",
          detail: "Organised a poetry evening with 12 performers and an audience of 150.",
        },
      ],
      awards: ["Best Feature Article, KNUST Media Awards 2024"],
      interests: ["Poetry", "Reading", "Podcasts"],
      references: [
        { name: "Dr. Ama Serwaa", role: "Lecturer, KNUST English", phone: "020 000 0000" },
        { name: "Mr. Yaw Boateng", role: "Editor, KNUST Campus Magazine", phone: "020 000 0000" },
      ],
    },
  },
  {
    slug: "human-resource-management",
    course: "Human Resource Management",
    icon: "briefcase",
    row: 0,
    role: "Human Resource Management Student",
    template: "iconLine",
    intro: "Show how you work with people: recruiting, training, records and fair processes.",
    tips: [
      "Mention any recruitment, onboarding or training you helped with.",
      "Say which HR tools you know, even basic ones like Excel trackers.",
      "Show that you can keep information confidential and organised.",
    ],
    cv: {
      name: "Kofi Amponsah",
      contact: contact("Kofi Amponsah", "Accra", ["linkedin.com/in/kofiamponsah"]),
      summary:
        "Human Resource Management student at UPSA with internship experience in recruitment and staff records. Organised, fair and confidential. Looking for a graduate HR trainee or national service placement.",
      experience: [
        {
          title: "HR Intern",
          place: "A manufacturing company, Tema",
          date: "Jun – Aug 2025",
          bullets: [
            "Screened 80 applications and booked interviews for 3 open roles.",
            "Updated staff records for 120 employees and kept leave schedules accurate.",
            "Helped prepare onboarding packs for new hires.",
          ],
        },
        {
          title: "Students' Association Secretary",
          place: "UPSA Business School",
          date: "2024 – 2025",
          bullets: [
            "Kept minutes and records for a 40-member executive.",
            "Organised a career talk with 6 employers and 200 students.",
          ],
        },
      ],
      education: [
        { degree: "BSc Human Resource Management", school: "UPSA, Accra", date: "2022 – 2026" },
        { degree: "WASSCE (Business)", school: "St. Peter's Boys' SHS", date: "2018 – 2021" },
      ],
      skills: [
        "HR: Recruitment support, onboarding, staff records, interview scheduling, training coordination",
        "Tools: Excel, Word, Google Workspace, basic HRIS",
        "Professional: Confidentiality, communication, conflict resolution",
      ],
      languages: ["English (Fluent)", "Twi (Native)", "Ga (Good)"],
      certifications: ["Introduction to HR Management, Coursera", "Workplace Ethics Workshop, UPSA"],
      projects: [
        {
          name: "Staff Turnover Study",
          detail: "Interviewed 25 employees on why people leave small firms and presented recommendations to the class.",
        },
        {
          name: "Career Talk Series",
          detail: "Brought 6 HR managers to campus to speak to final-year students about getting hired.",
        },
      ],
      awards: ["Best Student Leader, UPSA Business School 2025"],
      interests: ["Mentoring", "Public speaking", "Football"],
      references: [
        { name: "Mrs. Esther Ankrah", role: "HR Manager, Tema", phone: "020 000 0000" },
        { name: "Dr. Isaac Sarpong", role: "Senior Lecturer, UPSA", phone: "020 000 0000" },
      ],
    },
  },
  {
    slug: "environmental-science",
    course: "Environmental Science",
    icon: "leaf",
    row: 1,
    role: "Environmental Science Student",
    template: "thinSplit",
    intro: "Field work, sampling and data on real places make a strong environmental CV.",
    tips: [
      "Name the sites you worked on and what you measured.",
      "Add GIS, sampling and reporting tools you can use.",
      "Mention community or conservation projects, with numbers.",
    ],
    cv: {
      name: "Esi Nyarko",
      contact: contact("Esi Nyarko", "Kumasi"),
      summary:
        "Environmental Science student at KNUST with field sampling and GIS experience. Studied water quality along a local river and led a tree planting drive. Looking for an environmental consulting or conservation internship.",
      experience: [
        {
          title: "Environmental Intern",
          place: "Environmental Protection Agency, Kumasi",
          date: "Jun – Aug 2025",
          bullets: [
            "Collected water samples from 10 sites and recorded readings for the monitoring report.",
            "Helped prepare an environmental impact summary for a small construction project.",
            "Used GIS maps to mark pollution hot spots for the field team.",
          ],
        },
        {
          title: "Environmental Club President",
          place: "KNUST Environmental Club",
          date: "2024 – 2025",
          bullets: [
            "Led a tree planting drive that planted 500 seedlings with 80 volunteers.",
            "Ran monthly clean-up days on campus.",
          ],
        },
      ],
      education: [
        { degree: "BSc Environmental Science", school: "KNUST, Kumasi", date: "2022 – 2026" },
        { degree: "WASSCE (General Science)", school: "Archbishop Porter Girls' SHS", date: "2018 – 2021" },
      ],
      skills: [
        "Environmental: Water sampling, impact assessment, waste management, report writing",
        "Tools: ArcGIS basics, QGIS, Excel, SPSS",
        "Professional: Field work, teamwork, community engagement",
      ],
      languages: ["English (Fluent)", "Twi (Native)"],
      certifications: ["GIS Basics, Coursera", "Environmental Health and Safety Induction"],
      projects: [
        {
          name: "River Water Quality Study",
          detail: "Tested a local river at 6 points over 3 months and showed where pollution rose after rain.",
        },
        {
          name: "Campus Waste Audit",
          detail: "Weighed and sorted campus waste for 2 weeks and proposed a recycling plan to the administration.",
        },
      ],
      awards: ["Best Environmental Project, KNUST Science Week 2025"],
      interests: ["Conservation", "Hiking", "Photography"],
      references: [
        { name: "Dr. Kwame Adjei", role: "Lecturer, KNUST Environmental Science", phone: "020 000 0000" },
        { name: "Ms. Abigail Tetteh", role: "Programme Officer, EPA Kumasi", phone: "020 000 0000" },
      ],
    },
  },
];

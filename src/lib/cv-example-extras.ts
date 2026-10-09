import type { CvDoc, CvEducation, CvJob } from "./cv-examples";

/**
 * Extra content that turns each short example into a full one-page CV:
 * more experience, senior high school, languages, certifications,
 * projects, awards, interests and references.
 */
export type CvExtras = {
  name?: string;
  experience?: CvJob[];
  education?: CvEducation[];
  languages?: string[];
  certifications?: string[];
  projects?: CvDoc["projects"];
  awards?: string[];
  interests?: string[];
  references?: CvDoc["references"];
};

const ref = (name: string, role: string): { name: string; role: string; phone: string } => ({
  name,
  role,
  phone: "020 000 0000",
});

export const cvExtras: Record<string, CvExtras> = {
  nursing: {
    experience: [
      {
        title: "Ward Assistant (Vacation Job)",
        place: "Manhyia District Hospital, Kumasi",
        date: "Jul – Aug 2023",
        bullets: [
          "Prepared beds and supplies for new admissions on a busy medical ward.",
          "Helped nurses keep the ward clean and organised during shift changes.",
        ],
      },
    ],
    education: [{ degree: "WASSCE (General Science)", school: "Yaa Asantewaa Girls’ SHS, Kumasi", date: "2018 – 2021" }],
    languages: ["English (Fluent)", "Twi (Native)", "French (Basic)"],
    certifications: ["Basic Life Support (BLS), Ghana Red Cross", "Infection Prevention and Control, Ghana Health Service"],
    awards: ["Best Clinical Student, Level 300 (2025)"],
    interests: ["Community health outreach", "Choir", "Reading"],
    references: [ref("Mrs. Comfort Boateng", "Nursing Officer, KATH"), ref("Dr. Akua Sarpong", "Lecturer, KNUST School of Nursing")],
  },
  "computer-science": {
    experience: [
      {
        title: "Teaching Assistant, Introduction to Programming",
        place: "Department of Computer Science, KNUST",
        date: "Jan – May 2025",
        bullets: [
          "Ran weekly Python lab sessions for 60 first-year students.",
          "Marked assignments and held office hours before exams.",
        ],
      },
    ],
    education: [{ degree: "WASSCE (General Science)", school: "Wesley Girls’ High School, Cape Coast", date: "2018 – 2021" }],
    languages: ["English (Fluent)", "Twi (Native)"],
    certifications: ["Google IT Support Certificate", "AWS Cloud Practitioner (in progress)"],
    projects: [
      { name: "Hostel Finder", detail: "Web app that helps freshers compare hostels near campus by price and distance." },
      { name: "Lecture Notes Bot", detail: "Telegram bot that sends course reminders to 300+ students." },
    ],
    awards: ["2nd place, KNUST Hackathon 2024"],
    interests: ["Women in Tech Ghana", "Chess", "UI design"],
    references: [ref("Dr. Kwame Owusu", "Senior Lecturer, KNUST"), ref("Mr. Daniel Ofori", "Engineering Lead, Hubtel")],
  },
  accounting: {
    experience: [
      {
        title: "Sales Assistant (Weekends)",
        place: "Family provisions shop, Kumasi",
        date: "2021 – 2023",
        bullets: ["Kept daily sales records and balanced the cash box at closing."],
      },
    ],
    education: [{ degree: "WASSCE (Business)", school: "Opoku Ware School, Kumasi", date: "2018 – 2021" }],
    languages: ["English (Fluent)", "Twi (Native)"],
    certifications: ["ICAG Level 1 (in progress)", "Microsoft Excel Expert"],
    awards: ["Dean’s List, 2023/2024"],
    interests: ["Personal finance", "Football", "Mentoring juniors"],
    references: [ref("Mr. Isaac Mensah", "Branch Accountant, GCB Bank"), ref("Dr. Esther Agyeman", "Lecturer, KNUST School of Business")],
  },
  midwifery: {
    experience: [
      {
        title: "Community Health Volunteer",
        place: "Abura Health Centre, Cape Coast",
        date: "2023",
        bullets: [
          "Supported antenatal clinic days and weighed babies at child welfare clinics.",
          "Shared family planning information with young mothers.",
        ],
      },
    ],
    education: [{ degree: "WASSCE (General Science)", school: "Holy Child School, Cape Coast", date: "2018 – 2021" }],
    languages: ["English (Fluent)", "Fante (Native)", "Twi (Good)"],
    certifications: ["Basic Life Support (BLS)", "Helping Babies Breathe, Ghana Health Service"],
    awards: ["Most Dedicated Student Midwife, 2025"],
    interests: ["Maternal health advocacy", "Singing", "Cooking"],
    references: [ref("Mrs. Gifty Quaye", "Senior Midwife, Cape Coast Teaching Hospital"), ref("Dr. Ama Nyarko", "Lecturer, UCC")],
  },
  "civil-engineering": {
    experience: [
      {
        title: "Site Assistant (Vacation Job)",
        place: "Local building contractor, Kumasi",
        date: "Jul – Sep 2023",
        bullets: [
          "Checked concrete mix ratios and recorded deliveries on a 2-storey building site.",
          "Helped the foreman set out foundations using lines and levels.",
        ],
      },
    ],
    education: [{ degree: "WASSCE (General Science)", school: "Prempeh College, Kumasi", date: "2017 – 2020" }],
    languages: ["English (Fluent)", "Twi (Native)"],
    certifications: ["AutoCAD Certified User", "Construction Site Safety Induction"],
    projects: [{ name: "Final-year project", detail: "Designed a reinforced concrete drainage culvert for a flood-prone Kumasi street." }],
    awards: ["Best Final-Year Design Project, 2025"],
    interests: ["Sustainable housing", "Football", "Drawing"],
    references: [ref("Ing. Samuel Asare", "Site Engineer, Ghana Highway Authority"), ref("Prof. Kofi Adjei", "KNUST Civil Engineering")],
  },
  pharmacy: {
    experience: [
      {
        title: "Pharmacy Intern",
        place: "Komfo Anokye Teaching Hospital, Kumasi",
        date: "Jun – Aug 2024",
        bullets: [
          "Supported inpatient dispensing and checked drug charts with pharmacists.",
          "Counselled outpatients on how to take their medicines safely.",
        ],
      },
    ],
    education: [{ degree: "WASSCE (General Science)", school: "Mfantsipim School, Cape Coast", date: "2017 – 2020" }],
    languages: ["English (Fluent)", "Twi (Native)", "Fante (Good)"],
    certifications: ["Good Pharmacy Practice Workshop, PSGH"],
    projects: [{ name: "Research project", detail: "Studied how patients in Kumasi store antimalarials at home." }],
    awards: ["Pharmaceutical Society Student Award, 2024"],
    interests: ["Drug safety awareness", "Basketball", "Podcasts"],
    references: [ref("Pharm. Grace Owusu", "Superintendent, Ernest Chemists"), ref("Dr. Yaw Badu", "Lecturer, KNUST Pharmacy")],
  },
  law: {
    experience: [
      {
        title: "Legal Aid Volunteer",
        place: "Legal Aid Commission, Kumasi",
        date: "2024",
        bullets: [
          "Helped interview clients and summarise their cases for lawyers.",
          "Explained basic tenancy rights to community members in Twi.",
        ],
      },
    ],
    education: [{ degree: "WASSCE (General Arts)", school: "Achimota School, Accra", date: "2018 – 2021" }],
    languages: ["English (Fluent)", "Twi (Native)", "French (Basic)"],
    certifications: ["Legal Research and Writing Workshop, KNUST Law"],
    awards: ["Semi-finalist, Faculty Moot Court 2024", "Best Oralist, Inter-Hall Debate 2023"],
    interests: ["Debate", "Human rights", "Reading biographies"],
    references: [ref("Lawyer Kwesi Arthur", "Head of Chambers, Accra"), ref("Dr. Efua Aidoo", "Lecturer, KNUST Faculty of Law")],
  },
  "national-service": {
    experience: [
      {
        title: "Industrial Attachment",
        place: "Volta River Authority, Akosombo",
        date: "Jun – Aug 2024",
        bullets: [
          "Shadowed engineers during routine checks at the switchyard.",
          "Recorded meter readings and helped prepare weekly reports.",
        ],
      },
    ],
    education: [{ degree: "WASSCE (General Science)", school: "Opoku Ware School, Kumasi", date: "2017 – 2020" }],
    languages: ["English (Fluent)", "Twi (Native)", "Ga (Good)"],
    certifications: ["Solar PV Installation Certificate", "Electrical Safety Training, ECG"],
    projects: [{ name: "Solar-Powered Irrigation System", detail: "Final-year project that cut a local farm’s manual watering time." }],
    awards: ["Vice President, Engineering Students’ Association (2023 – 2024)"],
    interests: ["Renewable energy", "Football", "Tech meetups"],
    references: [ref("Ing. Michael Tetteh", "District Engineer, ECG Kumasi"), ref("Dr. Kwabena Owusu", "KNUST Electrical Engineering")],
  },
  banking: {
    experience: [
      {
        title: "Treasurer",
        place: "UPSA Finance Club",
        date: "2024 – present",
        bullets: ["Track club dues and present a monthly spending report to members."],
      },
    ],
    education: [{ degree: "WASSCE (Business)", school: "Accra Girls’ SHS", date: "2019 – 2022" }],
    languages: ["English (Fluent)", "Twi (Good)", "Ewe (Native)"],
    certifications: ["Anti-Money Laundering Basics (online)", "Microsoft Excel Associate"],
    awards: ["UPSA Finance Club Member of the Year, 2024"],
    interests: ["Investing", "Netball", "Event planning"],
    references: [ref("Mrs. Doris Asamoah", "Branch Manager, MTN Service Centre"), ref("Mr. Felix Nkansah", "Lecturer, UPSA")],
  },
  teaching: {
    experience: [
      {
        title: "Private Mathematics Tutor",
        place: "Self-employed, Winneba",
        date: "2022 – 2024",
        bullets: [
          "Tutored 10 JHS students for BECE mathematics, with most moving up a grade.",
          "Built simple practice sheets from past questions.",
        ],
      },
    ],
    education: [{ degree: "WASSCE (General Science)", school: "Apam Senior High School", date: "2017 – 2020" }],
    languages: ["English (Fluent)", "Fante (Native)", "Twi (Good)"],
    certifications: ["NTC Licensure Exam (passed)", "Google Certified Educator Level 1"],
    awards: ["Best Student Teacher, Mathematics Department 2025"],
    interests: ["STEM clubs", "Football coaching", "Reading"],
    references: [ref("Mr. John Arthur", "Head of Maths, Winneba SHS"), ref("Dr. Abena Koomson", "Lecturer, UEW")],
  },
  "medical-laboratory-science": {
    experience: [
      {
        title: "Laboratory Volunteer",
        place: "KNUST Hospital Laboratory",
        date: "Jul – Aug 2023",
        bullets: [
          "Labelled and sorted incoming samples during busy morning clinics.",
          "Kept the reagent stock list up to date.",
        ],
      },
    ],
    education: [{ degree: "WASSCE (General Science)", school: "St. Louis SHS, Kumasi", date: "2017 – 2020" }],
    languages: ["English (Fluent)", "Twi (Native)"],
    certifications: ["Biosafety and Biosecurity Training", "Phlebotomy Workshop"],
    projects: [{ name: "Research project", detail: "Compared rapid malaria tests with microscopy at a district hospital." }],
    awards: ["Best Research Presentation, Allied Health Week 2025"],
    interests: ["Public health", "Volleyball", "Baking"],
    references: [ref("Mr. Peter Danso", "Chief Lab Scientist, Kumasi South Hospital"), ref("Dr. Linda Osei", "KNUST Medical Lab Science")],
  },
  marketing: {
    experience: [
      {
        title: "Brand Ambassador (Part-time)",
        place: "Telecom campus campaign, Legon",
        date: "2024",
        bullets: [
          "Ran pop-up stands on campus and signed up 300+ students for a data bundle offer.",
          "Collected student feedback for the brand team every week.",
        ],
      },
    ],
    education: [{ degree: "WASSCE (Business)", school: "Aburi Girls’ SHS", date: "2018 – 2021" }],
    languages: ["English (Fluent)", "Ewe (Native)", "Twi (Good)"],
    certifications: ["Google Digital Marketing Fundamentals", "Meta Social Media Marketing (in progress)"],
    projects: [{ name: "Campus Thrift Store Page", detail: "Grew an Instagram thrift page to 2,000 followers with weekly drops." }],
    awards: ["Best Marketing Plan, UGBS Business Week 2024"],
    interests: ["Content creation", "Photography", "Afrobeats"],
    references: [ref("Ms. Adjoa Frimpong", "Brand Manager"), ref("Dr. Kofi Amoah", "Lecturer, UGBS")],
  },
  economics: {
    experience: [
      {
        title: "Data Collection Assistant",
        place: "Ghana Statistical Service field survey",
        date: "2023",
        bullets: ["Interviewed households in Accra using tablets and checked forms for errors."],
      },
    ],
    education: [{ degree: "WASSCE (General Arts)", school: "Presbyterian Boys’ SHS, Legon", date: "2017 – 2020" }],
    languages: ["English (Fluent)", "Twi (Native)", "Ga (Good)"],
    certifications: ["Data Analysis with Excel (Coursera)", "Stata for Beginners"],
    projects: [{ name: "Dissertation", detail: "How mobile money changed saving habits of market traders in Accra." }],
    awards: ["Economics Department Best Dissertation, 2025"],
    interests: ["Policy debates", "Chess", "Writing"],
    references: [ref("Prof. Kwabena Asante", "Department of Economics, UG"), ref("Mr. Kojo Larbi", "Field Supervisor, GSS")],
  },
  "mechanical-engineering": {
    experience: [
      {
        title: "Workshop Assistant",
        place: "Suame Magazine, Kumasi",
        date: "Jul – Sep 2023",
        bullets: [
          "Helped mechanics rebuild engines and service gearboxes.",
          "Learned welding, lathe work and how to read part drawings.",
        ],
      },
    ],
    education: [{ degree: "WASSCE (General Science)", school: "Ghana National College, Cape Coast", date: "2017 – 2020" }],
    languages: ["English (Fluent)", "Fante (Native)", "Twi (Good)"],
    certifications: ["SolidWorks Associate (CSWA)", "Workshop Safety Training"],
    projects: [{ name: "Final-year project", detail: "Designed and built a pedal-powered maize sheller for small farms." }],
    awards: ["Best Mechanical Design, Engineering Week 2025"],
    interests: ["Motorsport", "3D printing", "Football"],
    references: [ref("Ing. Francis Ackah", "Maintenance Engineer, GPHA"), ref("Dr. Richard Opoku", "KNUST Mechanical Engineering")],
  },
  agriculture: {
    experience: [
      {
        title: "Farm Attendant (Vacation Job)",
        place: "Family farm, Savelugu",
        date: "2021 – 2023",
        bullets: ["Managed planting and harvest records for 5 acres of maize and soybean."],
      },
    ],
    education: [{ degree: "WASSCE (Agricultural Science)", school: "Tamale Senior High School", date: "2016 – 2019" }],
    languages: ["English (Fluent)", "Dagbani (Native)", "Twi (Good)", "Hausa (Basic)"],
    certifications: ["Climate-Smart Agriculture Training, MoFA", "GIS Basics (QGIS)"],
    projects: [{ name: "Dissertation", detail: "Tested drought-tolerant maize varieties on farms in the Northern Region." }],
    awards: ["UDS Best Field Practical Student, 2023"],
    interests: ["Agribusiness", "Football", "Radio farming shows"],
    references: [ref("Mr. Alhassan Yakubu", "District Agric Officer, MoFA"), ref("Dr. Fatima Mahama", "Lecturer, UDS")],
  },
  "graphic-design": {
    experience: [
      {
        title: "Design Intern",
        place: "Creative agency, Accra",
        date: "Jun – Aug 2025",
        bullets: [
          "Designed social media posts and banners for 4 client brands.",
          "Prepared print-ready files for flyers and roll-up banners.",
        ],
      },
    ],
    education: [{ degree: "WASSCE (Visual Arts)", school: "Accra Academy", date: "2018 – 2021" }],
    languages: ["English (Fluent)", "Ewe (Native)", "Twi (Good)"],
    certifications: ["Google UX Design Certificate (in progress)", "Adobe Illustrator Essentials"],
    projects: [{ name: "Kente Type", detail: "A display font inspired by kente patterns, shared free with 1,000+ downloads." }],
    awards: ["1st place, KNUST Art Week Poster Competition 2024"],
    interests: ["Typography", "Photography", "Football jerseys"],
    references: [ref("Mr. Kwame Nyantakyi", "Creative Director"), ref("Mrs. Esi Baidoo", "Lecturer, KNUST Communication Design")],
  },
  journalism: {
    experience: [
      {
        title: "Writing Intern",
        place: "Online news platform, Accra",
        date: "Jun – Aug 2025",
        bullets: [
          "Wrote short news stories and edited reader submissions daily.",
          "Covered two press conferences and a student protest.",
        ],
      },
    ],
    education: [{ degree: "WASSCE (General Arts)", school: "St. Mary’s SHS, Accra", date: "2018 – 2021" }],
    languages: ["English (Fluent)", "Ga (Native)", "Twi (Good)"],
    certifications: ["Fact-Checking Basics, Ghana Fact", "Mobile Journalism Workshop"],
    projects: [{ name: "Campus Voices Podcast", detail: "Weekly podcast with student leaders, 20 episodes so far." }],
    awards: ["Best Student Reporter, UniMAC Media Awards 2024"],
    interests: ["Investigative stories", "Spoken word", "Football"],
    references: [ref("Mr. Bernard Amoako", "News Editor"), ref("Dr. Akosua Mensah", "Lecturer, UniMAC")],
  },
  architecture: {
    experience: [
      {
        title: "Model Maker (Freelance)",
        place: "Final-year students, KNUST",
        date: "2023 – 2024",
        bullets: ["Built physical models for 8 senior students’ final juries."],
      },
    ],
    education: [{ degree: "WASSCE (Visual Arts)", school: "Mawuli School, Ho", date: "2018 – 2021" }],
    languages: ["English (Fluent)", "Ewe (Native)", "Twi (Good)"],
    certifications: ["Revit Architecture Certified User", "Lumion Rendering Course"],
    projects: [
      { name: "Market Hall, Ho", detail: "Studio design for a naturally ventilated market using local laterite." },
      { name: "Student Hostel Concept", detail: "Low-cost hostel scheme that keeps rooms cool without AC." },
    ],
    awards: ["Studio Award, Level 300 (2025)"],
    interests: ["Vernacular architecture", "Sketching", "Travel"],
    references: [ref("Arch. Nii Armah", "Principal, Accra design studio"), ref("Dr. Abena Adusei", "KNUST Architecture")],
  },
  "data-science": {
    experience: [
      {
        title: "Data Volunteer",
        place: "Code for Ghana",
        date: "2024",
        bullets: ["Cleaned public budget data and built charts for a civic report."],
      },
    ],
    education: [{ degree: "WASSCE (General Science)", school: "Accra Academy", date: "2017 – 2020" }],
    languages: ["English (Fluent)", "Fante (Native)", "Twi (Good)"],
    certifications: ["Google Data Analytics Certificate", "Microsoft Power BI Data Analyst (PL-300)"],
    projects: [
      { name: "Accra Trotro Delays", detail: "Analysed commuter survey data to map the slowest routes in Accra." },
      { name: "Malaria Cases Dashboard", detail: "Power BI dashboard of district malaria data for a health NGO." },
    ],
    awards: ["Top 10, Zindi Africa data challenge 2024"],
    interests: ["Machine learning", "Football analytics", "Blogging"],
    references: [ref("Mr. Ebo Quansah", "Head of Data, fintech startup"), ref("Dr. Yaa Owusu", "Statistics Department, UG")],
  },
  "business-administration": {
    name: "Afia Boakye",
    experience: [
      {
        title: "Events Committee Member",
        place: "KNUST SRC",
        date: "2023 – 2024",
        bullets: ["Helped plan SRC Week events for 3,000+ students and managed vendor bookings."],
      },
    ],
    education: [{ degree: "WASSCE (Business)", school: "St. Louis SHS, Kumasi", date: "2018 – 2021" }],
    languages: ["English (Fluent)", "Twi (Native)", "French (Basic)"],
    certifications: ["Project Management Basics (Coursera)", "Customer Service Excellence Workshop"],
    projects: [{ name: "Campus Laundry Startup", detail: "Ran a small laundry pick-up service for 40 hostel students." }],
    awards: ["Best Business Plan, KNUST Entrepreneurship Week 2024"],
    interests: ["Entrepreneurship", "Netball", "Event planning"],
    references: [ref("Mr. Kofi Darkwa", "Branch Manager, Melcom Kumasi"), ref("Dr. Adwoa Asante", "KNUST School of Business")],
  },
};

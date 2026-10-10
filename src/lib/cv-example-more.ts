import type { CvDoc } from "./cv-examples";

/**
 * Extra projects and bullet points so each CV fills its page.
 * `bullets[i]` is appended to the i-th base experience entry.
 */
export const cvMore: Record<string, { projects?: CvDoc["projects"]; bullets?: Record<number, string[]> }> = {
  nursing: {
    projects: [
      { name: "Hand Hygiene Audit", detail: "Observed 120 hand-washing moments on two wards and presented ways to raise compliance to the ward team." },
      { name: "Health Talk Series", detail: "Prepared and delivered short talks on hypertension and diabetes for outpatients in English and Twi." },
    ],
    bullets: {
      0: ["Assisted with wound dressing and catheter care under supervision.", "Handed over patient updates clearly at each shift change."],
      1: ["Supported free blood pressure screening at monthly community health walks.", "Kept attendance and referral records for every outreach session."],
    },
  },
  "computer-science": {
    projects: [{ name: "Exam Timetable Clash Checker", detail: "Python tool that flags clashing exam slots for course reps before timetables are published." }],
  },
  accounting: {
    projects: [
      { name: "Club Budget Tracker", detail: "Excel workbook with monthly summaries that made the club’s spending easy for members to follow." },
      { name: "Final-year research", detail: "Studied how small shops in Kumasi keep records and how that affects access to loans." },
    ],
    bullets: { 0: ["Matched bank statements against ledgers and flagged differences to the branch accountant."] },
  },
  midwifery: {
    projects: [
      { name: "Antenatal Education Cards", detail: "Designed simple picture cards on danger signs in pregnancy for mothers attending clinic." },
      { name: "Research project", detail: "Looked at why some mothers in Cape Coast start antenatal care late and what helps them come earlier." },
    ],
    bullets: {
      0: [
        "Monitored labour progress with the partograph and reported changes to the midwife in charge.",
        "Supported breastfeeding and newborn care in the first hours after birth.",
      ],
    },
  },
  "civil-engineering": {
    projects: [
      { name: "Road Survey Report", detail: "Surveyed a 1.2 km campus road and proposed a cheaper resurfacing plan with drainage fixes." },
      { name: "Concrete Mix Testing", detail: "Tested cube strengths for three mix designs using local sand and compared them to the standard." },
    ],
    bullets: { 0: ["Took levels and recorded site measurements with the surveying team.", "Wrote short daily site diaries for the supervising engineer."] },
  },
  pharmacy: {
    projects: [{ name: "Medicine Safety Leaflet", detail: "Wrote a plain-language leaflet on safe antibiotic use, shared with 300 students during health week." }],
  },
  law: {
    projects: [
      { name: "Moot Court Memorial", detail: "Co-wrote a 25-page memorial on freedom of expression, praised by judges for its clear structure." },
      { name: "Campus Legal Rights Guide", detail: "Wrote a short guide to tenancy rights for students renting hostels off campus." },
    ],
    bullets: { 0: ["Prepared case summaries and timelines ahead of client meetings."] },
  },
  "national-service": {
    projects: [{ name: "Fault Report Tracker", detail: "Built a simple spreadsheet that helped the district team see repeat faults by area." }],
  },
  banking: {
    projects: [
      { name: "Student Savings Survey", detail: "Surveyed 150 UPSA students on how they save and presented the results at a Finance Club meeting." },
      { name: "Mobile Money Fees Comparison", detail: "Compared transfer fees across networks and shared a one-page guide with classmates." },
    ],
    bullets: {
      0: ["Explained bundle and MoMo options clearly to first-time customers.", "Escalated unusual transactions to the supervisor promptly."],
      1: ["Organised a savings and investment talk with a guest from a local bank."],
    },
  },
  teaching: {
    projects: [
      { name: "Maths Games Kit", detail: "Built low-cost classroom games from cardboard that made fractions easier for JHS learners." },
      { name: "Action research", detail: "Tested group work in a Form 2 class and recorded how it improved test scores over a term." },
    ],
    bullets: {
      0: [
        "Set and marked class tests, and gave each student written feedback.",
        "Worked with the head of department to prepare students for mock exams.",
      ],
    },
  },
  "medical-laboratory-science": {
    projects: [{ name: "Lab Safety Checklist", detail: "Drafted a one-page daily safety checklist adopted by the student lab." }],
  },
  marketing: {
    projects: [
      { name: "Hall Week Campaign", detail: "Planned a 2-week social campaign with a budget of GH₵ 1,500 that sold out all event tickets." },
      { name: "Small Business Rebrand", detail: "Helped a Legon food vendor refresh her menu, logo and WhatsApp catalogue, doubling weekly orders in a month." },
      { name: "Student Survey on Ads", detail: "Surveyed 120 students on which social ads they trust and shared the findings with the Marketing Club." },
    ],
    bullets: {
      0: [
        "Wrote captions and scripts for weekly reels, keeping a consistent voice across Instagram and TikTok.",
        "Tracked reach and engagement each week and shared simple reports with the committee.",
      ],
    },
  },
  economics: {
    projects: [
      { name: "Inflation Explainer", detail: "Wrote a short, simple explainer on inflation for first-year students, read by 2,000+ people online." },
      { name: "Market Price Tracker", detail: "Collected weekly food prices at Makola for 3 months and charted the changes in Excel." },
    ],
    bullets: { 0: ["Prepared clean tables and charts for the research team’s report."] },
  },
  "mechanical-engineering": {
    projects: [{ name: "Solar Dryer for Cocoa", detail: "Built a small solar dryer prototype that cut cocoa drying time in field tests." }],
  },
  agriculture: {
    projects: [
      { name: "Farmer SMS Tips", detail: "Sent weekly planting and weather tips by SMS to 60 farmers during the rainy season." },
      { name: "Compost Trial", detail: "Compared compost and fertiliser on maize plots and shared the results with local farmers." },
    ],
    bullets: { 0: ["Visited farms each week to check crops and answer farmers’ questions."] },
  },
  "graphic-design": {
    projects: [
      { name: "Campus Event Posters", detail: "Designed a consistent poster series for 6 SRC events in one semester." },
      { name: "Chop Bar Menu Redesign", detail: "Redesigned a local restaurant’s menu and signage, making prices clearer and the brand easier to recognise." },
      { name: "Mobile App UI Concept", detail: "Designed screens in Figma for a campus bus-tracking app and tested them with 10 students." },
    ],
    bullets: {
      0: [
        "Presented 2 to 3 design options per brief and refined them based on client feedback.",
        "Prepared print-ready files and worked with Accra printers to keep colours accurate.",
      ],
    },
  },
  journalism: {
    projects: [
      { name: "Hostel Prices Report", detail: "Investigated rising hostel fees near campus, interviewing 20 students and 5 landlords." },
      { name: "Campus Elections Coverage", detail: "Led live coverage of SRC elections across radio and social media." },
    ],
    bullets: { 0: ["Edited audio clips and wrote scripts for the weekly bulletin."] },
  },
  architecture: {
    projects: [
      { name: "Community Library", detail: "Concept design for a shaded, low-cost library built with local materials in Ho." },
      { name: "Bamboo Bus Shelter", detail: "Designed and built a 1:10 model of a low-cost bus shelter for KNUST campus routes." },
    ],
    bullets: { 0: ["Helped prepare cost estimates and material lists for each project."] },
  },
  "data-science": {
    projects: [{ name: "Student Spending Dashboard", detail: "Power BI dashboard showing how 200 students spend their monthly allowance." }],
  },
  "business-administration": {
    projects: [
      { name: "Vendor Price Comparison", detail: "Compared prices from 8 event vendors and saved the club about 15% on hall week costs." },
    ],
    bullets: { 0: ["Helped set up weekend promotions and tracked their effect on sales."] },
  },
};

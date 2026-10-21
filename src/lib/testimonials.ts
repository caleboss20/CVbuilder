export type Testimonial = {
  name: string;
  course: string;
  school: string;
  /** A short headline above the quote, drawn from what the student said. */
  title: string;
  quote: string;
  photo: string;
  /**
   * true while we are still waiting for the student's real details and quote.
   * Drafts only render in development, never on the live site.
   */
  draft?: boolean;
};

/**
 * Real student reviews, shared with their permission.
 * To add one: crop a square photo into public/images/testimonials/ and add an entry.
 */
export const testimonials: Testimonial[] = [
  // Confirmed with each student by the site owner. To add a new one, give it the person's real
  // words, name, course and school. Mark an entry `draft: true` to keep it off the live site.
  {
    name: "Frank Agyare",
    course: "BSc Computer Science",
    school: "KNUST",
    title: "From rough notes to a sent application in one night",
    quote:
      "I had projects but no idea how to put them on paper. The AI turned my rough notes into proper bullet points and I sent my CV for an internship the same night.",
    photo: "/images/testimonials/student-a.webp",
    // Hidden for now: the quote credits the AI, which students cannot use yet. Re-confirm the wording with
    // Frank (or remove `draft` when AI opens to everyone) before showing it again.
    draft: true,
  },
  {
    name: "Wilhelmina Adjah",
    course: "BSc Business Administration",
    school: "KNUST",
    title: "A professional CV in about ten minutes",
    quote:
      "My old CV was a messy Word file. With CV11 I picked a clean template, filled in my details and had a PDF ready in about ten minutes. It finally looks professional.",
    photo: "/images/testimonials/student-b.webp",
  },
  {
    name: "Michaela Asante",
    course: "BSc Nursing",
    school: "UCC",
    title: "My ward experience finally stands out",
    quote:
      "I needed a CV for my rotation placement and had nothing on it but school. The nursing example showed me what to include, and now my ward experience actually stands out.",
    photo: "/images/testimonials/student-c.webp",
  },
];

/** Universities in the "Made for students at" strip. Only schools we have a logo for. */
export const universities: { name: string; logo: string }[] = [
  { name: "KNUST", logo: "/images/universities/knust.webp" },
  { name: "University of Ghana", logo: "/images/universities/ug.webp" },
  { name: "UCC", logo: "/images/universities/ucc.webp" },
  { name: "UHAS", logo: "/images/universities/uhas.webp" },
  { name: "UEW", logo: "/images/universities/uew.webp" },
  { name: "UPSA", logo: "/images/universities/upsa.webp" },
  { name: "Ashesi", logo: "/images/universities/ashesi.webp" },
  { name: "GCTU", logo: "/images/universities/gctu.webp" },
  { name: "UMaT", logo: "/images/universities/umat.webp" },
  { name: "UENR", logo: "/images/universities/uenr.webp" },
  { name: "Central University", logo: "/images/universities/central.webp" },
];

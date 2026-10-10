export type Testimonial = {
  name: string;
  course: string;
  school: string;
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
  // SAMPLE quotes so the layout can be reviewed. Replace each with the person’s own
  // words (and their real name, course and school), then remove `draft: true`.
  {
    name: "Frank Agyare",
    course: "BSc Computer Science",
    school: "KNUST",
    quote:
      "I had projects but no idea how to put them on paper. The AI turned my rough notes into proper bullet points and I sent my CV for an internship the same night.",
    photo: "/images/testimonials/student-a.webp",
    draft: true,
  },
  {
    name: "Wilhelmina Adjah",
    course: "BSc Business Administration",
    school: "KNUST",
    quote:
      "My old CV was a messy Word file. With CV11 I picked a clean template, filled in my details and had a PDF ready in about ten minutes. It finally looks professional.",
    photo: "/images/testimonials/student-b.webp",
    draft: true,
  },
  {
    name: "Michaela Asante",
    course: "BSc Nursing",
    school: "UCC",
    quote:
      "I needed a CV for my rotation placement and had nothing on it but school. The nursing example showed me what to include, and now my ward experience actually stands out.",
    photo: "/images/testimonials/student-c.webp",
    draft: true,
  },
];

/** Universities shown in the "Made for students at" strip (names only, no logos). */
export const universities = [
  "KNUST",
  "University of Ghana",
  "UCC",
  "UHAS",
  "UEW",
  "UPSA",
  "UDS",
  "Ashesi",
  "GCTU",
  "UMaT",
  "UENR",
  "Central University",
];

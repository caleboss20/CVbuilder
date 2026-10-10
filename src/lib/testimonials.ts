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

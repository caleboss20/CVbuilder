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
  {
    name: "Student name",
    course: "Course",
    school: "University",
    quote: "Waiting for this student’s real review. Replace this text with their own words.",
    photo: "/images/testimonials/student-a.webp",
    draft: true,
  },
  {
    name: "Student name",
    course: "Course",
    school: "University",
    quote: "Waiting for this student’s real review. Replace this text with their own words.",
    photo: "/images/testimonials/student-b.webp",
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

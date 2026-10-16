export const siteConfig = {
  name: "CV11",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://cv11.com",
  title: "Free CV Builder for Students & Graduates | CV11",
  description:
    "Create a professional, ATS-friendly CV in minutes. CV11 is the free CV builder for students and graduates, with modern templates, AI writing help and instant PDF downloads.",
  keywords: [
    "CV builder",
    "free CV maker",
    "student CV",
    "CV for students",
    "graduate CV",
    "internship CV",
    "resume builder",
    "ATS-friendly CV",
    "CV templates",
  ],
  /**
   * WhatsApp support number, digits only, with the country code (Ghana: 233, then the
   * number without its leading 0). It is a public support line, so it lives here; set
   * NEXT_PUBLIC_WHATSAPP in the environment to use a different one. If it is ever empty,
   * no WhatsApp button or link is shown anywhere.
   */
  whatsapp: (process.env.NEXT_PUBLIC_WHATSAPP ?? "233256599734").replace(/\D/g, ""),
  nav: [
    { label: "Templates", href: "/templates" },
    { label: "CV examples", href: "/cv-examples" },
    { label: "CV checker", href: "/cv-checker" },
    { label: "Letters", href: "/letters" },
    { label: "Guides", href: "/blog" },
  ],
} as const;

/** What a student can share, each with its own friendly message. */
export type ShareKind = "cv" | "letter" | "sign";

const SHARE_MESSAGES: Record<ShareKind, string> = {
  cv: "I just made my CV for free on CV11, a CV builder for students in Ghana.",
  letter: "I just wrote my application letter on CV11. It is free for students in Ghana.",
  sign: "I signed my letter as a PDF on CV11, no printing or scanning. It is free.",
};

/**
 * A WhatsApp link that lets the student pick who to send it to. The ?ref=whatsapp on the address
 * lets analytics count how many new visitors arrive from shared links.
 */
export function whatsappShareLink(kind: ShareKind): string {
  return `https://wa.me/?text=${encodeURIComponent(`${SHARE_MESSAGES[kind]} ${siteConfig.url}/?ref=whatsapp`)}`;
}

/** A wa.me chat link with a first message filled in, or null when no number is configured. */
export function whatsappLink(message = "Hi CV11, I need help with my CV."): string | null {
  return siteConfig.whatsapp ? `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(message)}` : null;
}

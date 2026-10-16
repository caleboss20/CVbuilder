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
    { label: "Home", href: "/" },
    { label: "Features", href: "/#features" },
    { label: "Templates", href: "/templates" },
    { label: "CV examples", href: "/cv-examples" },
    { label: "CV checker", href: "/cv-checker" },
    { label: "How it works", href: "/#how-it-works" },
    { label: "FAQ", href: "/#faq" },
  ],
} as const;

/** A wa.me chat link with a first message filled in, or null when no number is configured. */
export function whatsappLink(message = "Hi CV11, I need help with my CV."): string | null {
  return siteConfig.whatsapp ? `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(message)}` : null;
}

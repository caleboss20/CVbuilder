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
  nav: [
    { label: "Home", href: "/" },
    { label: "Features", href: "/#features" },
    { label: "Templates", href: "/templates" },
    { label: "Pricing", href: "/pricing" },
    { label: "How it works", href: "/#how-it-works" },
    { label: "FAQ", href: "/#faq" },
  ],
} as const;

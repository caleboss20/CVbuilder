export const siteConfig = {
  name: "CV11",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://cv11.com",
  title: "Free CV Builder for Students & Graduates | CV11",
  description:
    "Create a professional, ATS-friendly CV in minutes. CV11 is the free CV builder for students and graduates, with modern templates, a writing coach, a CV checker and instant PDF downloads.",
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
  /**
   * Paying to download a CV. `enabled` follows NEXT_PUBLIC_PAYMENTS_ENABLED, so every "free" claim on
   * the site can switch to the honest wording the moment payments go live. `price` and `days` are
   * only what students read; the price actually charged lives in the database (supabase/payments.sql).
   */
  download: {
    enabled: process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === "true",
    price: "GH₵ 7",
    /** The price as a number, for sums such as the affiliate earnings calculator. */
    priceCedis: 7,
    days: 30,
  },
  /**
   * The bulk certificate maker. `freeBatch` is how many certificates one free batch may hold: change
   * the number here (or set NEXT_PUBLIC_FREE_CERTIFICATES) and the tool, the homepage and the
   * messages all follow. `maxBatch` is the most any batch may hold at all.
   */
  certificates: {
    freeBatch: Number(process.env.NEXT_PUBLIC_FREE_CERTIFICATES) || 15,
    maxBatch: 500,
    /** Bigger batches, shown in the "too many names" notice. The organiser is unlocked by hand for now (a row in cert_grants). */
    bigger: [
      { upTo: 50, price: "GH₵ 20" },
      { upTo: 200, price: "GH₵ 50" },
      { upTo: 500, price: "GH₵ 100" },
    ],
  },
  /**
   * The affiliate program at /affiliates. `commissionPercent` is the share of each confirmed
   * payment made with their code that an affiliate earns (the percentage actually recorded is
   * pay_settings.partner_commission_percent in the database, keep the two equal). `holdDays` matches pay_settings.partner_hold_days.
   */
  affiliates: {
    commission: "25%",
    commissionPercent: 25,
    holdDays: 14,
    minPayout: "GH₵ 10",
    /** How many founding affiliates the program starts with (shown on the affiliate page). */
    spots: 10,
    payoutDay: "the 1st of every month",
  },
  /** CV versions (the same CV in several looks, one for each company). `max` is the most one CV may have. */
  cvVersions: {
    max: 10,
  },
  nav: [
    { label: "Templates", href: "/templates" },
    { label: "CV examples", href: "/cv-examples" },
    { label: "CV checker", href: "/cv-checker" },
    { label: "Letters", href: "/letters" },
    { label: "Certificates", href: "/certificates" },
    { label: "Guides", href: "/blog" },
    { label: "Pricing", href: "/pricing" },
  ],
} as const;

/** What a student can share, each with its own friendly message. */
export type ShareKind = "cv" | "letter" | "sign";

const SHARE_MESSAGES: Record<ShareKind, string> = {
  cv: "I just made my CV on CV11, a CV builder for students in Ghana.",
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

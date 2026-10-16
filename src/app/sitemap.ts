import type { MetadataRoute } from "next";
import { cvExamples } from "@/lib/cv-examples";
import { guides } from "@/lib/guides";
import { siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteConfig.url, changeFrequency: "weekly", priority: 1 },
    { url: `${siteConfig.url}/templates`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteConfig.url}/cv-examples`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteConfig.url}/cv-checker`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteConfig.url}/tracker`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteConfig.url}/blog`, changeFrequency: "monthly", priority: 0.7 },
    ...guides.map((g) => ({ url: `${siteConfig.url}/blog/${g.slug}`, changeFrequency: "monthly" as const, priority: 0.7 })),
    { url: `${siteConfig.url}/about`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${siteConfig.url}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteConfig.url}/terms`, changeFrequency: "yearly", priority: 0.3 },
    ...cvExamples.map((e) => ({
      url: `${siteConfig.url}/cv-examples/${e.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}

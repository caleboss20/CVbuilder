import type { MetadataRoute } from "next";
import { cvExamples } from "@/lib/cv-examples";
import { siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteConfig.url, changeFrequency: "weekly", priority: 1 },
    { url: `${siteConfig.url}/cv-examples`, changeFrequency: "weekly", priority: 0.9 },
    ...cvExamples.map((e) => ({
      url: `${siteConfig.url}/cv-examples/${e.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}

import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/tools/merge`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/tools/split`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/tools/compress`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/tools/convert`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/tools/rotate`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/tools/watermark`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/tools/remove-pages`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}

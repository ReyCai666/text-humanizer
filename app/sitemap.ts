import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://text-humanizer-theta.vercel.app";
  const now = new Date();

  return [
    { url: baseUrl, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/humanize-ai`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/ai-detector`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/bypass-ai-detection`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/ai-to-human-text`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/chatgpt-detector`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
  ];
}

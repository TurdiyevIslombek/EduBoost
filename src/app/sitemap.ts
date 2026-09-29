import type { MetadataRoute } from "next";

// Only the landing page is submitted to search engines. Other pages stay
// reachable and crawlable, they are just not listed here.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://www.eduboostonline.com",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}

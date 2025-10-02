import type { MetadataRoute } from "next";

function getBaseUrl() {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);
  const url = envUrl ?? "http://localhost:3000";
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getBaseUrl();
  const now = new Date();

  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/home`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/feed/trending`, lastModified: now, changeFrequency: "hourly", priority: 0.7 },
    { url: `${base}/feed/subscribed`, lastModified: now, changeFrequency: "daily", priority: 0.6 },
    { url: `${base}/playlists`, lastModified: now, changeFrequency: "daily", priority: 0.6 },
    { url: `${base}/search`, lastModified: now, changeFrequency: "daily", priority: 0.5 },
  ];
}

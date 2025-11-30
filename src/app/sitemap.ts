import { db } from "@/db";
import { videos } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { MetadataRoute } from "next";

const BASE_URL = "https://www.eduboostonline.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const publicVideos = await db
    .select({ id: videos.id, updatedAt: videos.updatedAt })
    .from(videos)
    .where(eq(videos.visibility, "public"));

  const videoUrls = publicVideos.map((video) => ({
    url: `${BASE_URL}/videos/${video.id}`,
    lastModified: video.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/home`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...videoUrls,
  ];
}

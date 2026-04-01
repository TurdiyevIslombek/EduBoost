import { db } from "@/db";
import { users, videos } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import type { MetadataRoute } from "next";

const BASE_URL = "https://www.eduboostonline.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const publicVideos = await db
    .select({ id: videos.id, updatedAt: videos.updatedAt, userId: videos.userId })
    .from(videos)
    .where(eq(videos.visibility, "public"));

  const videoUrls = publicVideos.map((video) => ({
    url: `${BASE_URL}/videos/${video.id}`,
    lastModified: video.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Get unique creator user IDs from public videos
  const creatorIds = [...new Set(publicVideos.map((v) => v.userId))];
  const creators = creatorIds.length > 0
    ? await db
        .select({ id: users.id, updatedAt: users.updatedAt })
        .from(users)
        .where(inArray(users.id, creatorIds))
    : [];

  const userUrls = creators.map((user) => ({
    url: `${BASE_URL}/users/${user.id}`,
    lastModified: user.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/feed/trending`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    ...videoUrls,
    ...userUrls,
  ];
}

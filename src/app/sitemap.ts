import { db } from "@/db";
import { users, videos } from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import type { MetadataRoute } from "next";

const BASE_URL = "https://www.eduboostonline.com";
const SITEMAP_URL_LIMIT = 50000;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Never let a DB error take the sitemap down — Google treats a 5xx sitemap
  // as "Couldn't fetch" and may slow down crawling of the whole site.
  let videoUrls: MetadataRoute.Sitemap = [];
  let userUrls: MetadataRoute.Sitemap = [];

  try {
    const publicVideos = await db
      .select({ id: videos.id, updatedAt: videos.updatedAt, userId: videos.userId })
      .from(videos)
      .where(and(eq(videos.visibility, "public"), eq(videos.muxStatus, "ready")));

    videoUrls = publicVideos.map((video) => ({
      url: `${BASE_URL}/videos/${video.id}`,
      lastModified: video.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    const creatorIds = [...new Set(publicVideos.map((v) => v.userId))];
    const creators = creatorIds.length > 0
      ? await db
          .select({ id: users.id, updatedAt: users.updatedAt })
          .from(users)
          .where(inArray(users.id, creatorIds))
      : [];

    userUrls = creators.map((user) => ({
      url: `${BASE_URL}/users/${user.id}`,
      lastModified: user.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch {
    // Fall through with static URLs only.
  }

  const staticUrls: MetadataRoute.Sitemap = [
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
  ];

  return [...staticUrls, ...videoUrls, ...userUrls].slice(0, SITEMAP_URL_LIMIT);
}

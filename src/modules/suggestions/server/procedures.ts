import { z } from "zod";
import { db } from "@/db";
import { users, videoReactions, videos, videoViews } from "@/db/schema";
import { createTRPCRouter, baseProcedure } from "@/trpc/init";
import { eq, and, or, lt, desc, getTableColumns, not } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const suggestionsRouter = createTRPCRouter({


  getMany: baseProcedure
  .input(
    z.object({
      videoId: z.string().uuid(),
      cursor: z.object({
        id: z.string().uuid(),
        updatedAt: z.date(),
      })
      .nullish(),
      limit: z.number().min(1).max(100),
    })
  )
  .query(async ({ input}) => {
    const {videoId, cursor, limit} = input;

    const [existingVideo] = await db 
      .select()
      .from(videos)
      .where(eq(videos.id, videoId))

    if (!existingVideo) {
      throw new TRPCError({code: "NOT_FOUND"})
    }

    const data = await db
      .select({
        ...getTableColumns(videos),
        user: users,
        viewCount: db.$count(videoViews, eq(videoViews.videoId, videos.id)),
        viewCountAdded: videos.viewCountOverride,
        likeCount: db.$count(videoReactions, and(
          eq(videoReactions.videoId, videos.id),
          eq(videoReactions.type, "like"),
        )),
        likeCountAdded: videos.likeCountOverride,
        dislikeCount: db.$count(videoReactions, and(
          eq(videoReactions.videoId, videos.id),
          eq(videoReactions.type, "dislike"),
        )),

      })
      .from(videos)
      .innerJoin(users, eq(videos.userId, users.id))
      .where(and(
        not(eq(videos.id, videoId)),
        eq(videos.visibility, "public"),
        existingVideo.categoryId 
        ? eq(videos.categoryId, existingVideo.categoryId)
        : undefined,
        
        cursor
          ? or(
              and(
                lt(videos.updatedAt, cursor.updatedAt),
                eq(videos.id, cursor.id)
              ),
              lt(videos.updatedAt, cursor.updatedAt)
            )
          : undefined
      )).orderBy(
        desc(videos.updatedAt),
        desc(videos.id)
      ).limit(limit + 1);
    const hasMore = data.length > limit;  

    const items = hasMore ? data.slice(0, -1) : data;

    // Apply DB overrides to totals to match other feeds
    items.forEach((v) => {
      (v as unknown as { viewCount: number }).viewCount = (v as unknown as { viewCount: number }).viewCount + (v as unknown as { viewCountAdded: number }).viewCountAdded;
      (v as unknown as { likeCount: number }).likeCount = (v as unknown as { likeCount: number }).likeCount + (v as unknown as { likeCountAdded: number }).likeCountAdded;
    });

    const lastItem = items[items.length - 1];
    const nextCursor = hasMore ?
    {
      id: lastItem.id,
      updatedAt: lastItem.updatedAt,
    }
    : null;
    return { items, nextCursor };
  }),
});
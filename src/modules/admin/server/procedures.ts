import { createTRPCRouter, baseProcedure, protectedProcedure } from "@/trpc/init";
import { db } from "@/db";
import { videos, users, categories, videoViews, videoReactions, subscriptions, scheduledMetrics } from "@/db/schema";
import { count, desc, eq, sql, gte, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { clerkClient } from "@clerk/nextjs/server";
import { z } from "zod";
import { mux } from "@/lib/mux";
import { UTApi } from "uploadthing/server";
import { redis } from "@/lib/redis";

const requireAdmin = protectedProcedure.use(async ({ ctx, next }) => {
  const clerk = await clerkClient();
  const clerkUser = await clerk.users.getUser(ctx.user.clerkId);
  const userEmail = clerkUser.emailAddresses?.[0]?.emailAddress?.toLowerCase();
  const adminEmails = process.env.ADMIN_EMAILS;
  if (!adminEmails) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "ADMIN_EMAILS environment variable is not configured",
    });
  }
  const allowed = adminEmails
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (!userEmail || !allowed.includes(userEmail)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }

  return next({
    ctx: {
      ...ctx,
      isAdmin: true,
    },
  });
});

import { processScheduledMetrics } from "@/lib/metrics-scheduler";
import { workflow } from "@/lib/workflow";

export const adminRouter = createTRPCRouter({
  triggerScheduler: requireAdmin.mutation(async () => {
    try {
      const result = await processScheduledMetrics();
      return {
        success: true,
        processed: result.processed,
        message: `Processed ${result.processed} schedules. Added ${result.viewsAdded} views and ${result.likesAdded} likes.`
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to run scheduler: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }),

  getStats: requireAdmin.query(async () => {
    try {
      const [
        totalVideos,
        totalUsers,
        totalCategories,
        totalViews,
        publicVideos,
        recentUsers,
      ] = await Promise.all([
        db.select({ count: count() }).from(videos),
        db.select({ count: count() }).from(users),
        db.select({ count: count() }).from(categories),
        db.select({ count: count() }).from(videoViews),
        db.select({ count: count() }).from(videos).where(eq(videos.visibility, "public")),
        db.select({ count: count() }).from(users).where(
          gte(users.createdAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        ),
      ]);

      return {
        totalVideos: totalVideos[0]?.count || 0,
        totalUsers: totalUsers[0]?.count || 0,
        totalCategories: totalCategories[0]?.count || 0,
        totalViews: totalViews[0]?.count || 0,
        publicVideos: publicVideos[0]?.count || 0,
        recentUsers: recentUsers[0]?.count || 0,
      };
    } catch {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get stats",
      });
    }
  }),

  getRecentVideos: requireAdmin.query(async () => {
    return await db
      .select({
        id: videos.id,
        title: videos.title,
        thumbnailUrl: videos.thumbnailUrl,
        visibility: videos.visibility,
        createdAt: videos.createdAt,
        user: {
          name: users.name,
          imageUrl: users.imageUrl,
        },
      })
      .from(videos)
      .leftJoin(users, eq(videos.userId, users.id))
      .orderBy(desc(videos.createdAt))
      .limit(10);
  }),

  getRecentUsers: requireAdmin.query(async () => {
    return await db
      .select({
        id: users.id,
        name: users.name,
        imageUrl: users.imageUrl,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(10);
  }),

  getAllVideos: requireAdmin.query(async () => {
    try {
      const videosWithCounts = await db
        .select({
          id: videos.id,
          title: videos.title,
          description: videos.description,
          thumbnailUrl: videos.thumbnailUrl,
          visibility: videos.visibility,
          duration: videos.duration,
          createdAt: videos.createdAt,
          user: {
            name: users.name,
            imageUrl: users.imageUrl,
          },
          category: {
            id: categories.id,
            name: categories.name,
          },
          viewCountReal: count(videoViews.videoId),
          likeCountReal: count(sql`CASE WHEN ${videoReactions.type} = 'like' THEN 1 END`),
          viewCountAdded: videos.viewCountOverride,
          likeCountAdded: videos.likeCountOverride,
        })
        .from(videos)
        .leftJoin(users, eq(videos.userId, users.id))
        .leftJoin(categories, eq(videos.categoryId, categories.id))
        .leftJoin(videoViews, eq(videos.id, videoViews.videoId))
        .leftJoin(videoReactions, eq(videos.id, videoReactions.videoId))
        .groupBy(
          videos.id,
          videos.title,
          videos.description,
          videos.thumbnailUrl,
          videos.visibility,
          videos.duration,
          videos.createdAt,
          users.name,
          users.imageUrl,
          categories.id,
          categories.name,
          videos.viewCountOverride,
          videos.likeCountOverride
        )
        .orderBy(videos.createdAt);

      return videosWithCounts;
    } catch {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get videos",
      });
    }
  }),

  getVideoStats: requireAdmin.query(async () => {
    try {
      const [totalVideos, publicVideos, totalViews, thisMonth] = await Promise.all([
        db.select({ count: count() }).from(videos),
        db.select({ count: count() }).from(videos).where(eq(videos.visibility, "public")),
        db.select({ count: count() }).from(videoViews),
        db.select({ count: count() }).from(videos).where(
          gte(videos.createdAt, new Date(new Date().getFullYear(), new Date().getMonth(), 1))
        ),
      ]);

      return {
        totalVideos: totalVideos[0]?.count || 0,
        publicVideos: publicVideos[0]?.count || 0,
        totalViews: totalViews[0]?.count || 0,
        thisMonth: thisMonth[0]?.count || 0,
      };
    } catch {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get video stats",
      });
    }
  }),

  getAllUsers: requireAdmin.query(async () => {
    try {
      const usersWithCounts = await db
        .select({
          id: users.id,
          clerkId: users.clerkId,
          name: users.name,
          imageUrl: users.imageUrl,
          createdAt: users.createdAt,
          lastSeenAt: users.lastSeenAt,
          videoCount: count(videos.id),
          subscriberCountReal: count(subscriptions.creatorId),
          subscriberCountAdded: users.subscriberCountOverride,
        })
        .from(users)
        .leftJoin(videos, eq(users.id, videos.userId))
        .leftJoin(subscriptions, eq(users.id, subscriptions.creatorId))
        .groupBy(users.id, users.clerkId, users.name, users.imageUrl, users.createdAt, users.subscriberCountOverride, users.lastSeenAt)
        .orderBy(desc(users.createdAt));

      return usersWithCounts;
    } catch {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get users",
      });
    }
  }),

  getUserStats: requireAdmin.query(async () => {
    try {
      const [
        totalUsers,
        newThisWeek,
        contentCreators,
      ] = await Promise.all([
        db.select({ count: count() }).from(users),
        db.select({ count: count() }).from(users).where(
          gte(users.createdAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        ),
        db.select({ count: count() }).from(users)
          .leftJoin(videos, eq(users.id, videos.userId))
          .where(sql`${videos.id} IS NOT NULL`)
          .groupBy(users.id)
          .then(result => ({ count: result.length })),
      ]);

      return {
        totalUsers: totalUsers[0]?.count || 0,
        newThisWeek: newThisWeek[0]?.count || 0,
        contentCreators: contentCreators.count || 0,
        bannedUsers: 0,
      };
    } catch {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get user stats",
      });
    }
  }),

  deleteVideo: requireAdmin
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const [existingVideo] = await db
          .select()
          .from(videos)
          .where(eq(videos.id, input.id));

        if (!existingVideo) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Video not found",
          });
        }

        const cleanupPromises = [];

        if (existingVideo.muxAssetId) {
          cleanupPromises.push(
            mux.video.assets.delete(existingVideo.muxAssetId).catch(() => {})
          );
        }

        if (existingVideo.thumbnailKey) {
          const utapi = new UTApi();
          cleanupPromises.push(
            utapi.deleteFiles([existingVideo.thumbnailKey]).catch(() => {})
          );
        }

        await Promise.allSettled(cleanupPromises);

        await db.delete(videoViews).where(eq(videoViews.videoId, input.id));
        await db.delete(videos).where(eq(videos.id, input.id));

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to delete video: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    }),

  deleteUser: requireAdmin
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const [userData] = await db.select({
          clerkId: users.clerkId,
          name: users.name
        }).from(users).where(eq(users.id, input.id)).limit(1);

        if (!userData) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        try {
          const clerk = await clerkClient();
          await clerk.users.deleteUser(userData.clerkId);
        } catch {
          // Clerk deletion failed, continuing with database cleanup
        }

        await db.delete(users).where(eq(users.id, input.id));

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    }),

  setAllVideosVisibility: requireAdmin
    .input(z.object({
      visibility: z.enum(["public", "private"]),
    }))
    .mutation(async ({ input }) => {
      try {
        await db.update(videos).set({ visibility: input.visibility, updatedAt: new Date() });
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to update visibility: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    }),

  toggleVideoVisibility: requireAdmin
    .input(z.object({
      id: z.string(),
      visibility: z.enum(["public", "private"])
    }))
    .mutation(async ({ input }) => {
      try {
        await db
          .update(videos)
          .set({ visibility: input.visibility })
          .where(eq(videos.id, input.id));
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to update video visibility: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    }),

  updateVideo: requireAdmin
    .input(z.object({
      id: z.string(),
      title: z.string().min(1).max(200).optional(),
      description: z.string().nullable().optional(),
      thumbnailUrl: z.string().url().nullable().optional(),
      categoryId: z.string().uuid().nullable().optional(),
      visibility: z.enum(["public","private"]).optional(),
      createdAt: z.date().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const { id, ...data } = input;
        const updateDataEntries = Object.entries(data).filter(([, v]) => v !== undefined) as [string, unknown][];
        const updateData = Object.fromEntries(updateDataEntries) as Partial<typeof videos.$inferInsert>;
        if (Object.keys(updateData).length === 0) {
          return { success: true };
        }
        await db.update(videos).set({
          ...updateData,
          updatedAt: new Date(),
        }).where(eq(videos.id, id));
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to update video: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    }),

  updateVideoMetrics: requireAdmin
    .input(z.object({
      id: z.string(),
      views: z.number().int().nonnegative().optional(),
      likes: z.number().int().nonnegative().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const patch: Partial<typeof videos.$inferInsert> = {};
        if (typeof input.views === 'number') {
          patch.viewCountOverride = input.views;
        }
        if (typeof input.likes === 'number') {
          patch.likeCountOverride = input.likes;
        }
        if (Object.keys(patch).length > 0) {
          await db.update(videos).set(patch).where(eq(videos.id, input.id));
        }
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to update video metrics: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    }),

  updateUserSubscribers: requireAdmin
    .input(z.object({
      userId: z.string(),
      subscribers: z.number().int().nonnegative(),
    }))
    .mutation(async ({ input }) => {
      try {
        await db.update(users).set({ subscriberCountOverride: input.subscribers }).where(eq(users.id, input.userId));
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to update subscribers: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    }),

  scheduleMetrics: requireAdmin
    .input(z.object({
      videoId: z.string(),
      targetViews: z.number().int().nonnegative(),
      targetLikes: z.number().int().nonnegative(),
      durationDays: z.number().positive().default(7),
    }))
    .mutation(async ({ input }) => {
      try {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setTime(endDate.getTime() + (input.durationDays * 24 * 60 * 60 * 1000));

        const [schedule] = await db.insert(scheduledMetrics).values({
          videoId: input.videoId,
          targetViews: input.targetViews,
          targetLikes: input.targetLikes,
          appliedViews: 0,
          appliedLikes: 0,
          startDate,
          endDate,
          isActive: true,
        }).returning();

        try {
            let intervalMinutes = 60;
            if (input.durationDays < 1) intervalMinutes = 15;
            else if (input.durationDays <= 3) intervalMinutes = 30;

            await workflow.trigger({
                url: `${process.env.UPSTASH_WORKFLOW_URL || process.env.NEXT_PUBLIC_APP_URL || "https://edu-boost.vercel.app"}/api/workflows/distribute-metrics`,
                body: {
                    scheduleId: schedule.id,
                    intervalMinutes
                },
                retries: 3
            });
        } catch {
            // Workflow trigger failed, cron fallback will handle it
        }

        return { success: true, message: `Scheduled ${input.targetViews} views and ${input.targetLikes} likes over ${input.durationDays} days` };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to schedule metrics: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    }),

  getScheduledMetrics: requireAdmin
    .input(z.object({
      videoId: z.string(),
    }))
    .query(async ({ input }) => {
      try {
        const scheduled = await db
          .select()
          .from(scheduledMetrics)
          .where(eq(scheduledMetrics.videoId, input.videoId))
          .orderBy(desc(scheduledMetrics.createdAt));

        return scheduled;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to get scheduled metrics: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    }),

  getAllScheduledMetrics: requireAdmin.query(async () => {
    try {
      const scheduled = await db
        .select({
          id: scheduledMetrics.id,
          targetViews: scheduledMetrics.targetViews,
          targetLikes: scheduledMetrics.targetLikes,
          appliedViews: scheduledMetrics.appliedViews,
          appliedLikes: scheduledMetrics.appliedLikes,
          startDate: scheduledMetrics.startDate,
          endDate: scheduledMetrics.endDate,
          isActive: scheduledMetrics.isActive,
          createdAt: scheduledMetrics.createdAt,
          video: {
            id: videos.id,
            title: videos.title,
            thumbnailUrl: videos.thumbnailUrl,
          }
        })
        .from(scheduledMetrics)
        .innerJoin(videos, eq(scheduledMetrics.videoId, videos.id))
        .orderBy(desc(scheduledMetrics.createdAt));

      return scheduled;
    } catch {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get all scheduled metrics",
      });
    }
  }),

  deleteScheduledMetric: requireAdmin
    .input(z.object({
      scheduleId: z.string(),
    }))
    .mutation(async ({ input }) => {
      try {
        await db
          .delete(scheduledMetrics)
          .where(eq(scheduledMetrics.id, input.scheduleId));

        return { success: true, message: "Schedule deleted successfully" };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to delete schedule: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    }),

  scheduleMetricsBulk: requireAdmin
    .input(z.object({
      videoIds: z.array(z.string()),
      targetViews: z.number().int().nonnegative(),
      targetLikes: z.number().int().nonnegative(),
      durationDays: z.number().positive().default(7),
    }))
    .mutation(async ({ input }) => {
      try {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setTime(endDate.getTime() + (input.durationDays * 24 * 60 * 60 * 1000));

        const values = input.videoIds.map(videoId => ({
          videoId,
          targetViews: input.targetViews,
          targetLikes: input.targetLikes,
          appliedViews: 0,
          appliedLikes: 0,
          startDate,
          endDate,
          isActive: true,
        }));

        const insertedSchedules = await db.insert(scheduledMetrics).values(values).returning();

        try {
          const intervalMinutes = input.durationDays < 1 ? 15 : (input.durationDays <= 3 ? 30 : 60);
          const baseUrl = process.env.UPSTASH_WORKFLOW_URL || process.env.NEXT_PUBLIC_APP_URL || "https://edu-boost.vercel.app";

          await Promise.allSettled(insertedSchedules.map(schedule =>
             workflow.trigger({
                url: `${baseUrl}/api/workflows/distribute-metrics`,
                body: {
                    scheduleId: schedule.id,
                    intervalMinutes
                },
                retries: 3
            })
          ));
        } catch {
          // Workflow triggers failed, cron fallback will handle it
        }

        return {
          success: true,
          message: `Scheduled ${input.targetViews} views and ${input.targetLikes} likes for ${input.videoIds.length} video(s) over ${input.durationDays} days`
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to schedule metrics: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    }),

  updateMetricsBulk: requireAdmin
    .input(z.object({
      videoIds: z.array(z.string()),
      views: z.number().int().nonnegative().optional(),
      likes: z.number().int().nonnegative().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const patch: Partial<typeof videos.$inferInsert> = {};
        if (input.views !== undefined) {
          patch.viewCountOverride = input.views;
        }
        if (input.likes !== undefined) {
          patch.likeCountOverride = input.likes;
        }

        if (Object.keys(patch).length > 0) {
          await db
            .update(videos)
            .set({
              ...patch,
              updatedAt: new Date(),
            })
            .where(inArray(videos.id, input.videoIds));
        }

        return {
          success: true,
          message: `Updated metrics for ${input.videoIds.length} video(s)`
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to update metrics: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    }),

  getAllCategories: requireAdmin.query(async () => {
    try {
      const categoriesWithVideoCount = await db
        .select({
          id: categories.id,
          name: categories.name,
          description: categories.description,
          createdAt: categories.createdAt,
          updatedAt: categories.updatedAt,
          videoCount: count(videos.id),
        })
        .from(categories)
        .leftJoin(videos, eq(categories.id, videos.categoryId))
        .groupBy(
          categories.id,
          categories.name,
          categories.description,
          categories.createdAt,
          categories.updatedAt
        )
        .orderBy(desc(categories.createdAt));

      return categoriesWithVideoCount;
    } catch {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get categories",
      });
    }
  }),

  createCategory: requireAdmin
    .input(z.object({
      name: z.string().min(1).max(100),
      description: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      try {
        const result = await db
          .insert(categories)
          .values({
            name: input.name,
            description: input.description,
          })
          .returning();

        return { success: true, category: result[0] };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to create category: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    }),

  updateCategory: requireAdmin
    .input(z.object({
      id: z.string(),
      name: z.string().min(1).max(100),
      description: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      try {
        const result = await db
          .update(categories)
          .set({
            name: input.name,
            description: input.description,
            updatedAt: new Date(),
          })
          .where(eq(categories.id, input.id))
          .returning();

        return { success: true, category: result[0] };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to update category: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    }),

  deleteCategory: requireAdmin
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const videosWithCategory = await db
          .select({ count: count() })
          .from(videos)
          .where(eq(videos.categoryId, input.id));

        if (videosWithCategory[0]?.count > 0) {
          await db
            .update(videos)
            .set({ categoryId: null })
            .where(eq(videos.categoryId, input.id));
        }

        await db
          .delete(categories)
          .where(eq(categories.id, input.id));

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to delete category: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    }),

  searchCategories: requireAdmin
    .input(z.object({
      searchTerm: z.string()
    }))
    .query(async ({ input }) => {
      try {
        const searchResults = await db
          .select({
            id: categories.id,
            name: categories.name,
            description: categories.description,
            createdAt: categories.createdAt,
            videoCount: count(videos.id),
          })
          .from(categories)
          .leftJoin(videos, eq(categories.id, videos.categoryId))
          .where(sql`LOWER(${categories.name}) LIKE LOWER(${'%' + input.searchTerm + '%'})`)
          .groupBy(
            categories.id,
            categories.name,
            categories.description,
            categories.createdAt
          )
          .orderBy(desc(categories.createdAt));

        return searchResults;
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to search categories",
        });
      }
    }),

  getViewsOverTime: requireAdmin
    .input(z.object({
      days: z.number().default(7)
    }))
    .query(async ({ input }) => {
      try {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - input.days);

        const viewsData = await db
          .select({
            date: sql<string>`DATE(${videoViews.createdAt})`,
            count: count(),
          })
          .from(videoViews)
          .where(gte(videoViews.createdAt, daysAgo))
          .groupBy(sql`DATE(${videoViews.createdAt})`)
          .orderBy(sql`DATE(${videoViews.createdAt})`);

        const result = [];
        for (let i = input.days - 1; i >= 0; i--) {
          const currentDate = new Date();
          currentDate.setDate(currentDate.getDate() - i);
          const dateStr = currentDate.toISOString().split('T')[0];

          const existingData = viewsData.find(item => item.date === dateStr);
          result.push({
            date: dateStr,
            count: existingData?.count || 0,
          });
        }

        return result;
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get views over time",
        });
      }
    }),

  getMaintenanceBanner: baseProcedure.query(async () => {
    const data = await redis.get<{ enabled: boolean; message: string }>("maintenanceBanner");
    return data ?? { enabled: false, message: "" };
  }),

  setMaintenanceBanner: requireAdmin
    .input(z.object({
      enabled: z.boolean(),
      message: z.string().max(500),
    }))
    .mutation(async ({ input }) => {
      await redis.set("maintenanceBanner", { enabled: input.enabled, message: input.message });
      return { success: true };
    }),
});

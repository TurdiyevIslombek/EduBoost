import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { db } from "@/db";
import { videos, users, categories, videoViews } from "@/db/schema";
import { count, desc, eq, sql, gte } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { clerkClient } from "@clerk/nextjs/server";
import { z } from "zod";
import { mux } from "@/lib/mux";
import { UTApi } from "uploadthing/server";

const requireAdmin = protectedProcedure.use(async ({ ctx, next }) => {
  // Get the full Clerk user data to check email
  const clerk = await clerkClient();
  const clerkUser = await clerk.users.getUser(ctx.user.clerkId);
  const userEmail = clerkUser.emailAddresses?.[0]?.emailAddress;
  
  if (userEmail !== "turdiyevislombek01@gmail.com") {
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

export const adminRouter = createTRPCRouter({
  getStats: requireAdmin.query(async () => {
    try {
      console.log("Admin getStats: Starting query...");
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

      console.log("Admin getStats: Queries completed", {
        totalVideos: totalVideos[0]?.count,
        totalUsers: totalUsers[0]?.count,
        totalCategories: totalCategories[0]?.count,
        totalViews: totalViews[0]?.count
      });

      return {
        totalVideos: totalVideos[0]?.count || 0,
        totalUsers: totalUsers[0]?.count || 0,
        totalCategories: totalCategories[0]?.count || 0,
        totalViews: totalViews[0]?.count || 0,
        publicVideos: publicVideos[0]?.count || 0,
        recentUsers: recentUsers[0]?.count || 0,
      };
    } catch (error) {
      console.error("Admin getStats error:", error);
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
      const videosWithViews = await db
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
            name: categories.name,
          },
          viewCount: count(videoViews.videoId),
        })
        .from(videos)
        .leftJoin(users, eq(videos.userId, users.id))
        .leftJoin(categories, eq(videos.categoryId, categories.id))
        .leftJoin(videoViews, eq(videos.id, videoViews.videoId))
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
          categories.name
        )
        .orderBy(desc(videos.createdAt));

      return videosWithViews;
    } catch (error) {
      console.error("Get all videos error:", error);
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
    } catch (error) {
      console.error("Get video stats error:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get video stats",
      });
    }
  }),

  getAllUsers: requireAdmin.query(async () => {
    try {
      const usersWithVideoCount = await db
        .select({
          id: users.id,
          clerkId: users.clerkId,
          name: users.name,
          imageUrl: users.imageUrl,
          createdAt: users.createdAt,
          videoCount: count(videos.id),
        })
        .from(users)
        .leftJoin(videos, eq(users.id, videos.userId))
        .groupBy(users.id, users.clerkId, users.name, users.imageUrl, users.createdAt)
        .orderBy(desc(users.createdAt));

      return usersWithVideoCount;
    } catch (error) {
      console.error("Get all users error:", error);
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
        // Note: We don't have banned users table, so we'll use 0
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
        bannedUsers: 0, // We don't have banned users functionality yet
      };
    } catch (error) {
      console.error("Get user stats error:", error);
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
        console.log("Admin deleteVideo: Starting deletion for:", input.id);
        
        // First, get the video to access external resource IDs
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

        // Clean up external resources in parallel
        const cleanupPromises = [];

        // 1. Delete Mux asset if it exists
        if (existingVideo.muxAssetId) {
          console.log("Deleting Mux asset:", existingVideo.muxAssetId);
          cleanupPromises.push(
            mux.video.assets.delete(existingVideo.muxAssetId)
              .catch(error => {
                console.error("Failed to delete Mux asset:", error);
                // Don't throw - continue with cleanup
              })
          );
        }

        // 2. Delete UploadThing thumbnail if it exists
        if (existingVideo.thumbnailKey) {
          console.log("Deleting UploadThing thumbnail:", existingVideo.thumbnailKey);
          const utapi = new UTApi();
          cleanupPromises.push(
            utapi.deleteFiles([existingVideo.thumbnailKey])
              .catch(error => {
                console.error("Failed to delete UploadThing thumbnail:", error);
                // Don't throw - continue with cleanup
              })
          );
        }

        // Wait for external cleanups to complete
        await Promise.allSettled(cleanupPromises);
        
        // Delete related records first (due to foreign key constraints)
        await db.delete(videoViews).where(eq(videoViews.videoId, input.id));
        console.log("Deleted video views");
        
        // Then delete the video
        await db.delete(videos).where(eq(videos.id, input.id));
        console.log("Deleted video and cleaned up external resources:", existingVideo.title);
        
        return { success: true };
      } catch (error) {
        console.error("Delete video error:", error);
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
        console.log("Admin deleteUser: Starting deletion for:", input.id);
        
        // First get user data including clerkId
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

        // Delete from Clerk first
        try {
          const clerk = await clerkClient();
          await clerk.users.deleteUser(userData.clerkId);
          console.log("Deleted user from Clerk:", userData.clerkId);
        } catch (clerkError) {
          console.error("Failed to delete from Clerk:", clerkError);
          // Continue with database deletion even if Clerk deletion fails
        }
        
        // Delete user from our database (this will cascade to related records)
        const result = await db.delete(users).where(eq(users.id, input.id));
        console.log("Deleted user from database, result:", result);
        
        return { success: true };
      } catch (error) {
        console.error("Delete user error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
        console.log("Admin toggleVideoVisibility: Updating video", input.id, "to", input.visibility);
        const result = await db
          .update(videos)
          .set({ visibility: input.visibility })
          .where(eq(videos.id, input.id));
        console.log("Video visibility updated, result:", result);
        return { success: true };
      } catch (error) {
        console.error("Toggle video visibility error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to update video visibility: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    }),

  // Category Management
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
    } catch (error) {
      console.error("Get all categories error:", error);
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
        console.log("Admin createCategory:", input);
        const result = await db
          .insert(categories)
          .values({
            name: input.name,
            description: input.description,
          })
          .returning();
        
        console.log("Category created:", result);
        return { success: true, category: result[0] };
      } catch (error) {
        console.error("Create category error:", error);
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
        console.log("Admin updateCategory:", input);
        const result = await db
          .update(categories)
          .set({
            name: input.name,
            description: input.description,
            updatedAt: new Date(),
          })
          .where(eq(categories.id, input.id))
          .returning();
        
        console.log("Category updated:", result);
        return { success: true, category: result[0] };
      } catch (error) {
        console.error("Update category error:", error);
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
        console.log("Admin deleteCategory:", input.id);
        
        // First, check if any videos use this category
        const videosWithCategory = await db
          .select({ count: count() })
          .from(videos)
          .where(eq(videos.categoryId, input.id));

        if (videosWithCategory[0]?.count > 0) {
          // Set category to null for videos using this category
          await db
            .update(videos)
            .set({ categoryId: null })
            .where(eq(videos.categoryId, input.id));
          console.log("Updated videos to remove category reference");
        }
        
        // Then delete the category
        const result = await db
          .delete(categories)
          .where(eq(categories.id, input.id));
        
        console.log("Category deleted:", result);
        return { success: true };
      } catch (error) {
        console.error("Delete category error:", error);
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
      } catch (error) {
        console.error("Search categories error:", error);
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

        // Fill in missing dates with 0 views
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
      } catch (error) {
        console.error("Get views over time error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get views over time",
        });
      }
    }),
});

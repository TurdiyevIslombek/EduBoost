import { db } from "@/db";
import { subscriptions, users, videoReactions, videos, videoUpdateSchema, videoViews } from "@/db/schema";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { mux } from "@/lib/mux";
import { redis } from "@/lib/redis";
import { and, desc, eq, getTableColumns, inArray, isNotNull, lt, or, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import {z} from "zod";
import { UTApi } from "uploadthing/server";
import { workflow } from "@/lib/workflow";

const TRENDING_CACHE_PREFIX = "videos:trending:v1";
const HOME_CACHE_PREFIX = "videos:home:v1";
const CACHE_TTL_SECONDS = 60; // 1 minute for video lists

export const videosRouter = createTRPCRouter({

    getManyTrending: baseProcedure
        .input(
          z.object({
            cursor: z.object({
              id: z.string().uuid(),
              viewCount: z.number(),
            })
            .nullish(),
            limit: z.number().min(1).max(100),
          })
        )
        .query(async ({ input}) => {
          const {cursor, limit} = input;

          // Cache only the first page (no cursor)
          const cacheKey = !cursor ? `${TRENDING_CACHE_PREFIX}:first:limit:${limit}` : null;
          
          if (cacheKey) {
            const cached = await redis.get(cacheKey);
            if (cached) {
              return cached as { items: typeof data; nextCursor: typeof nextCursor };
            }
          }

            const viewCountSubquery = db.$count(
            videoViews,
            eq(videoViews.videoId, videos.id)
          )

          const cursorLogic = cursor
            ? or(
                lt(sql<number>`(${viewCountSubquery} + ${videos.viewCountOverride})`, cursor.viewCount),
                and(
                  eq(sql<number>`(${viewCountSubquery} + ${videos.viewCountOverride})`, cursor.viewCount),
                  lt(videos.id, cursor.id)
                )
              )
            : undefined;
    
          const data = await db
            .select(
              {
                ...getTableColumns(videos),
                user: users,
                viewCount: viewCountSubquery,
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
                  
               }
             )
            .from(videos)
            .innerJoin(users, eq(videos.userId, users.id))
            .where(and(
                eq(videos.visibility, "public"),  
                cursorLogic
            )).orderBy(
                desc(sql<number>`(${viewCountSubquery} + ${videos.viewCountOverride})`),
                desc(videos.id)
            ).limit(limit + 1);
          const hasMore = data.length > limit;  
    
          const items = hasMore ? data.slice(0, -1) : data;

          // Apply DB overrides to totals
          items.forEach((v) => {
          (v as unknown as { viewCount: number }).viewCount = (v as unknown as { viewCount: number }).viewCount + (v as unknown as { viewCountAdded: number }).viewCountAdded;
          (v as unknown as { likeCount: number }).likeCount = (v as unknown as { likeCount: number }).likeCount + (v as unknown as { likeCountAdded: number }).likeCountAdded;
          });

          const lastItem = items[items.length - 1];
          const nextCursor = hasMore ?
          {
            id: lastItem.id,
            viewCount: lastItem.viewCount,
          }
          : null;
          
          const result = { items, nextCursor };
          
          // Cache the first page
          if (cacheKey) {
            await redis.set(cacheKey, result, { ex: CACHE_TTL_SECONDS });
          }
          
          return result;
    }),

// 
    getManySubscribed: protectedProcedure
        .input(
          z.object({
            cursor: z.object({
              id: z.string().uuid(),
              updatedAt: z.date(),
            })
            .nullish(),
            limit: z.number().min(1).max(100),
          })
        )
        .query(async ({ input, ctx}) => {
            const {id: userId} = ctx.user;
            const {cursor, limit} = input;

            const viewerSubscriptions = db.$with("viewer_subscriptions").as(
                db
                    .select({
                        userId: subscriptions.creatorId,
                    })
                    .from(subscriptions)
                    .where(eq(subscriptions.viewerId, userId))
            )
    
          const data = await db
            .with(viewerSubscriptions)
            .select(
              {
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
              
              }
            )
            .from(videos)
            .innerJoin(users, eq(videos.userId, users.id))
            .innerJoin(
                viewerSubscriptions, 
                eq(viewerSubscriptions.userId, users.id))
            .where(and(
                eq(videos.visibility, "public"),  
                cursor
                    ? or(
                        lt(videos.updatedAt, cursor.updatedAt),
                        and(
                          eq(videos.updatedAt, cursor.updatedAt),
                          lt(videos.id, cursor.id)
                        )
                    )
                    : undefined
            )).orderBy(
                desc(videos.updatedAt),
                desc(videos.id)
            ).limit(limit + 1);
          const hasMore = data.length > limit;  
    
          const items = hasMore ? data.slice(0, -1) : data;

          // Apply DB overrides to totals
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
    getMany: baseProcedure
        .input(
          z.object({
            categoryId: z.string().uuid().nullish(),
            userId: z.string().uuid().nullish(),
            cursor: z.object({
              id: z.string().uuid(),
              updatedAt: z.date(),
            })
            .nullish(),
            limit: z.number().min(1).max(100),
          })
        )
        .query(async ({ input}) => {
          const {cursor, limit, categoryId, userId} = input;
          
          // Cache only first page without user filter (public browse)
          const cacheKey = !cursor && !userId 
            ? `${HOME_CACHE_PREFIX}:first:cat:${categoryId || 'all'}:limit:${limit}` 
            : null;
          
          if (cacheKey) {
            const cached = await redis.get(cacheKey);
            if (cached) {
              return cached as { items: typeof data; nextCursor: typeof nextCursor };
            }
          }
    
          const data = await db
            .select(
              {
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
              
              }
            )
            .from(videos)
            .innerJoin(users, eq(videos.userId, users.id))
            .where(and(
                eq(videos.visibility, "public"),  
                categoryId ? eq(videos.categoryId, categoryId) : undefined,
                userId ? eq(videos.userId, userId) : undefined,
                cursor
                    ? or(
                        lt(videos.updatedAt, cursor.updatedAt),
                        and(
                          eq(videos.updatedAt, cursor.updatedAt),
                          lt(videos.id, cursor.id)
                        )
                    )
                    : undefined
            )).orderBy(
                desc(videos.updatedAt),
                desc(videos.id)
            ).limit(limit + 1);
          const hasMore = data.length > limit;  
    
          const items = hasMore ? data.slice(0, -1) : data;

          // Apply DB overrides to totals
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
          
          const result = { items, nextCursor };
          
          // Cache the first page
          if (cacheKey) {
            await redis.set(cacheKey, result, { ex: CACHE_TTL_SECONDS });
          }
          
          return result;
    }),
 
     getOne: baseProcedure
        .input(z.object({id: z.string().uuid()}))
        .query(async ( {input, ctx} ) => {

            const {clerkUserId} = ctx;

            let userId;

            const [user] = await db
                .select()
                .from(users)
                .where(inArray(users.clerkId, clerkUserId ? [clerkUserId] : []))

            if (user) {
                userId = user.id;
            }

            const viewerReactions = db.$with("viewer_reactions").as(
                db
                    .select({
                        videoId: videoReactions.videoId,
                        type: videoReactions.type,
                    })
                    .from(videoReactions)
                    .where(inArray(videoReactions.userId, userId ? [userId] : []))

            );

            const viewerSubscriptions = db.$with("viewer_subscriptions").as(
                db
                    .select()
                    .from(subscriptions)
                    .where(inArray(subscriptions.viewerId, userId ? [userId] : []))
            )


            const [existingVideo] = await db
                .with(viewerReactions, viewerSubscriptions)
                .select({
                    ...getTableColumns(videos),
                    user:{
                    ...getTableColumns(users),
                    subscriberCount: sql<number>`COALESCE(${db.$count(subscriptions, eq(subscriptions.creatorId, users.id))}, 0) + COALESCE(${users.subscriberCountOverride}, 0)`,
                    viewerSubscribed: isNotNull(viewerSubscriptions.viewerId).mapWith(Boolean),

                    },
                    viewCount: db.$count(videoViews, eq(videoViews.videoId, videos.id)),
                    viewCountAdded: videos.viewCountOverride,
                    likeCount: db.$count(
                        videoReactions, 
                        and(
                            eq(videoReactions.videoId, videos.id),
                            eq(videoReactions.type, "like"),
                        )
                    ),
                    likeCountAdded: videos.likeCountOverride,
                    dislikeCount: db.$count(
                        videoReactions, 
                        and(
                            eq(videoReactions.videoId, videos.id),
                            eq(videoReactions.type, "dislike"),
                        )
                    ),

                    viewerReaction: viewerReactions.type,

                })
                .from(videos)
                .innerJoin(users, eq(videos.userId, users.id))
                .leftJoin(viewerReactions, eq(viewerReactions.videoId, videos.id))
                .leftJoin(viewerSubscriptions, eq(viewerSubscriptions.creatorId, users.id))
                .where(eq(videos.id, input.id))

            if(!existingVideo) {
                throw new TRPCError({code:"NOT_FOUND"})
            }

            // Apply DB overrides to totals
            (existingVideo as unknown as { viewCount: number }).viewCount = (existingVideo as unknown as { viewCount: number }).viewCount + ((existingVideo as unknown as { viewCountAdded?: number }).viewCountAdded ?? 0);
            (existingVideo as unknown as { likeCount: number }).likeCount = (existingVideo as unknown as { likeCount: number }).likeCount + ((existingVideo as unknown as { likeCountAdded?: number }).likeCountAdded ?? 0);
            const existingUser = (existingVideo as unknown as { user?: { subscriberCount?: number } }).user;
            if (existingUser) {
              existingUser.subscriberCount = existingUser.subscriberCount ?? 0;
            }

            return existingVideo;
        }),


    generateTitle: protectedProcedure
        .input(z.object({id: z.string().uuid() }))
        .mutation(async({ctx, input}) => {

            const {id: userId} = ctx.user;

            const { workflowRunId } = await workflow.trigger({
                url: `${process.env.UPSTASH_WORKFLOW_URL}/api/videos/workflows/title`,
                body: { userId, videoId: input.id },
            })
            return workflowRunId;
        }),

    generateDescription: protectedProcedure
        .input(z.object({id: z.string().uuid() }))
        .mutation(async({ctx, input}) => {

            const {id: userId} = ctx.user;

            const { workflowRunId } = await workflow.trigger({
                url: `${process.env.UPSTASH_WORKFLOW_URL}/api/videos/workflows/description`,
                body: { userId, videoId: input.id },
            })
            return workflowRunId;
        }),



    generateThumbnail: protectedProcedure
        .input(z.object({id: z.string().uuid(), prompt: z.string().min(10) }))
        .mutation(async({ctx, input}) => {

            const {id: userId} = ctx.user;

            const { workflowRunId } = await workflow.trigger({
                url: `${process.env.UPSTASH_WORKFLOW_URL}/api/videos/workflows/thumbnail`,
                body: { userId, videoId: input.id, prompt: input.prompt },
            })
            return workflowRunId;
        }),

    revalidate:protectedProcedure
        .input(z.object({id: z.string().uuid() }))
        .mutation(async({ctx, input}) => {
            const {id: userId} = ctx.user;

            const [existingVideo] = await db
                .select()
                .from(videos)
                .where(and(
                    eq(videos.id, input.id),
                    eq(videos.userId, userId)
                ));
            if (!existingVideo) {
                throw new TRPCError({ code: "NOT_FOUND"});
            }

            if (!existingVideo.muxUploadId) {
                throw new TRPCError({ code: "BAD_REQUEST"});
            }

            const upload = await mux.video.uploads.retrieve(existingVideo.muxUploadId);

            if (!upload || !upload.asset_id) {
                throw new TRPCError({ code: "BAD_REQUEST"});
            }

            const asset = await mux.video.assets.retrieve(upload.asset_id);

            if (!asset) {
                throw new TRPCError({ code: "BAD_REQUEST"});
            }
            const playbackId = asset.playback_ids?.[0].id;
            const duration = asset.duration ? Math.round(asset.duration * 1000) : 0;

            const [updatedVideo] = await db
                .update(videos)
                .set({
                    muxAssetId: asset.id,
                    muxPlaybackId: playbackId,
                    muxStatus: asset.status,
                    duration,
                })
                .where(and(
                    eq(videos.id, input.id),
                    eq(videos.userId, userId)
                ))
                .returning();

            // const [updatedVideo] = await db
            //     .update(videos)
            //     .set({
            //         muxAssetId: asset.id,
            //         muxPlaybackId: asset.playback_ids?.[0]?.id || null,
            //         muxStatus: asset.status,
            //         updatedAt: new Date(),
            //     })
            //     .where(and(
            //         eq(videos.id, input.id),
            //         eq(videos.userId, userId)
            //     ))
            //     .returning();
                
            return updatedVideo;
        }),

 
    restoreThumbnail: protectedProcedure
        .input(z.object({id: z.string().uuid() }))
        .mutation(async({ctx, input}) => {
            const {id: userId} = ctx.user;

            const [existingVideo] = await db
                .select()
                .from(videos)
                .where(and(
                    eq(videos.id, input.id),
                    eq(videos.userId, userId)
                ));
                
            if (!existingVideo) {
                throw new TRPCError({ code: "NOT_FOUND"});
            }

            if (existingVideo.thumbnailKey) {
                const utapi = new UTApi();

                await utapi.deleteFiles([existingVideo.thumbnailKey]);

                await db
                    .update(videos)
                    .set({
                        thumbnailKey: null,
                        thumbnailUrl: null,
                    })
                    .where(and(
                        eq(videos.id, input.id),
                        eq(videos.userId, userId)
                    ));
            }

            if (!existingVideo.muxPlaybackId) {
                throw new TRPCError({ code: "BAD_REQUEST"});
            }

            const tempThumbnailUrl = `https://image.mux.com/${existingVideo.muxPlaybackId}/thumbnail.jpg`;
            const utapi = new UTApi();
            const uploadedThumbnail = await utapi.uploadFilesFromUrl(tempThumbnailUrl);

            if (!uploadedThumbnail.data) {
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR"});
            }

            const {key: thumbnailKey, ufsUrl: thumbnailUrl} = uploadedThumbnail.data;

            const [updatedVideo] = await db
                .update(videos)
                .set({
                    thumbnailUrl,
                    thumbnailKey,
                })
                .where(and(
                    eq(videos.id, input.id),
                    eq(videos.userId, userId)
                ))
                .returning();
            
            return updatedVideo;
        }),


    remove: protectedProcedure
        .input(z.object({id: z.string().uuid() }))
        .mutation(async({ctx, input}) => {
            const {id: userId} = ctx.user;

            // First, get the video to access external resource IDs
            const [existingVideo] = await db
                .select()
                .from(videos)
                .where(and(
                    eq(videos.id, input.id),
                    eq(videos.userId, userId)
                ));
                
            if (!existingVideo) {
                throw new TRPCError({ code: "NOT_FOUND"});
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
                            // Don't throw - continue with cleanup even if Mux fails
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
                            // Don't throw - continue with cleanup even if UploadThing fails
                        })
                );
            }

            // Wait for external cleanups to complete (with timeout)
            try {
                await Promise.allSettled(cleanupPromises);
            } catch (error) {
                console.error("Some external resource cleanup failed:", error);
                // Continue with database deletion even if external cleanup partially fails
            }

            // 3. Delete from database (this will cascade to related records)
            const [removedVideo] = await db
                .delete(videos)
                .where(and(
                    eq(videos.id, input.id),
                    eq(videos.userId, userId)
                ))
                .returning();
                
            if (!removedVideo) {
                throw new TRPCError({ code: "NOT_FOUND"});
            }

            console.log("Successfully deleted video and cleaned up external resources:", removedVideo.title);
            return removedVideo;
        }),





        

    update: protectedProcedure
        .input(videoUpdateSchema)
        .mutation(async ({ ctx, input }) => {
            const { id: userId } = ctx.user;

            if (!input.id) {
                throw new TRPCError({ code: "BAD_REQUEST", message: "Video ID is required" });
            }

            const [updatedVideo] = await db
                .update(videos)
                .set({
                    title: input.title,
                    description: input.description,
                    categoryId: input.categoryId,
                    visibility: input.visibility,
                    updatedAt: new Date(),
                })
                .where(and(
                    eq(videos.id, input.id),
                    eq(videos.userId, userId)
                ))
                .returning();
            if (!updatedVideo) {
                throw new TRPCError({ code: "NOT_FOUND"});
            }    
            return updatedVideo;
        }),


    create: protectedProcedure.mutation(async ({ctx}) => {
        const {id: userId} = ctx.user;

        const upload = await mux.video.uploads.create({
            new_asset_settings: {
                passthrough: userId,
                playback_policy: ["public"],
                input: [{
                    generated_subtitles: [{
                        language_code: "en",
                        name: "English",
                    }]
                }]
            },
            cors_origin: "*",
        });

        const [video] = await db
        .insert(videos)
        .values({
            userId,
            title: "Untitled",
            muxStatus: "waiting",
            muxUploadId: upload.id,
        })
        .returning();

    return{
        video: video,
        url: upload.url,
    }
    })
});
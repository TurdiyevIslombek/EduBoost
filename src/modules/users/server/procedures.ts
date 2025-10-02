import { db } from "@/db";
import { subscriptions, users, videos} from "@/db/schema";
import { baseProcedure, createTRPCRouter} from "@/trpc/init";
import {eq, getTableColumns, inArray, isNotNull, sql} from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import {z} from "zod";
export const usersRouter = createTRPCRouter({

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


            const viewerSubscriptions = db.$with("viewer_subscriptions").as(
                db
                    .select()
                    .from(subscriptions)
                    .where(inArray(subscriptions.viewerId, userId ? [userId] : []))
            )


            const [existingUser] = await db
                .with(viewerSubscriptions)
                .select({
                    ...getTableColumns(users),
                    viewerSubscribed: isNotNull(viewerSubscriptions.viewerId).mapWith(Boolean),
                    videoCount: db.$count(videos, eq(videos.userId, users.id)),
                    subscriberCount: sql<number>`COALESCE(${db.$count(subscriptions, eq(subscriptions.creatorId, users.id))}, 0) + COALESCE(${users.subscriberCountOverride}, 0)`,

                })
                .from(users)
                .leftJoin(viewerSubscriptions, eq(viewerSubscriptions.creatorId, users.id))
                .where(eq(users.id, input.id))



            if(!existingUser) {
                throw new TRPCError({code:"NOT_FOUND"})
            }

            return existingUser;
        }),

    updateName: baseProcedure
        .input(z.object({ name: z.string().min(2).max(100) }))
        .mutation(async ({ input, ctx }) => {
            const { clerkUserId } = ctx;
            if (!clerkUserId) {
                throw new TRPCError({ code: "UNAUTHORIZED" });
            }

            const [existing] = await db.select().from(users).where(eq(users.clerkId, clerkUserId)).limit(1);
            if (!existing) {
                throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
            }

            await db.update(users).set({ name: input.name, updatedAt: new Date() }).where(eq(users.id, existing.id));
            return { success: true };
        }),
});
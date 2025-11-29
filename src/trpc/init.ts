import { db } from '@/db';
import { users } from '@/db/schema';
import { ratelimit } from '@/lib/ratelimit';
import { auth } from '@clerk/nextjs/server';
import {initTRPC, TRPCError} from '@trpc/server';
import { eq, sql } from 'drizzle-orm';
import {cache} from 'react';
import superjson from "superjson";

// Auto-migration safeguard: ensure override columns exist
let ensurePromise: Promise<void> | null = null;
async function ensureSchema() {
  if (ensurePromise) return ensurePromise;
  ensurePromise = (async () => {
    try {
      await db.execute(sql`ALTER TABLE "videos" ADD COLUMN IF NOT EXISTS "view_count_override" integer NOT NULL DEFAULT 0`);
      await db.execute(sql`ALTER TABLE "videos" ADD COLUMN IF NOT EXISTS "like_count_override" integer NOT NULL DEFAULT 0`);
      await db.execute(sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "subscriber_count_override" integer NOT NULL DEFAULT 0`);
      await db.execute(sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_seen_at" timestamp DEFAULT NOW()`);

      // Performance: ensure critical indexes exist
      await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON "users" ("clerk_id")`);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_videos_user_id ON "videos" ("user_id")`);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_videos_category_id ON "videos" ("category_id")`);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_videos_visibility ON "videos" ("visibility")`);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_videos_updated_at ON "videos" ("updated_at")`);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_video_views_video_id ON "video_views" ("video_id")`);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_video_reactions_video_id ON "video_reactions" ("video_id")`);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_video_reactions_type ON "video_reactions" ("type")`);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_subscriptions_creator_id ON "subscriptions" ("creator_id")`);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_subscriptions_viewer_id ON "subscriptions" ("viewer_id")`);
    } catch (e) {
      console.error('Schema ensure failed:', e);
    }
  })();
  return ensurePromise;
}

export const createTRPCContext = cache(async() => {
   await ensureSchema();
   const {userId} = await auth();

   return {clerkUserId: userId};
});


export type Context = Awaited<ReturnType<typeof createTRPCContext>>;


const t = initTRPC.context<Context>().create({
    /**
     * @see https://trpc.io/docs/server/data-transformers
     */
    transformer: superjson,
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;







export const protectedProcedure = t.procedure.use(async function isAuthed (opts) {

  const {ctx} = opts;

  if (!ctx.clerkUserId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });

  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, ctx.clerkUserId));

  if (!user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const {success} = await ratelimit.limit(user.id);

  if(!success) {
    throw new TRPCError({ code: "TOO_MANY_REQUESTS" });
  }

  // Update lastSeenAt for online status tracking (non-blocking, every 2 mins max)
  const now = new Date();
  const lastSeen = user.lastSeenAt;
  if (!lastSeen || now.getTime() - lastSeen.getTime() > 2 * 60 * 1000) {
    db.update(users)
      .set({ lastSeenAt: now })
      .where(eq(users.id, user.id))
      .execute()
      .catch(() => {}); // Fire-and-forget, don't block request
  }

  return opts.next({
    ctx: {
      ...ctx,
      user,
    },
  });

});

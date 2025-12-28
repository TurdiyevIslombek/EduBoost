import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { sql } from "drizzle-orm";

// Load .env.local for local development
config({ path: ".env.local" });

const client = neon(process.env.DATABASE_URL!);
const db = drizzle(client);

async function main() {
  console.log("Ensuring schema and indexes...");

  try {
    await db.execute(sql`ALTER TABLE "videos" ADD COLUMN IF NOT EXISTS "view_count_override" integer NOT NULL DEFAULT 0`);
    await db.execute(sql`ALTER TABLE "videos" ADD COLUMN IF NOT EXISTS "like_count_override" integer NOT NULL DEFAULT 0`);
    await db.execute(sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "subscriber_count_override" integer NOT NULL DEFAULT 0`);
    await db.execute(sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_seen_at" timestamp DEFAULT NOW()`);

    console.log("Columns ensured.");

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

    console.log("Indexes ensured.");
    console.log("Schema setup complete!");
  } catch (error) {
    console.error("Error ensuring schema:", error);
    process.exit(1);
  }
}

main();

-- Add override columns for admin-settable metrics
ALTER TABLE "videos" ADD COLUMN IF NOT EXISTS "view_count_override" integer NOT NULL DEFAULT 0;
ALTER TABLE "videos" ADD COLUMN IF NOT EXISTS "like_count_override" integer NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "subscriber_count_override" integer NOT NULL DEFAULT 0;

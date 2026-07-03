import { db } from "@/db";
import { scheduledMetrics, videos } from "@/db/schema";
import { eq, and, lte, sql } from "drizzle-orm";

// Get a random variation factor to make metrics look natural
// Returns a factor between 0.6 and 1.4 with a bias towards 1.0
function getRandomVariation(): number {
  const base = Math.random();
  const skew = Math.random() * 0.3;
  return 0.6 + base * 0.8 + (Math.random() > 0.5 ? skew : -skew * 0.5);
}

// Randomly decide whether to skip this update (adds natural gaps)
function shouldSkipUpdate(): boolean {
  // 20% chance to skip any given update for more organic pattern
  return Math.random() < 0.2;
}

// Probabilistic rounding: 3.4 becomes 3 (60%) or 4 (40%)
function probabilisticRound(value: number): number {
  return Math.floor(value) + (Math.random() < value % 1 ? 1 : 0);
}

// Processes every active schedule once, following the ideal time curve
// (applied ≈ target × progress). The delta self-adjusts to however often
// this runs — hourly workflow ticks apply small chunks, a daily cron
// catches up a full day's worth. Safe to run concurrently with the
// Upstash workflow: schedule rows are advanced with an optimistic lock
// and video counters with atomic SQL increments, so a race can never
// double-apply or lose an update.
export async function processScheduledMetrics() {
  const now = new Date();

  const activeSchedules = await db
    .select()
    .from(scheduledMetrics)
    .where(
      and(
        eq(scheduledMetrics.isActive, true),
        lte(scheduledMetrics.startDate, now)
      )
    );

  let totalViewsAdded = 0;
  let totalLikesAdded = 0;

  for (const schedule of activeSchedules) {
    const remainingViews = Math.max(0, schedule.targetViews - schedule.appliedViews);
    const remainingLikes = Math.max(0, schedule.targetLikes - schedule.appliedLikes);

    if (remainingViews <= 0 && remainingLikes <= 0) {
      await db
        .update(scheduledMetrics)
        .set({ isActive: false, updatedAt: now })
        .where(eq(scheduledMetrics.id, schedule.id));
      continue;
    }

    const pastEnd = now.getTime() >= schedule.endDate.getTime();
    let viewsToAdd = 0;
    let likesToAdd = 0;

    if (pastEnd) {
      // The window is over: apply everything left and finish the schedule.
      viewsToAdd = remainingViews;
      likesToAdd = remainingLikes;
    } else {
      // Randomly skip some updates to create natural gaps — but only while
      // there is still time left to catch up.
      if (shouldSkipUpdate() && remainingViews > 5 && remainingLikes > 2) {
        continue;
      }

      const totalDuration = schedule.endDate.getTime() - schedule.startDate.getTime();
      const elapsedDuration = now.getTime() - schedule.startDate.getTime();
      const progress = totalDuration <= 0 ? 1 : Math.min(1, Math.max(0, elapsedDuration / totalDuration));

      // Where the counters should ideally be right now, with ±40% noise so
      // the growth doesn't look machine-perfect.
      const idealViews = probabilisticRound(schedule.targetViews * progress * getRandomVariation());
      const idealLikes = probabilisticRound(schedule.targetLikes * progress * getRandomVariation());

      viewsToAdd = Math.min(Math.max(0, idealViews - schedule.appliedViews), remainingViews);
      likesToAdd = Math.min(Math.max(0, idealLikes - schedule.appliedLikes), remainingLikes);
    }

    if (viewsToAdd === 0 && likesToAdd === 0) continue;

    // Advance the schedule first, guarded by an optimistic lock: if another
    // runner (e.g. the Upstash workflow) advanced it since we read it, this
    // matches 0 rows and we skip — the next tick recalculates from fresh data.
    const claimed = await db
      .update(scheduledMetrics)
      .set({
        appliedViews: schedule.appliedViews + viewsToAdd,
        appliedLikes: schedule.appliedLikes + likesToAdd,
        isActive: !(viewsToAdd >= remainingViews && likesToAdd >= remainingLikes),
        updatedAt: now,
      })
      .where(
        and(
          eq(scheduledMetrics.id, schedule.id),
          eq(scheduledMetrics.isActive, true),
          eq(scheduledMetrics.appliedViews, schedule.appliedViews),
          eq(scheduledMetrics.appliedLikes, schedule.appliedLikes)
        )
      )
      .returning({ id: scheduledMetrics.id });

    if (claimed.length === 0) continue;

    // Atomic increment — never read-modify-write the video counters.
    await db
      .update(videos)
      .set({
        viewCountOverride: sql`${videos.viewCountOverride} + ${viewsToAdd}`,
        likeCountOverride: sql`${videos.likeCountOverride} + ${likesToAdd}`,
        updatedAt: now,
      })
      .where(eq(videos.id, schedule.videoId));

    totalViewsAdded += viewsToAdd;
    totalLikesAdded += likesToAdd;
  }

  return {
    success: true,
    processed: activeSchedules.length,
    viewsAdded: totalViewsAdded,
    likesAdded: totalLikesAdded,
  };
}

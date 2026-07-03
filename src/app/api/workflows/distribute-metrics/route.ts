import { serve } from "@upstash/workflow/nextjs";
import { db } from "@/db";
import { scheduledMetrics, videos } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";

interface DistributionEvent {
  scheduleId: string;
  intervalMinutes?: number; // How often to update (default 60)
}

export const { POST } = serve<DistributionEvent>(async (context) => {
  const { scheduleId, intervalMinutes = 60 } = context.requestPayload;

  // We'll loop until the schedule is complete or cancelled
  // 1000 loops is a safety limit (approx 40 days if running hourly)
  for (let i = 0; i < 1000; i++) {
    
    // 1. Wait for the interval
    await context.sleep("wait-interval", intervalMinutes * 60);

    // 2. Run the update logic
    const result = await context.run("process-metric-update", async () => {
      const now = new Date();
      
      // Fetch fresh schedule data
      const [schedule] = await db
        .select()
        .from(scheduledMetrics)
        .where(eq(scheduledMetrics.id, scheduleId))
        .limit(1);

      // Stop if schedule is missing, inactive, or finished
      if (!schedule || !schedule.isActive || new Date() > schedule.endDate) {
        if (schedule) {
          await db
            .update(scheduledMetrics)
            .set({ isActive: false, updatedAt: now })
            .where(eq(scheduledMetrics.id, scheduleId));
        }
        return { continue: false, reason: "finished_or_cancelled" };
      }

      const totalDuration = schedule.endDate.getTime() - schedule.startDate.getTime();
      const elapsedDuration = now.getTime() - schedule.startDate.getTime();
      
      // Calculate progress (0 to 1)
      const progress = Math.min(1, Math.max(0, elapsedDuration / totalDuration));
      const isLastStep = progress >= 1;

      // Calculate target values based on progress
      // We apply the random factor during the run, but force convergence at the end
      let idealViewsFloat = schedule.targetViews * progress;
      let idealLikesFloat = schedule.targetLikes * progress;

      if (!isLastStep) {
        // Random variation ±5%
        const randomFactor = 0.95 + Math.random() * 0.1;
        idealViewsFloat *= randomFactor;
        idealLikesFloat *= randomFactor;
      }

      // Probabilistic rounding
      const idealViewsApplied = Math.floor(idealViewsFloat) + (Math.random() < (idealViewsFloat % 1) ? 1 : 0);
      const idealLikesApplied = Math.floor(idealLikesFloat) + (Math.random() < (idealLikesFloat % 1) ? 1 : 0);

      // Calculate delta
      let viewsToAdd = Math.max(0, idealViewsApplied - schedule.appliedViews);
      let likesToAdd = Math.max(0, idealLikesApplied - schedule.appliedLikes);

      // Cap at remaining
      const remainingViews = schedule.targetViews - schedule.appliedViews;
      const remainingLikes = schedule.targetLikes - schedule.appliedLikes;
      
      viewsToAdd = Math.min(viewsToAdd, remainingViews);
      likesToAdd = Math.min(likesToAdd, remainingLikes);

      if (viewsToAdd > 0 || likesToAdd > 0) {
        // Advance the schedule with an optimistic lock so a concurrent
        // runner (the cron fallback or "Run Scheduler Now") can't apply the
        // same tick twice. If someone else advanced it since we read it,
        // skip — the next tick recalculates from fresh data.
        const claimed = await db.update(scheduledMetrics).set({
          appliedViews: schedule.appliedViews + viewsToAdd,
          appliedLikes: schedule.appliedLikes + likesToAdd,
          updatedAt: now,
        }).where(and(
          eq(scheduledMetrics.id, scheduleId),
          eq(scheduledMetrics.isActive, true),
          eq(scheduledMetrics.appliedViews, schedule.appliedViews),
          eq(scheduledMetrics.appliedLikes, schedule.appliedLikes),
        )).returning({ id: scheduledMetrics.id });

        if (claimed.length === 0) {
          return { continue: true, viewsAdded: 0, likesAdded: 0 };
        }

        // Atomic increment — never read-modify-write the video counters.
        await db.update(videos).set({
          viewCountOverride: sql`${videos.viewCountOverride} + ${viewsToAdd}`,
          likeCountOverride: sql`${videos.likeCountOverride} + ${likesToAdd}`,
          updatedAt: now,
        }).where(eq(videos.id, schedule.videoId));
      }

      // Check if we are fully done
      const isComplete = (schedule.appliedViews + viewsToAdd) >= schedule.targetViews &&
                         (schedule.appliedLikes + likesToAdd) >= schedule.targetLikes;

      if (isComplete || isLastStep) {
         await db.update(scheduledMetrics).set({ isActive: false }).where(eq(scheduledMetrics.id, scheduleId));
         return { continue: false, reason: "completed" };
      }

      return { continue: true, viewsAdded: viewsToAdd, likesAdded: likesToAdd };
    });

    if (!result.continue) {
      break;
    }
  }
});

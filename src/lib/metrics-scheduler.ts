import { db } from "@/db";
import { scheduledMetrics, videos } from "@/db/schema";
import { eq, and, lte } from "drizzle-orm";

export async function processScheduledMetrics() {
  try {
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
      const remainingViews = schedule.targetViews - schedule.appliedViews;
      const remainingLikes = schedule.targetLikes - schedule.appliedLikes;

      if (remainingViews <= 0 && remainingLikes <= 0) {
        await db
          .update(scheduledMetrics)
          .set({ isActive: false, updatedAt: now })
          .where(eq(scheduledMetrics.id, schedule.id));
        continue;
      }

      const totalDuration = schedule.endDate.getTime() - schedule.startDate.getTime();
      const elapsedDuration = now.getTime() - schedule.startDate.getTime();
      
      let viewsToAdd = 0;
      let likesToAdd = 0;

      if (totalDuration <= 0) {
         // Instant finish if duration is 0 or negative
         viewsToAdd = remainingViews;
         likesToAdd = remainingLikes;
      } else {
          // Calculate progress (0 to 1), clamped
          const progress = Math.min(1, Math.max(0, elapsedDuration / totalDuration));

          // Calculate where we SHOULD be right now (float)
          let idealViewsFloat = schedule.targetViews * progress;
          let idealLikesFloat = schedule.targetLikes * progress;

          // Only apply randomness if we aren't fully done with the time period
          // This ensures we eventually converge exactly to the target
          if (progress < 1) {
            // Add slight randomness to the curve (±5% variation) to make it look natural
            const randomFactor = 0.95 + Math.random() * 0.1; 
            idealViewsFloat *= randomFactor;
            idealLikesFloat *= randomFactor;
          }

          // Apply probabilistic rounding for smoother distribution on small numbers/short intervals
          const idealViewsApplied = Math.floor(idealViewsFloat) + (Math.random() < (idealViewsFloat % 1) ? 1 : 0);
          const idealLikesApplied = Math.floor(idealLikesFloat) + (Math.random() < (idealLikesFloat % 1) ? 1 : 0);

          // Calculate what we need to add to catch up
          // We clamp at 0 to ensure we never subtract metrics if we're ahead of schedule
          viewsToAdd = Math.max(0, idealViewsApplied - schedule.appliedViews);
          likesToAdd = Math.max(0, idealLikesApplied - schedule.appliedLikes);

          // Ensure we don't overshoot the total target
          viewsToAdd = Math.min(viewsToAdd, remainingViews);
          likesToAdd = Math.min(likesToAdd, remainingLikes);
      }

      // If there's nothing to add this time, skip database updates
      if (viewsToAdd === 0 && likesToAdd === 0) continue;

      const [currentVideo] = await db
        .select()
        .from(videos)
        .where(eq(videos.id, schedule.videoId))
        .limit(1);

      if (!currentVideo) continue;

      const newViewCount = currentVideo.viewCountOverride + viewsToAdd;
      const newLikeCount = currentVideo.likeCountOverride + likesToAdd;

      await db
        .update(videos)
        .set({
          viewCountOverride: newViewCount,
          likeCountOverride: newLikeCount,
          updatedAt: now,
        })
        .where(eq(videos.id, schedule.videoId));

      await db
        .update(scheduledMetrics)
        .set({
          appliedViews: schedule.appliedViews + viewsToAdd,
          appliedLikes: schedule.appliedLikes + likesToAdd,
          updatedAt: now,
        })
        .where(eq(scheduledMetrics.id, schedule.id));

      totalViewsAdded += viewsToAdd;
      totalLikesAdded += likesToAdd;

      console.log(
        `Applied ${viewsToAdd} views and ${likesToAdd} likes to video ${schedule.videoId}`
      );
    }

    return { 
      success: true, 
      processed: activeSchedules.length,
      viewsAdded: totalViewsAdded,
      likesAdded: totalLikesAdded 
    };
  } catch (error) {
    console.error("Error processing scheduled metrics:", error);
    throw error;
  }
}

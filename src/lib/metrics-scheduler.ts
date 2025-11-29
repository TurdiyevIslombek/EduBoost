import { db } from "@/db";
import { scheduledMetrics, videos } from "@/db/schema";
import { eq, and, lte } from "drizzle-orm";

// Get a random variation factor to make metrics look natural
// Returns a factor between 0.6 and 1.4 with a bias towards 1.0
function getRandomVariation(): number {
  // Use multiple random factors for more natural distribution
  const base = Math.random();
  const skew = Math.random() * 0.3;
  return 0.6 + base * 0.8 + (Math.random() > 0.5 ? skew : -skew * 0.5);
}

// Randomly decide whether to skip this update (adds natural gaps)
function shouldSkipUpdate(): boolean {
  // 20% chance to skip any given update for more organic pattern
  return Math.random() < 0.2;
}

// Add micro-delays between updates to spread them out
function getRandomBatchSize(remaining: number): number {
  if (remaining <= 1) return remaining;
  // Process 1-3 items at a time for small batches of views/likes
  const maxBatch = Math.min(3, Math.ceil(remaining * 0.15));
  return Math.max(1, Math.floor(Math.random() * maxBatch) + 1);
}

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

      // Randomly skip some updates to create natural gaps
      if (shouldSkipUpdate() && remainingViews > 5 && remainingLikes > 2) {
        continue;
      }

      const totalDuration = schedule.endDate.getTime() - schedule.startDate.getTime();
      const elapsedDuration = now.getTime() - schedule.startDate.getTime();
      
      let viewsToAdd = 0;
      let likesToAdd = 0;

      if (totalDuration <= 0) {
         viewsToAdd = remainingViews;
         likesToAdd = remainingLikes;
      } else {
          const progress = Math.min(1, Math.max(0, elapsedDuration / totalDuration));

          // Base calculation for where we should be
          let idealViewsFloat = schedule.targetViews * progress;
          let idealLikesFloat = schedule.targetLikes * progress;

          // Apply stronger randomness for more natural distribution
          if (progress < 1) {
            // Randomize the curve more aggressively (±40% variation)
            const viewVariation = getRandomVariation();
            const likeVariation = getRandomVariation();
            idealViewsFloat *= viewVariation;
            idealLikesFloat *= likeVariation;
          }

          // Probabilistic rounding
          const idealViewsApplied = Math.floor(idealViewsFloat) + (Math.random() < (idealViewsFloat % 1) ? 1 : 0);
          const idealLikesApplied = Math.floor(idealLikesFloat) + (Math.random() < (idealLikesFloat % 1) ? 1 : 0);

          // Calculate what to add
          viewsToAdd = Math.max(0, idealViewsApplied - schedule.appliedViews);
          likesToAdd = Math.max(0, idealLikesApplied - schedule.appliedLikes);

          // Apply batch size limiting for more natural increments
          if (viewsToAdd > 0) {
            viewsToAdd = Math.min(viewsToAdd, getRandomBatchSize(remainingViews));
          }
          if (likesToAdd > 0) {
            likesToAdd = Math.min(likesToAdd, getRandomBatchSize(remainingLikes));
          }

          // Ensure we don't overshoot
          viewsToAdd = Math.min(viewsToAdd, remainingViews);
          likesToAdd = Math.min(likesToAdd, remainingLikes);
      }

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

import { db } from "@/db";
import { categories } from "@/db/schema";
import { redis } from "@/lib/redis";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";

const CATEGORIES_CACHE_KEY = "categories:v1";
const CATEGORIES_TTL_SECONDS = 60 * 60; // 1 hour

export const categoriesRouter = createTRPCRouter({
  getMany: baseProcedure.query(async () => {
    // Try to get from cache first
    const cached = await redis.get(CATEGORIES_CACHE_KEY);
    if (cached) {
      return cached as typeof data;
    }

    const data = await db.select().from(categories);
    
    // Cache the result
    await redis.set(CATEGORIES_CACHE_KEY, data, { ex: CATEGORIES_TTL_SECONDS });
    
    return data;
  }),
});

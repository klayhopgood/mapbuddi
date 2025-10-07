"use server";

import { db } from "@/db/db";
import { listReviews } from "@/db/schema";
import { count, avg, eq } from "drizzle-orm";

export async function getListsWithReviewStats(listIds: number[]) {
  if (listIds.length === 0) return [];

  try {
    const reviewStats = await db
      .select({
        listId: listReviews.listId,
        avgRating: avg(listReviews.rating),
        totalReviews: count(listReviews.id),
      })
      .from(listReviews)
      .where(eq(listReviews.listId, listIds[0])) // This approach won't work for multiple lists
      .groupBy(listReviews.listId);

    // For multiple lists, we need a different approach
    const reviewStatsMap = new Map();
    
    for (const listId of listIds) {
      const stats = await db
        .select({
          listId: listReviews.listId,
          avgRating: avg(listReviews.rating),
          totalReviews: count(listReviews.id),
        })
        .from(listReviews)
        .where(eq(listReviews.listId, listId))
        .groupBy(listReviews.listId);

      if (stats.length > 0) {
        reviewStatsMap.set(listId, {
          avgRating: Number(stats[0].avgRating) || 0,
          totalReviews: Number(stats[0].totalReviews) || 0,
        });
      } else {
        reviewStatsMap.set(listId, {
          avgRating: 0,
          totalReviews: 0,
        });
      }
    }

    return Array.from(reviewStatsMap.entries()).map(([listId, stats]) => ({
      listId,
      ...stats,
    }));
  } catch (error) {
    console.error("Get lists review stats error:", error);
    return [];
  }
}

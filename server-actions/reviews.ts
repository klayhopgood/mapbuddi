"use server";

import { db } from "@/db/db";
import { listReviews, orders, locationLists, stores } from "@/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq, and, avg, count, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export interface ReviewData {
  rating: number;
  review?: string;
}

export async function createOrUpdateReview(listId: number, reviewData: ReviewData) {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const userEmail = user.emailAddresses[0]?.emailAddress || "";
    
    // Verify user has purchased this list
    const hasPurchased = await verifyListPurchase(user.id, userEmail, listId);
    if (!hasPurchased) {
      throw new Error("You must purchase this list before leaving a review");
    }

    // Validate rating (1-5 stars)
    if (reviewData.rating < 1 || reviewData.rating > 5) {
      throw new Error("Rating must be between 1 and 5 stars");
    }

    // Validate review length
    if (reviewData.review && reviewData.review.length > 500) {
      throw new Error("Review must be 500 characters or less");
    }

    // Check if user already has a review for this list
    const existingReview = await db
      .select()
      .from(listReviews)
      .where(and(eq(listReviews.listId, listId), eq(listReviews.userId, user.id)));

    if (existingReview.length > 0) {
      // Update existing review
      await db
        .update(listReviews)
        .set({
          rating: reviewData.rating,
          review: reviewData.review,
          userEmail: userEmail, // Update email too
          updatedAt: new Date(),
        })
        .where(and(eq(listReviews.listId, listId), eq(listReviews.userId, user.id)));
    } else {
      // Create new review
      await db
        .insert(listReviews)
        .values({
          listId,
          userId: user.id,
          userEmail: userEmail,
          rating: reviewData.rating,
          review: reviewData.review,
        });
    }

    // Update the WanderList's average rating
    await updateLocationListRating(listId);

    revalidatePath(`/list/${listId}`);
    revalidatePath("/lists");
    revalidatePath("/account/buying/lists");

    return { success: true, message: "Review saved successfully" };
  } catch (error) {
    console.error("Review creation/update error:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to save review" 
    };
  }
}

export async function getReviewsForList(listId: number) {
  try {
    const reviews = await db
      .select({
        id: listReviews.id,
        rating: listReviews.rating,
        review: listReviews.review,
        createdAt: listReviews.createdAt,
        userId: listReviews.userId,
        userEmail: listReviews.userEmail,
      })
      .from(listReviews)
      .where(eq(listReviews.listId, listId))
      .orderBy(desc(listReviews.createdAt));

    return reviews;
  } catch (error) {
    console.error("Get reviews error:", error);
    return [];
  }
}

export async function getUserReviewForList(listId: number) {
  try {
    const user = await currentUser();
    if (!user) return null;

    const review = await db
      .select()
      .from(listReviews)
      .where(and(eq(listReviews.listId, listId), eq(listReviews.userId, user.id)));

    return review[0] || null;
  } catch (error) {
    console.error("Get user review error:", error);
    return null;
  }
}

async function verifyListPurchase(userId: string, userEmail: string, listId: number): Promise<boolean> {
  try {
    // Check if user has an order containing this list
    const userOrders = await db
      .select({
        items: orders.items,
      })
      .from(orders)
      .where(eq(orders.email, userEmail));

    for (const order of userOrders) {
      if (order.items) {
        const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
        const hasList = items.some((item: any) => item.id === listId);
        if (hasList) {
          return true;
        }
      }
    }

    return false;
  } catch (error) {
    console.error("Verify purchase error:", error);
    return false;
  }
}

async function updateLocationListRating(listId: number) {
  try {
    // Calculate new average rating
    const ratingStats = await db
      .select({
        avgRating: avg(listReviews.rating),
        totalReviews: count(listReviews.id),
      })
      .from(listReviews)
      .where(eq(listReviews.listId, listId));

    const stats = ratingStats[0];
    if (stats && stats.totalReviews > 0) {
      // Update the WanderList with new average rating
      await db
        .update(locationLists)
        .set({
          avgRating: String(Number(stats.avgRating).toFixed(2)),
        })
        .where(eq(locationLists.id, listId));
    }
  } catch (error) {
    console.error("Update rating error:", error);
  }
}

export async function getListRatingStats(listId: number) {
  try {
    const stats = await db
      .select({
        avgRating: avg(listReviews.rating),
        totalReviews: count(listReviews.id),
      })
      .from(listReviews)
      .where(eq(listReviews.listId, listId));

    const result = stats[0];
    return {
      avgRating: result?.avgRating ? Number(result.avgRating) : 0,
      totalReviews: result?.totalReviews || 0,
    };
  } catch (error) {
    console.error("Get rating stats error:", error);
    return { avgRating: 0, totalReviews: 0 };
  }
}

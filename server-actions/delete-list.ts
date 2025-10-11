"use server";

import { db } from "@/db/db";
import { locationLists, stores } from "@/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function deleteLocationList(listId: number) {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const storeId = Number(user.privateMetadata?.storeId);
    if (!storeId) {
      throw new Error("No store found");
    }

    // Get store details for revalidation
    const [storeInfo] = await db
      .select({ slug: stores.slug })
      .from(stores)
      .where(eq(stores.id, storeId));

    // Soft delete: Set deletedAt timestamp instead of actually deleting
    // This preserves analytics, order history, and purchased list data
    // The list stays in database but is hidden from seller dashboard and public views
    await db
      .update(locationLists)
      .set({ 
        deletedAt: new Date(),
        updatedAt: new Date()
      })
      .where(and(
        eq(locationLists.id, listId),
        eq(locationLists.storeId, storeId) // Ensure user owns this list
      ));

    // Revalidate the lists management page and profile page to show updated data
    revalidatePath("/account/selling/lists");
    if (storeInfo?.slug) {
      revalidatePath(`/profile/${storeInfo.slug}`);
    }

    return {
      success: true,
      message: "WanderList deleted successfully"
    };

  } catch (error) {
    console.error("Error deleting WanderList:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete WanderList"
    };
  }
}

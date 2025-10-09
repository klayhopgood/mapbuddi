"use server";

import { db } from "@/db/db";
import { locationLists } from "@/db/schema";
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

    // Soft delete: Set isActive to false instead of actually deleting
    // This preserves analytics and order history
    await db
      .update(locationLists)
      .set({ 
        isActive: false,
        updatedAt: new Date()
      })
      .where(and(
        eq(locationLists.id, listId),
        eq(locationLists.storeId, storeId) // Ensure user owns this list
      ));

    // Revalidate the lists page to show updated data
    revalidatePath("/account/selling/lists");

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

"use server";

import { db } from "@/db/db";
import { listPois, listCategories } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getListPois(listId: number) {
  try {
    // Get categories for this list
    const categories = await db
      .select()
      .from(listCategories)
      .where(eq(listCategories.listId, listId));

    if (categories.length === 0) {
      return [];
    }

    // Get POIs for all categories
    const pois = await db
      .select({
        id: listPois.id,
        name: listPois.name,
        address: listPois.address,
        description: listPois.description,
        notes: listPois.notes,
        categoryId: listPois.categoryId,
        latitude: listPois.latitude,
        longitude: listPois.longitude,
        createdAt: listPois.createdAt,
      })
      .from(listPois)
      .where(eq(listPois.categoryId, categories[0].id)); // For now, just get POIs from first category

    // Group POIs by category
    const poisWithCategories = pois.map(poi => {
      const category = categories.find(cat => cat.id === poi.categoryId);
      return {
        ...poi,
        categoryName: category?.name || 'Unknown',
        categoryEmoji: category?.emoji || '📍',
      };
    });

    return poisWithCategories;
  } catch (error) {
    console.error("Get list POIs error:", error);
    return [];
  }
}

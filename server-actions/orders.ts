"use server";

import { db } from "@/db/db";
import { locationLists } from "@/db/schema";
import { CheckoutItem, OrderItemDetails } from "@/lib/types";
import { inArray } from "drizzle-orm";

export const getDetailsOfListsOrdered = async (
  checkoutItems: CheckoutItem[]
) => {
  const results = await db
    .select({
      id: locationLists.id,
      name: locationLists.name,
      coverImage: locationLists.coverImage,
      storeId: locationLists.storeId,
      currency: locationLists.currency,
      isActive: locationLists.isActive,
      totalPois: locationLists.totalPois,
      avgRating: locationLists.avgRating,
      createdAt: locationLists.createdAt,
      updatedAt: locationLists.updatedAt,
    })
    .from(locationLists)
    .where(
      inArray(
        locationLists.id,
        checkoutItems.map((item) => item.id)
      )
    );

  return results.map((result) => ({
    ...result,
    coverImage: typeof result.coverImage === 'string' 
      ? JSON.parse(result.coverImage) 
      : result.coverImage || []
  })) as OrderItemDetails[];
};

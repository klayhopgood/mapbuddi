"use server";

import { db } from "@/db/db";
import { locationLists } from "@/db/schema";
import { CheckoutItem, OrderItemDetails } from "@/lib/types";
import { inArray } from "drizzle-orm";

export const getDetailsOfListsOrdered = async (
  checkoutItems: CheckoutItem[]
) => {
  return (await db
    .select({
      id: locationLists.id,
      name: locationLists.name,
      coverImage: locationLists.coverImage,
      storeId: locationLists.storeId,
    })
    .from(locationLists)
    .where(
      inArray(
        locationLists.id,
        checkoutItems.map((item) => item.id)
      )
    )) as OrderItemDetails[];
};

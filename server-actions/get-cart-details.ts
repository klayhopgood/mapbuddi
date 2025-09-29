"use server";

import { db } from "@/db/db";
import { carts, products, stores } from "@/db/schema";
import { CartItem, CartLineItemDetails } from "@/lib/types";
import { eq, inArray, and } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";

export async function getCart(cartId: number) {
  const user = await currentUser();
  if (!user) return { cartItems: [], uniqueStoreIds: [], cartItemDetails: [] };

  const dbCartItemsObj = isNaN(Number(cartId))
    ? []
    : await db
        .select({
          id: carts.id,
          items: carts.items,
        })
        .from(carts)
        .where(and(eq(carts.id, Number(cartId)), eq(carts.userId, user.id)));
  const cartItems = dbCartItemsObj.length
    ? (JSON.parse(dbCartItemsObj[0].items as string) as CartItem[])
    : [];

  const cartItemDetails = !!cartItems
    ? await getCartItemDetails(cartId ? Number(cartId) : null, cartItems)
    : [];

  const uniqueStoreIds = [
    ...(new Set(cartItemDetails?.map((item) => item.storeId)) as any),
  ] as number[];

  return {
    cartItems,
    uniqueStoreIds,
    cartItemDetails,
  };
}

async function getCartItemDetails(
  cartId: number | null,
  cartItems: CartItem[]
) {
  if (!cartId) return [];
  const productIds = cartItems.map((item) => Number(item.id));
  if (!productIds.length) return [];
  const vals = await db
    .select({
      id: products.id,
      name: products.name,
      price: products.price,
      inventory: products.inventory,
      storeId: products.storeId,
      images: products.images,
      storeName: stores.name,
    })
    .from(products)
    .leftJoin(stores, eq(products.storeId, stores.id))
    .where(inArray(products.id, productIds));
  return vals as CartLineItemDetails[];
}

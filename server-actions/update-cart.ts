"use server";

import { db } from "@/db/db";
import { carts } from "@/db/schema";
import { CartItem } from "@/lib/types";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function updateCart(updateCartItem: CartItem) {
  const cartId = cookies().get("cartId")?.value;

  if (isNaN(Number(cartId))) {
    throw new Error("Invalid cartId");
  }

  const dbCartItemsObj = await db
    .select()
    .from(carts)
    .where(eq(carts.id, Number(cartId)));

  let parsedCartItems: CartItem[] = [];
  if (dbCartItemsObj.length && dbCartItemsObj[0].items) {
    try {
      // Handle both string and already-parsed object cases
      if (typeof dbCartItemsObj[0].items === 'string') {
        parsedCartItems = JSON.parse(dbCartItemsObj[0].items) as CartItem[];
      } else {
        parsedCartItems = dbCartItemsObj[0].items as CartItem[];
      }
    } catch (error) {
      console.error('Error parsing cart items:', error);
      parsedCartItems = [];
    }
  }

  const cartItemsExcludingUpdateItem = parsedCartItems.filter(
    (item) => item.id !== updateCartItem.id
  );

  if (updateCartItem.qty > 0) {
    await db
      .update(carts)
      .set({
        items: cartItemsExcludingUpdateItem.length
          ? JSON.stringify([...cartItemsExcludingUpdateItem, updateCartItem])
          : JSON.stringify([updateCartItem]),
      })
      .where(eq(carts.id, Number(cartId)));
  } else {
    await db
      .update(carts)
      .set({
        items:
          cartItemsExcludingUpdateItem && cartItemsExcludingUpdateItem.length
            ? JSON.stringify(cartItemsExcludingUpdateItem)
            : JSON.stringify([]),
      })
      .where(eq(carts.id, Number(cartId)));
  }
  revalidatePath("/");
}

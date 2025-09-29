"use server";

import { db } from "@/db/db";
import { carts } from "@/db/schema";
import { CartItem } from "@/lib/types";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { currentUser } from "@clerk/nextjs/server";

export async function addToCart(newCartItem: CartItem) {
  const user = await currentUser();
  if (!user) throw new Error("User not authenticated");

  const cookieStore = cookies();
  const cartId = cookieStore.get("cartId")?.value;
  
  // Check if cart exists and belongs to current user
  const cartDetails =
    cartId &&
    (await db
      .select()
      .from(carts)
      .where(and(eq(carts.id, Number(cartId)), eq(carts.userId, user.id))));
  const cartAvailableAndOpen = cartDetails && cartDetails.length > 0 && !cartDetails[0].isClosed;

  if (cartAvailableAndOpen) {
    const dbItems = await db
      .select()
      .from(carts)
      .where(eq(carts.id, Number(cartId)));

    const allItemsInCart = JSON.parse(dbItems[0].items as string) as CartItem[];

    const newCartItemInCart = allItemsInCart.find(
      (item) => item.id === newCartItem.id
    ) as CartItem | undefined;

    const cartItemsWithOutCurrentItem = allItemsInCart.filter(
      (item) => item.id !== newCartItem.id
    );

    await db
      .update(carts)
      .set({
        items: allItemsInCart
          ? JSON.stringify([
              ...cartItemsWithOutCurrentItem,
              {
                ...newCartItem,
                qty: newCartItemInCart
                  ? newCartItem.qty + newCartItemInCart.qty
                  : newCartItem.qty,
              },
            ])
          : JSON.stringify([newCartItem]),
      })
      .where(eq(carts.id, Number(cartId)));
    revalidatePath("/");
    return;
  } else {
    const newCart = await db
      .insert(carts)
      .values({ 
        items: JSON.stringify([newCartItem]),
        userId: user.id 
      })
      .returning();
    cookieStore.set("cartId", String(newCart[0].id));
    revalidatePath("/");
    return;
  }
}

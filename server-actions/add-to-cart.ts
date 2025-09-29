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
  
  // Check if cart exists and belongs to current user (or is an old cart without userId)
  let userCart = null;
  let cartAvailableAndOpen = false;
  
  if (cartId && !isNaN(Number(cartId))) {
    const cartDetails = await db
      .select()
      .from(carts)
      .where(eq(carts.id, Number(cartId)));
    
    userCart = cartDetails.find(cart => 
      cart.userId === user.id || cart.userId === null
    ) || null;
    
    cartAvailableAndOpen = userCart && !userCart.isClosed;
  }

  if (cartAvailableAndOpen) {
    let allItemsInCart: CartItem[] = [];
    
    try {
      // Handle both string and already-parsed object cases
      if (typeof userCart.items === 'string') {
        allItemsInCart = JSON.parse(userCart.items) as CartItem[];
      } else {
        allItemsInCart = (userCart.items as CartItem[]) || [];
      }
    } catch (error) {
      console.error('Error parsing cart items:', error);
      allItemsInCart = [];
    }

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
        userId: user.id, // Ensure userId is set for old carts
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

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
          userId: carts.userId,
          isClosed: carts.isClosed,
        })
        .from(carts)
        .where(eq(carts.id, Number(cartId)));
  
  // Filter for current user or carts without userId (old carts)
  const userCart = dbCartItemsObj.find(cart => 
    cart.userId === user.id || cart.userId === null
  );
  
  let cartItems: CartItem[] = [];
  // Don't show items if cart is closed (purchase completed)
  if (userCart && userCart.items && !userCart.isClosed) {
    try {
      // Handle both string and already-parsed object cases
      if (typeof userCart.items === 'string') {
        cartItems = JSON.parse(userCart.items) as CartItem[];
      } else {
        cartItems = userCart.items as CartItem[];
      }
    } catch (error) {
      console.error('Error parsing cart items:', error);
      cartItems = [];
    }
  }

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
      storeId: products.storeId,
      images: products.images,
      storeName: stores.name,
    })
    .from(products)
    .leftJoin(stores, eq(products.storeId, stores.id))
    .where(inArray(products.id, productIds));
  return vals as CartLineItemDetails[];
}

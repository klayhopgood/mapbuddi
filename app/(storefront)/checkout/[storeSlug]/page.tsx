import { createPaymentIntent } from "@/server-actions/stripe/payment";
import CheckoutWrapper from "../components/checkout-wrapper";
import { cookies } from "next/headers";
import { getCart } from "@/server-actions/get-cart-details";
import { db } from "@/db/db";
import { payments, locationLists, stores } from "@/db/schema";
import { eq } from "drizzle-orm";
import { CheckoutItem } from "@/lib/types";
import { CartLineItems } from "@/components/storefront/cart-line-items";
import { InfoCard } from "@/components/admin/info-card";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import Link from "next/link";
import { hasConnectedStripeAccount } from "@/server-actions/stripe/account";

export default async function Page({
  params,
}: {
  params: { storeSlug: string };
}) {
  const cartId = cookies().get("cartId")?.value;
  const { cartItems, cartItemDetails } = await getCart(Number(cartId));

  const store = await db
    .select({
      storeId: stores.id,
      stripeAccountId: payments.stripeAccountId,
    })
    .from(stores)
    .leftJoin(payments, eq(payments.storeId, stores.id))
    .where(eq(stores.slug, params.storeSlug));

  const storeId = Number(store[0].storeId);
  const storeStripeAccountId = store[0].stripeAccountId;

  const storeLists = await db
    .select({
      id: locationLists.id,
      price: locationLists.price,
    })
    .from(locationLists)
    .leftJoin(stores, eq(locationLists.storeId, stores.id))
    .where(eq(stores.id, storeId));

  // Check if items from this store are in the cart
  const detailsOfListsInCart = cartItems
    .map((item) => {
      const list = storeLists.find((l) => l.id === item.id);
      const priceAsNumber = Number(list?.price);
      if (!list || isNaN(priceAsNumber)) return undefined;
      return {
        id: item.id,
        price: priceAsNumber,
        qty: item.qty,
      };
    })
    .filter(Boolean) as CheckoutItem[];

  if (
    !storeStripeAccountId ||
    !(await hasConnectedStripeAccount(storeId))
  ) {
    return (
      <InfoCard
        heading="Online payments not setup"
        subheading="This seller does not have online payments setup yet. Please contact the seller directly to submit your order."
        icon={<AlertCircle size={24} />}
        button={
          <Link href={routes.cart}>
            <Button>Return to cart</Button>
          </Link>
        }
      />
    );
  }

  if (!storeLists.length || isNaN(storeId)) {
    throw new Error("Store not found");
  }

  if (!detailsOfListsInCart.length) {
    return (
      <InfoCard
        heading="No items from this store"
        subheading="Your cart doesn't contain any location lists from this store. Add some lists first!"
        icon={<AlertCircle size={24} />}
        button={
          <Link href={routes.cart}>
            <Button>Return to cart</Button>
          </Link>
        }
      />
    );
  }

  const paymentIntent = createPaymentIntent({
    items: detailsOfListsInCart,
    storeId,
  });

  return (
    <CheckoutWrapper
      detailsOfProductsInCart={detailsOfListsInCart}
      paymentIntent={paymentIntent}
      storeStripeAccountId={storeStripeAccountId}
      cartLineItems={
        <CartLineItems
          variant="checkout"
          cartItems={cartItems}
          lists={
            cartItemDetails?.filter((item) => item.storeId === storeId) ?? []
          }
        />
      }
    />
  );
}

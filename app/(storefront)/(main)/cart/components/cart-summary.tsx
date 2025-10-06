"use client";

import { Heading } from "@/components/ui/heading";
import { useCurrency } from "@/hooks/use-currency";
import { CartItem, CartLineItemDetails } from "@/lib/types";
import { CheckoutButton } from "../components/checkout-button";

interface CartSummaryProps {
  uniqueStoreIds: number[];
  cartItems: CartItem[];
  cartItemDetails: CartLineItemDetails[];
}

export function CartSummary({ uniqueStoreIds, cartItems, cartItemDetails }: CartSummaryProps) {
  const { formatDisplayPrice } = useCurrency();

  return (
    <div className="bg-secondary col-span-3 rounded-md border border-border p-6 h-fit flex flex-col gap-4">
      <Heading size="h3">Cart Summary</Heading>
      {uniqueStoreIds.map((storeId, i) => (
        <div
          key={i}
          className="flex items-center border-b border-border pb-2 gap-4 flex-nowrap overflow-auto"
        >
          <p className="font-semibold">
            {
              cartItemDetails?.find((item) => item.storeId === storeId)
                ?.storeName
            }
          </p>
          <p>
            {formatDisplayPrice(
              cartItemDetails
                .filter((item) => item.storeId === storeId)
                .reduce((accum, curr) => {
                  const quantityInCart = cartItems.find(
                    (item) => item.id === curr.id
                  )?.qty;
                  return accum + Number(curr.price) * (quantityInCart ?? 0);
                }, 0)
            )}
          </p>
          <CheckoutButton storeId={storeId} />
        </div>
      ))}
    </div>
  );
}

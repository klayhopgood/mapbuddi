"use client";

import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ProductForm } from "./product-form";
import { type addToCart } from "@/server-actions/add-to-cart";

export const OwnerAwareCartForm = (props: {
  addToCartAction: typeof addToCart;
  productId: number;
  productName: string | null;
  ownerId: string | null;
  buttonSize?: "default" | "sm";
}) => {
  const { user } = useUser();
  
  // Check if current user owns this list
  const isOwnList = user?.id === props.ownerId;

  if (isOwnList) {
    return (
      <Button 
        size={props.buttonSize ?? "default"} 
        variant="secondary" 
        className="w-full" 
        disabled
      >
        Your List
      </Button>
    );
  }

  return (
    <ProductForm
      addToCartAction={props.addToCartAction}
      productId={props.productId}
      productName={props.productName}
      buttonSize={props.buttonSize}
    />
  );
};

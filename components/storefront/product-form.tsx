"use client";

import { useTransition } from "react";
import { Button } from "../ui/button";
import { type addToCart } from "@/server-actions/add-to-cart";
import { toast } from "../ui/use-toast";
import { ToastAction } from "../ui/toast";
import { routes } from "@/lib/routes";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

export const ProductForm = (props: {
  addToCartAction: typeof addToCart;
  productId: number;
  productName: string | null;
  buttonSize?: "default" | "sm";
}) => {
  let [isPending, startTransition] = useTransition();
  const { isSignedIn, user } = useUser();

  const handleAddToCart = () => {
    if (!isSignedIn) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add items to your cart.",
        action: (
          <Link href={routes.signIn}>
            <ToastAction altText="Sign in">Sign In</ToastAction>
          </Link>
        ),
      });
      return;
    }

    startTransition(
      () =>
        void props.addToCartAction({
          id: props.productId,
          qty: 1, // Always quantity 1 for location lists
        })
    );
    
    toast({
      title: "Added to cart",
      description: `${props.productName} has been added to your cart.`,
      action: (
        <Link href={routes.cart}>
          <ToastAction altText="View cart">View</ToastAction>
        </Link>
      ),
    });
  };

  return (
    <Button
      size={props.buttonSize ?? "default"}
      className="w-full"
      disabled={isPending}
      onClick={handleAddToCart}
    >
      {isPending ? "Adding..." : isSignedIn ? "Add to Cart" : "Sign In to Buy"}
    </Button>
  );
};
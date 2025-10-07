"use client";

import { useTransition, useEffect, useState } from "react";
import { Button } from "../ui/button";
import { type addToCart } from "@/server-actions/add-to-cart";
import { toast } from "../ui/use-toast";
import { ToastAction } from "../ui/toast";
import { routes } from "@/lib/routes";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { CartItem } from "@/lib/types";

export const LocationListForm = (props: {
  addToCartAction: typeof addToCart;
  listId: number;
  listName: string | null;
  buttonSize?: "default" | "sm";
  cartItems?: CartItem[];
}) => {
  let [isPending, startTransition] = useTransition();
  const { isSignedIn, user } = useUser();
  const [isInCart, setIsInCart] = useState(false);

  // Check if this item is already in cart
  useEffect(() => {
    if (props.cartItems) {
      const itemInCart = props.cartItems.find(item => item.id === props.listId);
      setIsInCart(!!itemInCart);
    }
  }, [props.cartItems, props.listId]);

  const handleAddToCart = async () => {
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

    try {
      startTransition(async () => {
        await props.addToCartAction({
          id: props.listId,
          qty: 1, // Always quantity 1 for location lists
        });
        setIsInCart(true);
      });
      
      toast({
        title: "Added to cart",
        description: `${props.listName} has been added to your cart.`,
        action: (
          <Link href={routes.cart}>
            <ToastAction altText="View cart">View Cart</ToastAction>
          </Link>
        ),
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add to cart",
        variant: "destructive",
      });
    }
  };

  if (isInCart) {
    return (
      <Link href={routes.cart} className="flex-1">
        <Button
          variant="outline"
          size={props.buttonSize ?? "sm"}
          className="w-full"
        >
          View Cart
        </Button>
      </Link>
    );
  }

  return (
    <Button
      variant="outline"
      size={props.buttonSize ?? "sm"}
      className="w-full"
      disabled={isPending}
      onClick={handleAddToCart}
    >
      {isPending ? "Adding..." : isSignedIn ? "Add to Cart" : "Sign In to Buy"}
    </Button>
  );
};

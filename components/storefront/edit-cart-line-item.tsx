"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "../ui/button";
import { CartItem, CartLineItemDetails } from "@/lib/types";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { updateCart } from "@/server-actions/update-cart";
import { useState } from "react";
import { handleInputQuantity } from "@/lib/utils";
import { toast } from "../ui/use-toast";

export const EditCartLineItem = (props: {
  listInCart: CartItem | undefined;
  list: CartLineItemDetails;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [quantity, setQuantity] = useState<string | number>(
    props.listInCart?.qty ?? 1
  );

  return (
    <>
      <AlertDialog open={isOpen}>
        <Button onClick={() => setIsOpen((prev) => !prev)} variant="outline">
          Edit
        </Button>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit {props.list.name}</AlertDialogTitle>
            <AlertDialogDescription>
              Change the quantity or remove this location list from your cart.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="mb-6">
            <Label className="my-2 block">Quantity</Label>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              onBlur={(e) => handleInputQuantity(e, setQuantity, 0)}
            />
          </div>
          <AlertDialogFooter className="flex items-center justify-between">
            <Button
              variant="destructiveOutline"
              className="mr-auto"
              onClick={() => {
                setIsOpen((prev) => !prev);
                if (props.listInCart) {
                  void updateCart({
                    ...props.listInCart,
                    qty: 0,
                  });
                  toast({
                    title: "Cart updated",
                    description: `${props.list.name} has been removed from your cart.`,
                  });
                }
              }}
            >
              Remove from cart
            </Button>
            <AlertDialogCancel onClick={() => setIsOpen((prev) => !prev)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={!props.listInCart}
              onClick={() => {
                setIsOpen((prev) => !prev);
                if (props.listInCart) {
                  void updateCart({
                    ...props.listInCart,
                    qty: Number(quantity),
                  });
                  toast({
                    title: "Cart updated",
                    description: `${props.list.name} has been updated in your cart.`,
                  });
                }
              }}
            >
              Update
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

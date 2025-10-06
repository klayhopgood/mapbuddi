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
import { updateCart } from "@/server-actions/update-cart";
import { useState } from "react";
import { toast } from "../ui/use-toast";
import { Trash2 } from "lucide-react";

export const EditCartLineItem = (props: {
  listInCart: CartItem | undefined;
  list: CartLineItemDetails;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <AlertDialog open={isOpen}>
        <Button 
          onClick={() => setIsOpen(true)} 
          variant="outline" 
          size="sm"
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 size={16} />
        </Button>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from Cart</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove &quot;{props.list.name}&quot; from your cart?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setIsOpen(false);
                if (props.listInCart) {
                  void updateCart({
                    ...props.listInCart,
                    qty: 0,
                  });
                  toast({
                    title: "Removed from cart",
                    description: `${props.list.name} has been removed from your cart.`,
                  });
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

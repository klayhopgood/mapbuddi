import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { routes } from "@/lib/routes";
import { CartItem, CartLineItemDetails } from "@/lib/types";
import Link from "next/link";
import { Button } from "../ui/button";
import { ProductImage } from "../product-image";
import { EditCartLineItem } from "./edit-cart-line-item";
import { useCurrency } from "@/hooks/use-currency";

export const CartLineItems = (props: {
  cartItems: CartItem[];
  lists: CartLineItemDetails[];
  variant: "cart" | "checkout";
}) => {
  const { formatDisplayPrice } = useCurrency();
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Cover</TableHead>
          <TableHead>List Name</TableHead>
          {props.variant === "cart" ? (
            <>
              <TableHead>Price</TableHead>
              <TableHead>Quantity</TableHead>
            </>
          ) : (
            <>
              <TableHead>Quantity</TableHead>
              <TableHead className="text-right">Price</TableHead>
            </>
          )}
          {props.variant === "cart" ? <TableHead>Total</TableHead> : null}
        </TableRow>
      </TableHeader>
      <TableBody>
        {props.lists.map((list) => {
          const currentListInCart = props.cartItems.find(
            (item) => item.id === list.id
          );
          return (
            <TableRow key={list.id}>
              <TableCell className="font-medium">
                <ProductImage
                  src={list.coverImage[0]?.url}
                  alt={list.coverImage[0]?.alt}
                  sizes="50px"
                  height="h-[50px]"
                  width="w-[50px]"
                />
              </TableCell>
              <TableCell className="max-w-[200px] w-[200px] truncate">
                {props.variant === "cart" ? (
                  <Link href={`${routes.list}/${list.id}`}>
                    <Button className="m-0 p-0 h-auto" variant="link">
                      {list.name}
                    </Button>
                  </Link>
                ) : (
                  <Button
                    className="m-0 p-0 h-auto hover:no-underline hover:cursor-auto"
                    variant="link"
                  >
                    {list.name}
                  </Button>
                )}
              </TableCell>
              {props.variant === "cart" ? (
                <>
                  <TableCell>
                    {formatDisplayPrice(Number(list.price))}
                  </TableCell>
                  <TableCell>{currentListInCart?.qty}</TableCell>
                </>
              ) : (
                <>
                  <TableCell>{currentListInCart?.qty}</TableCell>
                  <TableCell className="text-right">
                    {formatDisplayPrice(Number(list.price))}
                  </TableCell>
                </>
              )}
              {props.variant === "cart" ? (
                <TableCell>
                  {formatDisplayPrice(
                    Number(currentListInCart?.qty) * Number(list.price)
                  )}
                </TableCell>
              ) : null}
              {props.variant === "cart" ? (
                <TableCell className="text-right">
                  <EditCartLineItem
                    listInCart={currentListInCart}
                    list={list}
                  />
                </TableCell>
              ) : null}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

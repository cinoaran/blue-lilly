import React from "react";
import type {
  Cart,
  CartItem,
  Option,
  Variant,
  Product,
} from "@/generated/prisma/browser";
import CartItemCard from "./CartItemCard";

type CartWithItems = Cart & {
  items: (CartItem & {
    option:
      | (Option & {
          variant?: (Variant & {product?: Product | null}) | null;
        })
      | null;
  })[];
};

type Props = {items: CartWithItems["items"]};

export function CartItemList({items}: Props) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="border-b pb-3">
          <CartItemCard item={item} />
        </div>
      ))}
    </div>
  );
}

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

type Props = {
  items: CartWithItems["items"];
  // mode controls layout: 'vertical' for sheet, 'horizontal' for /cart
  mode?: "vertical" | "horizontal";
};

export function CartItemList({items, mode = "horizontal"}: Props) {
  if (!items || items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Dein Warenkorb ist leer.</p>
    );
  }

  return (
    <div
      className={
        mode === "horizontal"
          ? "flex flex-col gap-4 "
          : "flex flex-col items-center gap-3 w-[90%] bg-card/80 border-[0.3px] border-border"
      }
    >
      {items.map((item) => (
        <div
          key={item.id}
          className="flex flex-col md:flex-row gap-4 rounded-lg text-sm md:text-md p-1 md:p-1"
        >
          <CartItemCard item={item} mode={mode as "vertical" | "horizontal"} />
        </div>
      ))}
    </div>
  );
}

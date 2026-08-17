"use client";

import React from "react";
import {CartItemList} from "./CartItemList";
import type {
  Cart,
  CartItem,
  Option,
  Variant,
  Product,
} from "@/generated/prisma/browser";

type CartWithItems = Cart & {
  items: (CartItem & {
    option:
      | (Option & {
          variant?: (Variant & {product?: Product | null}) | null;
        })
      | null;
  })[];
};

export function CartSheetContent({
  initialCart,
  mode = "vertical",
}: {
  initialCart?: CartWithItems | null;
  mode?: "vertical" | "horizontal";
}) {
  const cart = initialCart ?? null;

  if (!cart || cart.items.length === 0) {
    return (
      <p className="container mx-auto bg-primary/10 w-70 p-5 rounded-md text-sm text-muted-foreground text-center">
        Der Warenkorb ist leer.
      </p>
    );
  }

  // For the sheet we prefer vertical stacking by default
  return <CartItemList items={cart.items} mode={mode} />;
}

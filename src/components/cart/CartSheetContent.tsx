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
}: {
  initialCart?: CartWithItems | null;
}) {
  const cart = initialCart ?? null;

  if (!cart || cart.items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Dein Warenkorb ist leer.</p>
    );
  }

  return <CartItemList items={cart.items} />;
}

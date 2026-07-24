"use client";

import React, {ReactNode, useState} from "react";
import {CartSheet} from "@/components/shared/sheet/CartSheet";
import ShoppingCartButton from "../shared/cart/ShoppingCartButton";
import type {Cart, CartItem} from "@/generated/prisma/browser";

type CartWithItems = Cart & {
  items: (CartItem & {quantity: number})[];
};

type Props = {
  children?: ReactNode;
  initialCart?: CartWithItems | null;
};

export function NavbarCartClient({children, initialCart}: Props) {
  const [open, setOpen] = useState(false);

  const count =
    initialCart?.items?.reduce((sum, it) => sum + (it.quantity ?? 0), 0) ?? 0;

  return (
    <>
      <ShoppingCartButton onClick={() => setOpen(true)} count={count} />

      <CartSheet open={open} onOpenChange={setOpen}>
        {children}
      </CartSheet>
    </>
  );
}

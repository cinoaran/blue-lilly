"use client";

import React, {type ComponentProps} from "react";
import {CartItemList} from "./CartItemList";
import type {
  CartItem,
  Option,
  Variant,
  Product,
} from "@/generated/prisma/browser";

type ItemType = CartItem & {
  // incoming serialized/server items may have `option` missing (undefined)
  // ensure we accept that shape here
  option?:
    | (Option & {variant?: (Variant & {product?: Product | null}) | null})
    | null;
};

type CartItemListProps = ComponentProps<typeof CartItemList>;
type CartItemListItems = CartItemListProps["items"];

type Props = {
  items: ItemType[];
};

export default function CartClientWrapper({items}: Props) {
  // Normalize items so `option` is never `undefined` (CartItemList expects
  // `option` to be present and either an object or null)
  const safeItems = (items ?? []).map((it) => ({
    ...(it as Record<string, unknown>),
    option: (it as ItemType).option ?? null,
  })) as unknown as CartItemListItems;

  return (
    <div className="flex flex-col gap-4 border-[0.3px] border-border border-b rounded-md">
      <CartItemList items={safeItems} />
    </div>
  );
}

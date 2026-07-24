"use client";

import Image from "next/image";
import React, {useState} from "react";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import {updateCartItem} from "@/actions/cart/updateCartItem";
import {removeCartItem} from "@/actions/cart/removeCartItem";
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
          // The generated `Product` type from Prisma doesn't include relation fields
          // like `variants` by default in some selections. Locally extend Product
          // to optionally include `variants` so the component can safely access
          // `product.variants` without modifying generated types.
          variant?:
            | (Variant & {product?: (Product & {variants?: Variant[]}) | null})
            | null;
        })
      | null;
  })[];
};

type Item = CartWithItems["items"][number];

export default function CartItemCard({
  item,
  onQuantityChange,
  onRemove,
}: {
  item: Item;
  onQuantityChange?: (itemId: string, quantity: number) => void;
  onRemove?: (itemId: string) => void;
}) {
  const [quantity, setQuantity] = useState<number>(item.quantity ?? 1);
  const [removed, setRemoved] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const imageUrl =
    item.option?.image?.[0] ??
    item.option?.variant?.product?.variants?.[0]?.id ??
    null;

  // Determine price: prefer stored cart item unitPrice, fall back to option's sellPrice
  const displayPrice = item.unitPrice ?? item.option?.sellPrice ?? null;

  // Available stock from option (if provided)
  const available = item.option?.quantity ?? Infinity;

  function updateQuantity(newQty: number) {
    // clamp to [1, available]
    const bounded = Math.max(
      1,
      Math.min(newQty, Number.isFinite(available) ? available : newQty),
    );
    if (bounded === quantity) return;

    setQuantity(bounded);
    onQuantityChange?.(item.id, bounded);
    setUpdating(true);

    // Persist change via server action
    updateCartItem(item.id, bounded)
      .then(() => router.refresh())
      .catch(() => {
        // revert on error
        setQuantity(item.quantity ?? 1);
      })
      .finally(() => setUpdating(false));
  }

  if (removed) return null;

  console.log("CartItemCard item:", item);

  return (
    <div className="flex flex-col gap-4 items-center justify-center">
      <div className="flex flex-col items-center gap-2 font-medium">
        <span>{item.option?.variant?.product?.name ?? "Produkt"}</span>
        <span className="text-sm text-muted-foreground">
          Größe: {item.option?.variant?.size ?? "-"}
        </span>
      </div>
      <div className="text-sm">
        Preis pro Stck.: {displayPrice ? `${String(displayPrice)} €` : "n/a"}
      </div>
      <div className="w-26 h-26 relative bg-muted rounded overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={item.option?.variant?.product?.name ?? "Produkt"}
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-sm text-muted-foreground">
            Bild
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="mt-2 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="default"
              onClick={() => updateQuantity(quantity - 1)}
              disabled={updating || deleting || quantity <= 1}
            >
              -
            </Button>
            <div className="px-3">{quantity}</div>
            <Button
              size="sm"
              variant="default"
              onClick={() => updateQuantity(quantity + 1)}
              disabled={
                updating ||
                deleting ||
                (Number.isFinite(available) ? quantity >= available : false)
              }
            >
              +
            </Button>
          </div>
        </div>
      </div>
      {Number.isFinite(available) && (
        <div className="text-xs text-muted-foreground mt-1">
          {quantity >= available
            ? `Nur ${available} verfügbar`
            : `Verfügbar: ${available}`}
        </div>
      )}

      <div>
        <Button
          size="sm"
          variant="default"
          disabled={deleting || updating}
          onClick={() => {
            onRemove?.(item.id);
            setDeleting(true);
            removeCartItem(item.id)
              .then(() => {
                setRemoved(true);
                router.refresh();
              })
              .catch(() => {
                /* noop */
              })
              .finally(() => setDeleting(false));
          }}
        >
          {deleting ? "Lösche…" : "Produkt entfernen"}
        </Button>
      </div>
    </div>
  );
}

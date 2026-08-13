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
import Link from "next/link";
import {Tooltip, TooltipTrigger, TooltipContent} from "@/components/ui/tooltip";

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
  mode,
  onQuantityChange,
  onRemove,
}: {
  item: Item;
  mode: "vertical" | "horizontal";
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

  function slugify(str: string) {
    return String(str)
      .toLowerCase()
      .trim()
      .replace(/['"]/g, "")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-]+/g, "-")
      .replace(/\-+/g, "-")
      .replace(/^\-+|\-+$/g, "");
  }

  const productName =
    item.option?.variant?.product?.name ??
    item.option?.variant?.product?.id ??
    "";
  const params = new URLSearchParams();
  if (item.option?.variant?.size)
    params.set("size", String(item.option?.variant?.size));
  if (item.option?.id) params.set("optionId", item.option.id);
  const productHref = `/product/${slugify(productName)}${
    params.toString() ? `?${params.toString()}` : ""
  }`;

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

  return (
    <div
      className={`flex items-center ${mode === "vertical" ? "flex-col items-center justify-center gap-2 border-[0.3px] border-border w-full px-12 py-6" : "flex-col bg-card lg:flex-row justify-between w-full p-2 rounded-md gap-4"}`}
    >
      {/* Image */}
      <div className="size-42 relative overflow-hidden">
        <Tooltip>
          <Link
            href={productHref || ""}
            className="block w-full h-full relative"
          >
            <TooltipTrigger asChild>
              <Image
                src={imageUrl || "/images/placeholder.png"}
                alt={item.option?.variant?.product?.name ?? "Produkt"}
                fill
                sizes="(max-width: 640px) 96px, 192px"
                className="object-contain"
              />
            </TooltipTrigger>
          </Link>

          <TooltipContent side="bottom" align="center" sideOffset={1}>
            Zurück zur Produktübersicht
          </TooltipContent>
        </Tooltip>
        {!imageUrl && (
          <div className="w-full h-full bg-transparent flex items-center justify-center text-sm text-muted-foreground">
            <Image
              src={"/images/placeholder.png"}
              alt={item.option?.variant?.product?.name ?? "Produkt"}
              fill
              sizes="(max-width: 640px) 96px, 192px"
              className="object-contain"
            />
          </div>
        )}
      </div>

      {/* Left details */}
      <div className="flex flex-col gap-3 w-full">
        <div className="font-medium text-center">
          {item.option?.variant?.product?.name ?? "Produkt"}
        </div>
        <div className="flex items-center justify-between gap-2 border-b-[0.3px] border-border border-dotted p-2">
          <div className="text-sm text-muted-foreground">Größe</div>
          <div className="text-sm text-muted-foreground">
            {item.option?.variant?.size ?? "-"}
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 border-b-[0.3px] border-border border-dotted p-2">
          <div className="text-sm">Preis</div>
          <div className="font-medium">
            {displayPrice ? `${String(displayPrice)} €` : "n/a"}
          </div>
        </div>
      </div>
      {mode === "vertical" && <div className="w-full my-1" />}

      {/* Right: counter + remove */}
      <div className="flex flex-col items-center justify-center gap-4">
        <div>Menge wechseln</div>
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

        <div>
          <Button
            size="sm"
            variant="outline"
            className="text-sm"
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
    </div>
  );
}

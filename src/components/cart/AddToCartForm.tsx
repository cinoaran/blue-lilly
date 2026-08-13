"use client";

import {addToCart} from "@/actions/cart/addToCart";
import {useFormStatus} from "react-dom";
import formatPrice from "@/helpers/products/formatPrice";
import React, {useEffect, useState} from "react";

export function AddToCartForm({
  optionId,
  quantity = 1,
  price,
  available,
}: {
  optionId: string;
  quantity?: number;
  price?: number | null;
  available?: number | null | undefined;
}) {
  const {pending} = useFormStatus();
  const action = addToCart.bind(null, optionId, quantity);

  const [localAvailable, setLocalAvailable] = useState<
    number | null | undefined
  >(available ?? null);

  useEffect(() => {
    setLocalAvailable(available ?? null);
  }, [available]);

  // when pending changes to true (a submit started), optimistically reduce available
  useEffect(() => {
    if (pending) {
      if (typeof localAvailable === "number") {
        setLocalAvailable((prev) => Math.max(0, (prev ?? 0) - quantity));
      }
    }
  }, [pending, quantity, localAvailable]);

  const cannotAdd =
    typeof localAvailable === "number" && localAvailable < quantity;

  return (
    <form action={action}>
      <button
        type="submit"
        disabled={pending || cannotAdd}
        className={`w-full text-center px-3 py-0 rounded-md text-lg font-semibold uppercase transition ${
          cannotAdd
            ? "bg-muted text-muted-foreground cursor-not-allowed"
            : "bg-primary text-white hover:bg-primary/90"
        }`}
      >
        <div className="flex items-center justify-center gap-5">
          <h4 className="text-white">
            {pending ? "Wird hinzugefügt..." : "IN DEN WARENKORB"}
          </h4>
          <span className="flex items-center justify-center pl-7 py-2 border-l border-border ">
            {cannotAdd ? (
              <span className="text-red-600 font-bold">
                Keine Verfügbarkeit mehr!
              </span>
            ) : (
              <>FOR {price != null ? `${formatPrice(price)}` : ""}</>
            )}
          </span>
        </div>
      </button>
      {/* availability UI moved into the price span; no separate availability text */}
    </form>
  );
}

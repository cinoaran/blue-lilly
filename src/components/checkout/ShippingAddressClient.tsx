"use client";

import React, {useState} from "react";
import ShippingAddress from "@/app/(root)/checkout/_components/ShippingAddress";
import type {Address} from "@/generated/prisma/browser";
import type {AddressPayload} from "@/types/address";

export default function ShippingAddressClient({
  addresses,
  cartId,
  items,
  clientPreview,
  isLoggedIn,
}: {
  addresses: Address[];
  cartId?: string | null;
  items?: {optionId: string; quantity: number; unitPriceCents?: number}[];
  clientPreview?: {
    itemsTotalCents: number;
    shippingCents: number;
    totalCents: number;
  };
  isLoggedIn?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serverErrors, setServerErrors] = useState<
    Record<string, string> | undefined
  >(undefined);

  type CheckoutNextData = {
    billingId?: string;
    shippingId?: string;
    billing?: AddressPayload;
    shipping?: AddressPayload;
    sameAsBilling: boolean;
  };

  async function handleNext(data: CheckoutNextData) {
    try {
      setLoading(true);
      setError(null);
      setServerErrors(undefined);

      // If user chose sameAsBilling, prefer sending billingId as shippingId
      const transformed = {...data};
      if (transformed.sameAsBilling) {
        if (transformed.billingId && !transformed.shippingId) {
          transformed.shippingId = transformed.billingId;
          delete transformed.shipping;
        } else if (transformed.billing && !transformed.shipping) {
          // send shipping explicitly as copy of billing when no ids
          transformed.shipping = transformed.billing;
        }
      }

      const payload = {
        cartId,
        items,
        clientPreview,
        ...transformed,
      };

      console.log("checkout payload:", payload);

      const res = await fetch("/api/stripe/checkout/create-session", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        if (json?.error === "validation" && json?.serverErrors) {
          setServerErrors(json.serverErrors as Record<string, string>);
          setLoading(false);
          return;
        }
        setError(json?.error || "Fehler beim Erstellen der Checkout-Session");
        setLoading(false);
        return;
      }

      if (json.url) {
        window.location.href = json.url;
      } else {
        setError("Checkout-URL fehlt");
      }
    } catch (err) {
      console.error(err);
      setError("Netzwerkfehler");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-card/80 rounded-md p-2 flex flex-col gap-4">
      {error && <div className="text-destructive text-sm mb-2">{error}</div>}
      <ShippingAddress
        addresses={addresses}
        onNext={handleNext}
        serverErrors={serverErrors}
        isLoggedIn={isLoggedIn}
      />
      {loading && <div className="mt-2 text-sm">Weiterleitung zu Stripe…</div>}
    </div>
  );
}

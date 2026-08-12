import React from "react";
import {getCart} from "@/actions/cart/getCarts";
import Link from "next/link";
import CartClient from "@/components/cart/CartClientWrapper";
import formatPrice from "@/helpers/products/formatPrice";
import {Euro, Sigma, Truck} from "lucide-react";
import ShippingAddressClient from "@/components/checkout/ShippingAddressClient";
import prisma from "@/lib/prisma";
import type {Address} from "@/generated/prisma/browser";
import {convertDecimalToNumber} from "@/helpers";
import {auth} from "@/lib/auth";
import {headers} from "next/headers";

export default async function CartPage() {
  const cart = await getCart();
  const items = cart?.items ?? [];

  function hasToNumber(x: unknown): x is {toNumber: () => number | string} {
    return (
      typeof x === "object" &&
      x !== null &&
      typeof (x as {toNumber?: unknown}).toNumber === "function"
    );
  }

  function toNumber(v: unknown): number {
    if (v == null) return 0;
    if (typeof v === "number") return v;
    if (hasToNumber(v)) {
      try {
        const n = v.toNumber();
        return typeof n === "number" ? n : Number(n);
      } catch {
        return Number(String(v)) || 0;
      }
    }
    return Number(v) || 0;
  }

  const subtotal = items.reduce((acc, it) => {
    const price = toNumber(it.unitPrice ?? it.option?.sellPrice ?? 0);
    const qty = toNumber(it.quantity ?? 1);
    return acc + price * qty;
  }, 0);

  const shipping = subtotal < 100 ? 4.9 : 0;
  const total = subtotal + shipping;

  // Serialize items to plain objects for passing into Client Components.
  // Prisma returns Decimal and Date objects which cannot be transferred
  // directly to client components. Convert Decimals to numbers and Dates
  // to ISO strings using JSON stringify/parse with a replacer.
  function isDecimalLike(v: unknown): v is {toNumber: () => number} {
    if (v == null || typeof v !== "object") return false;
    const maybe = v as {[k: string]: unknown};
    return typeof maybe.toNumber === "function";
  }

  const serializableItems = JSON.parse(
    JSON.stringify(items, (_key, value) => {
      if (value && typeof value === "object") {
        if (isDecimalLike(value)) {
          try {
            return Number(value.toNumber());
          } catch {
            return String(value);
          }
        }
        if (value instanceof Date) {
          return value.toISOString();
        }
      }
      return value;
    }),
  );

  // Get session and addresses server-side so we can pass login state to client
  const hdrs = await headers();
  const session = await auth.api.getSession({headers: hdrs});
  const userId = session?.user?.id ?? null;
  const addrs = userId ? await prisma.address.findMany({where: {userId}}) : [];
  const serializableAddresses = convertDecimalToNumber(addrs) as typeof addrs;

  return (
    <div className="container mx-auto px-2 md:px-0 py-8">
      <h1 className="text-left text-3xl font-semibold mb-4">Warenkorb</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-2">
          {items.length === 0 ? (
            <div className="p-6 border-[0.3px] border-border rounded text-center">
              Dein Warenkorb ist leer.
              <div className="mt-4">
                <Link
                  href="/"
                  className="inline-block px-4 py-2 bg-black text-white rounded"
                >
                  Zurück zum Shop
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex-2 flex flex-col gap-4">
              <CartClient items={serializableItems} />
            </div>
          )}
        </div>
        <div className="md:col-span-2">
          {items.length > 0 && (
            <aside className="border-[0.3px] border-border rounded w-full p-1">
              <div className="flex flex-col gap-4 bg-card/80 rounded-md p-2">
                <h3 className="text-sm md:text-lg font-medium mb-4">
                  Übersicht (alle Preise inkl. MwSt.)
                </h3>
                <div className="flex items-center justify-between gap-2 mb-4 text-xs md:text-md">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Euro className="bg-background/20 p-1 border-[0.3px] border-border text-foreground rounded-sm inline-block" />
                    Summe
                  </div>
                  <div className="font-medium">{formatPrice(subtotal)}</div>
                </div>

                <div className="flex items-center justify-between gap-2 mb-4 text-xs md:text-md">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Truck className="bg-background/20 p-1 border-[0.3px] border-border text-foreground rounded-sm inline-block" />
                    Versand
                  </div>
                  <div className="font-medium">{formatPrice(shipping)}</div>
                </div>

                <hr className="border-t-[0.3px] border-border pt-4 mt-4" />
                <div className="flex flex-col md:flex-row items-center justify-center md:justify-between gap-2 mb-4 text-xs md:text-md">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Sigma className="bg-background/20 p-1 border-[0.3px] border-border text-foreground rounded-sm inline-block" />
                    Gesamt inkl. MwSt.
                  </div>
                  <div className="font-semibold">{formatPrice(total)}</div>
                </div>
                <hr className="border-t-[0.3px] border-border pt-4 mt-4" />
                <div className="my-3 text-center">
                  <Link
                    href="/"
                    className="py-2 px-3 md:px-5 border-[0.3px] border-border rounded-md text-xs text-muted-foreground underlined"
                  >
                    Weiter einkaufen
                  </Link>
                </div>

                <div className="mt-4">
                  {/* Fetch server-side addresses and pass to client wrapper */}
                  {/* compute preview in cents for client */}

                  <ShippingAddressClient
                    addresses={serializableAddresses as Address[]}
                    isLoggedIn={!!userId}
                    cartId={cart?.id}
                    items={serializableItems}
                    clientPreview={{
                      itemsTotalCents: Math.round(subtotal * 100),
                      shippingCents: Math.round(shipping * 100),
                      totalCents: Math.round(total * 100),
                    }}
                  />
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

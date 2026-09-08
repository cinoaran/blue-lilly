import ShippingAddressClient from "@/components/checkout/ShippingAddressClient";
import prisma from "@/lib/prisma";
import {headers} from "next/headers";
import {getSessionOnce} from "@/lib/session/sessionCache";
import {redirect} from "next/navigation";
import type {Cart} from "@/generated/prisma/browser";
import type {Address} from "@/generated/prisma/browser";

export default async function CheckoutPage() {
  const hdrs = await headers();
  const session = await getSessionOnce({headers: hdrs});

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [addresses, cartResult] = await Promise.all([
    prisma.address.findMany({
      where: {userId: session.user.id},
      orderBy: {createdAt: "desc"},
    }),
    prisma.cart.findFirst({
      where: {userId: session.user.id, status: "ACTIVE"},
      include: {
        items: {
          include: {
            option: {
              include: {
                variant: {
                  include: {
                    product: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
  ]);
  if (!cartResult) {
    // kein Warenkorb vorhanden -> zurück zur Cart-Seite
    redirect("/cart");
  }

  // Stelle sicher, dass `items` immer vorhanden ist (Prisma kann ggf. undefined zurückgeben)
  const cart = {...cartResult, items: cartResult.items ?? []} as Cart;

  // Serialize addresses to plain objects that can be passed to client components
  const serializableAddresses = addresses.map((a) => ({
    id: a.id,
    firstName: a.firstName,
    lastName: a.lastName,
    company: a.company ?? null,
    addressLine1: a.addressLine1,
    addressLine2: a.addressLine2 ?? null,
    postalCode: a.postalCode,
    city: a.city,
    country: a.country,
    phone: a.phone ?? null,
    email: a.email ?? null,
  }));

  // Prepare items and client preview (subtotal/shipping/total) for the client
  const items = (cartResult.items ?? []).map((it) => ({
    optionId: it.optionId ?? it.option?.id ?? "",
    quantity: it.quantity,
    unitPriceCents: Math.round(
      Number(it.unitPrice ?? it.option?.sellPrice ?? 0) * 100,
    ),
  }));

  const subtotal = (items || []).reduce(
    (s, it) => s + (Number(it.unitPriceCents ?? 0) * (it.quantity ?? 1)) / 100,
    0,
  );
  const shipping = subtotal < 100 ? 4.9 : 0;
  const total = subtotal + shipping;

  return (
    <ShippingAddressClient
      addresses={serializableAddresses as Address[]}
      cartId={cart.id}
      items={items}
      clientPreview={{
        itemsTotalCents: Math.round(subtotal * 100),
        shippingCents: Math.round(shipping * 100),
        totalCents: Math.round(total * 100),
      }}
    />
  );
}

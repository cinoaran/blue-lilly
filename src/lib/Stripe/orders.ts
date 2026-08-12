import prisma from "@/lib/prisma";
import {stripe} from "./client";

type CreateCheckoutParams = {
  orderId: string;
  userId?: string | null;
  shippingAddressId?: string | null;
  billingAddressId?: string | null;
  guestEmail?: string | null;
};

export async function createStripeCheckout({
  orderId,
  userId,
  shippingAddressId,
  billingAddressId,
  guestEmail,
}: CreateCheckoutParams) {
  // Load existing order (created by the caller) and use it to create the Stripe session
  const order = await prisma.order.findUnique({
    where: {id: orderId},
    include: {items: true},
  });

  if (!order) {
    throw new Error("Order not found");
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    `http://localhost:${process.env.PORT ?? 3000}`;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${baseUrl}/checkout/success?orderId=${order.id}`,
    cancel_url: `${baseUrl}/cart`,
    metadata: {
      orderId: order.id,
      userId: userId ?? null,
      shippingAddressId: shippingAddressId ?? null,
      billingAddressId: billingAddressId ?? null,
      guestEmail: guestEmail ?? null,
    },
    line_items: order.items.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: "eur",
        unit_amount: item.priceAtOrder,
        product_data: {
          name: item.nameAtOrder,
          metadata: {
            sku: item.skuAtOrder ?? "",
            productId: item.productIdAtOrder ?? "",
          },
        },
      },
    })),
  });

  if (!session.url) {
    throw new Error("Stripe checkout URL missing");
  }

  await prisma.order.update({
    where: {id: order.id},
    data: {
      stripeSessionId: session.id,
    },
  });

  // Cart is marked ORDERED by caller after creating the Stripe session

  return session.url;
}

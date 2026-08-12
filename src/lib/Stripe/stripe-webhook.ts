import Stripe from "stripe";
import prisma from "@/lib/prisma";
import {stripe} from "./client";

export function constructStripeEvent(
  payload: string,
  signature: string | null,
) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("Missing Stripe webhook secret (STRIPE_WEBHOOK_SECRET)");
  }
  if (!signature) {
    throw new Error("Missing stripe-signature header");
  }

  return stripe.webhooks.constructEvent(payload, signature, secret);
}

export async function handleStripeEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;

      if (!orderId) return;
      // Persist Stripe identifiers on the Order but KEEP the status as-is (e.g. PENDING)
      const paymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : (session.payment_intent?.id ?? null);

      const stripeSessionId = session.id ?? null;

      await prisma.order.updateMany({
        where: {id: orderId},
        data: {
          stripePaymentIntentId: paymentIntentId,
          stripeSessionId: stripeSessionId,
        },
      });

      // Delete user's cart(s) and cart items so the front-end shows an empty cart after successful checkout
      const userId = session.metadata?.userId;
      const cartId = session.metadata?.cartId;

      const cartIds: string[] = [];
      if (cartId) cartIds.push(cartId);

      if (userId) {
        const userCarts = await prisma.cart.findMany({
          where: {userId, status: "ACTIVE"},
          select: {id: true},
        });
        for (const c of userCarts) {
          if (!cartIds.includes(c.id)) cartIds.push(c.id);
        }
      }

      if (cartIds.length > 0) {
        // perform deletions (order: cart items -> carts)
        const deletedItems = await prisma.cartItem.deleteMany({
          where: {cartId: {in: cartIds}},
        });
        const deletedCarts = await prisma.cart.deleteMany({
          where: {id: {in: cartIds}},
        });

        console.info(
          `Stripe webhook: deleted ${deletedItems.count} cart items and ${deletedCarts.count} carts for cartIds=${cartIds.join(",")}`,
        );
      } else {
        console.info(
          "Stripe webhook: no carts found to delete for this session",
        );
      }

      return;
    }

    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;

      if (!orderId) return;

      await prisma.order.updateMany({
        where: {
          id: orderId,
          status: "PENDING",
        },
        data: {
          status: "CANCELLED",
        },
      });

      return;
    }

    default:
      return;
  }
}

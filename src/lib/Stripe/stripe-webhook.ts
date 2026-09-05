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
      // Persist Stripe identifiers on the Order but KEEP the status as-is (e.g. PENDING_PAYMENT)
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

      // Load order with items to perform inventory adjustments.
      const order = await prisma.order.findUnique({
        where: {id: orderId},
        include: {items: true},
      });

      if (!order) return;

      // Try to atomically decrement option quantities and mark the order as PAID.
      try {
        await prisma.$transaction(async (tx) => {
          for (const it of order.items) {
            if (!it.optionId) continue;
            const res = await tx.option.updateMany({
              where: {id: it.optionId, quantity: {gte: it.quantity}},
              data: {quantity: {decrement: it.quantity}},
            });
            if (res.count === 0) {
              // Cause transaction to fail so all changes roll back
              throw new Error(`OUT_OF_STOCK:${it.optionId}`);
            }
          }

          // All inventory updates succeeded — mark order PAID in the same transaction
          await tx.order.update({where: {id: orderId}, data: {status: "PAID"}});
        });

        // Only after successful inventory booking, delete user's cart(s) so the front-end shows an empty cart
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
      } catch (err) {
        console.error("Stripe webhook: inventory booking failed", err);

        // If inventory booking failed (e.g. OUT_OF_STOCK), set order to CANCELLED (only if still PENDING_PAYMENT)
        try {
          await prisma.order.updateMany({
            where: {id: orderId, status: "PENDING_PAYMENT"},
            data: {status: "CANCELLED"},
          });
        } catch (uErr) {
          console.error("Failed to set order status to CANCELLED", uErr);
        }

        return;
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
          status: "PENDING_PAYMENT",
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

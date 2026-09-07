import Stripe from "stripe";
import fs from "fs";
import path from "path";
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
  // --- DEBUG: persist incoming events for offline inspection (temporary) ---
  try {
    const debugDir = path.resolve(process.cwd(), "tmp");
    if (!fs.existsSync(debugDir)) fs.mkdirSync(debugDir, {recursive: true});
    const id = (event && (event.id ?? Date.now().toString())) as string;
    const filename = path.join(
      debugDir,
      `stripe-event-${Date.now()}-${id}.json`,
    );
    try {
      fs.writeFileSync(
        filename,
        JSON.stringify({receivedAt: new Date().toISOString(), event}, null, 2),
      );
    } catch (e) {
      // best-effort: don't fail webhook processing if debug write fails
      console.error("Failed to write stripe debug event:", e);
    }
  } catch (e) {
    console.error("Failed to prepare stripe debug logging:", e);
  }

  // Helper: process a checkout.session (shared logic)
  async function processCheckoutSession(session: Stripe.Checkout.Session) {
    const orderId = session.metadata?.orderId;
    if (!orderId) return;

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
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      await processCheckoutSession(session);
      return;
    }

    case "payment_intent.succeeded": {
      // Some setups may send payment_intent/charge events instead of checkout.session.completed.
      // Try to find the checkout session tied to this PaymentIntent so we can process the order.
      const pi = event.data.object as Stripe.PaymentIntent;
      const paymentIntentId = typeof pi.id === "string" ? pi.id : null;
      if (!paymentIntentId) return;

      try {
        const sessions = await stripe.checkout.sessions.list({
          payment_intent: paymentIntentId,
          limit: 1,
        });
        const session = sessions.data?.[0];
        if (session) {
          await processCheckoutSession(session);
        } else {
          console.warn(
            "payment_intent.succeeded: no checkout session found for payment_intent",
            paymentIntentId,
          );
        }
      } catch (err) {
        console.error(
          "Failed to lookup checkout session for payment_intent",
          err,
        );
      }

      return;
    }

    case "charge.succeeded": {
      const ch = event.data.object as Stripe.Charge;
      const paymentIntentId =
        typeof ch.payment_intent === "string" ? ch.payment_intent : null;
      if (!paymentIntentId) return;

      try {
        const sessions = await stripe.checkout.sessions.list({
          payment_intent: paymentIntentId,
          limit: 1,
        });
        const session = sessions.data?.[0];
        if (session) {
          await processCheckoutSession(session);
        } else {
          console.warn(
            "charge.succeeded: no checkout session found for payment_intent",
            paymentIntentId,
          );
        }
      } catch (err) {
        console.error(
          "Failed to lookup checkout session for charge payment_intent",
          err,
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

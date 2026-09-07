import {NextRequest, NextResponse} from "next/server";
import fs from "fs";
import path from "path";
import Stripe from "stripe";
import {prisma} from "@/lib/prisma";
import {stripe} from "@/lib/Stripe/client";

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";

if (!WEBHOOK_SECRET && process.env.NODE_ENV !== "production") {
  console.warn(
    "⚠️ STRIPE_WEBHOOK_SECRET is not set. Run `stripe listen --forward-to http://localhost:3000/api/stripe/webhook` and paste the displayed `whsec_...` value into your .env.local as STRIPE_WEBHOOK_SECRET.",
  );
}

const PERMITTED_EVENTS = [
  "checkout.session.completed",
  "payment_intent.succeeded",
  "payment_intent.payment_failed",
  "charge.succeeded",
];

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;

  try {
    event = (stripe as Stripe).webhooks.constructEvent(
      body,
      signature,
      WEBHOOK_SECRET,
    );
    // best-effort: write raw payload + constructed event to tmp/ for offline inspection
    try {
      const debugDir = path.resolve(process.cwd(), "tmp");
      if (!fs.existsSync(debugDir)) fs.mkdirSync(debugDir, {recursive: true});
      const fname = path.join(debugDir, `stripe-raw-${Date.now()}.json`);
      fs.writeFileSync(
        fname,
        JSON.stringify(
          {
            receivedAt: new Date().toISOString(),
            body,
            event: {id: event.id, type: event.type},
          },
          null,
          2,
        ),
      );
    } catch (e) {
      console.error("Failed to write webhook debug file:", e);
    }
  } catch (err) {
    console.error("Webhook signature verification failed", err);
    return new NextResponse(`Webhook Error: ${(err as Error).message}`, {
      status: 400,
    });
  }

  if (!PERMITTED_EVENTS.includes(event.type)) {
    return new NextResponse(`Unhandled event type: ${event.type}`, {
      status: 200,
    });
  }

  // shared processor for a checkout session
  async function processCheckoutSession(session: Stripe.Checkout.Session) {
    const orderId = session.metadata?.orderId;
    if (!orderId) {
      console.warn("processCheckoutSession: no orderId metadata", session.id);
      return;
    }

    // Update stripe ids on the order (use updateMany to be idempotent)
    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : (session.payment_intent?.id ?? null);

    await prisma.order.updateMany({
      where: {id: orderId},
      data: {
        stripePaymentIntentId: paymentIntentId ?? undefined,
        stripeSessionId: session.id ?? undefined,
      },
    });

    const order = await prisma.order.findUnique({
      where: {id: orderId},
      include: {items: true},
    });
    if (!order) {
      console.error("Order not found for webhook", orderId);
      return;
    }

    try {
      await prisma.$transaction(async (tx) => {
        for (const item of order.items) {
          if (!item.optionId) continue;
          const orderedQty = item.quantity;

          const res = await tx.option.updateMany({
            where: {id: item.optionId, quantity: {gte: orderedQty}},
            data: {quantity: {decrement: orderedQty}},
          });

          if (res.count === 0) {
            // insufficient stock -> abort
            throw new Error(`OUT_OF_STOCK:${item.optionId}`);
          }
        }

        await tx.order.update({where: {id: orderId}, data: {status: "PAID"}});
      });

      // delete carts (optional, same logic as before)
      const cartId = session.metadata?.cartId;
      const userId = session.metadata?.userId;
      const cartIds: string[] = [];
      if (cartId) cartIds.push(cartId);
      if (userId) {
        const userCarts = await prisma.cart.findMany({
          where: {userId, status: "ACTIVE"},
          select: {id: true},
        });
        for (const c of userCarts)
          if (!cartIds.includes(c.id)) cartIds.push(c.id);
      }
      if (cartIds.length) {
        await prisma.cartItem.deleteMany({where: {cartId: {in: cartIds}}});
        await prisma.cart.deleteMany({where: {id: {in: cartIds}}});
      }

      console.log("Order processed: PAID", orderId);
    } catch (err) {
      console.error("Inventory booking failed for order", orderId, err);
      // mark order CANCELLED or OUT_OF_STOCK (only when still pending)
      await prisma.order.updateMany({
        where: {id: orderId, status: "PENDING_PAYMENT"},
        data: {status: "OUT_OF_STOCK"},
      });
    }
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await processCheckoutSession(session);
        break;
      }

      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const paymentIntentId = pi.id;
        const sessions = await stripe.checkout.sessions.list({
          payment_intent: paymentIntentId,
          limit: 1,
        });
        const session = sessions.data[0];
        if (session) await processCheckoutSession(session);
        else
          console.warn(
            "No checkout session for payment_intent",
            paymentIntentId,
          );
        break;
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const orderIdFromMeta = pi.metadata?.orderId;
        if (orderIdFromMeta) {
          await prisma.order.updateMany({
            where: {id: orderIdFromMeta},
            data: {status: "PAYMENT_FAILED", stripePaymentIntentId: pi.id},
          });
        } else {
          const sessions = await stripe.checkout.sessions.list({
            payment_intent: pi.id,
            limit: 1,
          });
          const session = sessions.data[0];
          if (session && session.metadata?.orderId) {
            await prisma.order.updateMany({
              where: {id: session.metadata.orderId},
              data: {status: "PAYMENT_FAILED", stripePaymentIntentId: pi.id},
            });
          }
        }
        break;
      }

      case "charge.succeeded": {
        const ch = event.data.object as Stripe.Charge;
        const piId =
          typeof ch.payment_intent === "string" ? ch.payment_intent : null;
        if (piId) {
          const sessions = await stripe.checkout.sessions.list({
            payment_intent: piId,
            limit: 1,
          });
          const session = sessions.data[0];
          if (session) await processCheckoutSession(session);
        }
        break;
      }

      default:
        break;
    }

    return new NextResponse("OK", {status: 200});
  } catch (err) {
    console.error("Webhook handler error", err);
    return new NextResponse("Webhook handler error", {status: 500});
  }
}

import {NextResponse} from "next/server";
import {headers} from "next/headers";
import {
  constructStripeEvent,
  handleStripeEvent,
} from "@/lib/Stripe/stripe-webhook";
import Stripe from "stripe";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const hdrs = await headers();
    const sig = hdrs.get("stripe-signature");

    const event = constructStripeEvent(body, sig) as Stripe.Event;

    const debug =
      process.env.STRIPE_WEBHOOK_DEBUG === "true" ||
      process.env.NODE_ENV !== "production";

    if (debug) {
      console.debug("Stripe webhook received:", {
        id: event.id,
        type: event.type,
        created: event.created,
        livemode: event.livemode,
      });
    }

    // Delegate handling to shared handler (keeps route small and testable)
    await handleStripeEvent(event as Stripe.Event);

    return NextResponse.json({received: true});
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json({error: "Webhook handler failed"}, {status: 400});
  }
}

import {NextRequest, NextResponse} from "next/server";
import {resend} from "@/lib/resend";
import prisma from "@/lib/prisma";

// Use Node runtime because the Resend SDK relies on Node crypto APIs
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    // Raw body is required for signature verification
    const payload = await request.text();

    const svixId = request.headers.get("svix-id") ?? "";
    const svixTimestamp = request.headers.get("svix-timestamp") ?? "";
    const svixSignature = request.headers.get("svix-signature") ?? "";

    if (!process.env.RESEND_WEBHOOK_SECRET) {
      console.error("RESEND_WEBHOOK_SECRET is not set");
      return new NextResponse("Webhook secret not configured", {status: 500});
    }

    // Verify signature using Resend SDK
    let event: any;
    try {
      event = resend.webhooks.verify({
        payload,
        headers: {
          id: svixId,
          timestamp: svixTimestamp,
          signature: svixSignature,
        },
        webhookSecret: process.env.RESEND_WEBHOOK_SECRET,
      });
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return new NextResponse("Invalid signature", {status: 400});
    }

    // Minimal logging - avoid logging full payload in production
    console.log("Resend webhook event:", event.type);

    // Handle important event types
    switch (event.type) {
      case "email.bounced": {
        const email = event.data?.to?.[0];
        if (email) {
          await prisma.newsletterSubscriber.updateMany({
            where: {email},
            data: {status: "BOUNCED"},
          });
        }
        break;
      }

      case "email.complained": {
        const email = event.data?.to?.[0];
        if (email) {
          await prisma.newsletterSubscriber.updateMany({
            where: {email},
            data: {status: "UNSUBSCRIBED"},
          });
        }
        break;
      }

      case "email.delivered":
      case "email.sent":
      case "email.opened":
      case "email.clicked":
        // optional: persist analytics events
        break;

      default:
        break;
    }

    return NextResponse.json({ok: true}, {status: 200});
  } catch (err) {
    console.error("Webhook handling failed:", err);
    return new NextResponse("Invalid webhook", {status: 400});
  }
}

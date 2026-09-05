import eventSchema from "@/zod-schemas/resend/eventSchema";
import type {z} from "zod";
import {NextRequest, NextResponse} from "next/server";
import {resend} from "@/lib/resend/resend";
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
    let event: z.infer<typeof eventSchema>;
    try {
      event = eventSchema.parse(
        resend.webhooks.verify({
          payload,
          headers: {
            id: svixId,
            timestamp: svixTimestamp,
            signature: svixSignature,
          },
          webhookSecret: process.env.RESEND_WEBHOOK_SECRET,
        }),
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return new NextResponse("Invalid signature", {status: 400});
    }

    // Minimal logging - avoid logging full payload in production
    console.log("Resend webhook event:", event.type);

    switch (event.type) {
      case "email.bounced": {
        const to = (event.data as {to?: unknown})?.to;
        const email =
          Array.isArray(to) && typeof to[0] === "string" ? to[0] : undefined;
        if (email) {
          await prisma.newsletterSubscriber.updateMany({
            where: {email},
            data: {status: "BOUNCED"},
          });
        }
        break;
      }

      case "email.complained": {
        const to = (event.data as {to?: unknown})?.to;
        const email =
          Array.isArray(to) && typeof to[0] === "string" ? to[0] : undefined;
        if (email) {
          await prisma.newsletterSubscriber.updateMany({
            where: {email},
            data: {status: "UNSUBSCRIBED"},
          });
        }
        break;
      }
    }

    return NextResponse.json({ok: true}, {status: 200});
  } catch (err) {
    console.error("Webhook handling failed:", err);
    return new NextResponse("Invalid webhook", {status: 400});
  }
}

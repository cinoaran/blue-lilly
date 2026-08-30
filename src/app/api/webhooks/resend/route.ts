import {NextRequest, NextResponse} from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const headers = Object.fromEntries(request.headers.entries());

    console.log("=== WEBHOOK RECEIVED ===");
    console.log("Headers:", JSON.stringify(headers, null, 2));
    console.log("Payload:", payload);
    console.log("========================");

    // Keine Signatur-Prüfung, keine DB, nur Log
    return NextResponse.json({ok: true, received: true}, {status: 200});
  } catch (err) {
    console.error("Webhook error:", err);
    return new NextResponse("Error", {status: 500});
  }
}

/* import {NextRequest, NextResponse} from "next/server";
import {Resend} from "resend";
import {prisma} from "@/lib/prisma"; // dein Prisma-Client

// Use Node runtime because the Resend SDK relies on Node crypto APIs
export const runtime = "nodejs";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  console.log("Webhook received");
  try {
    // 1. Raw Body auslesen (wichtig für Signatur-Check!) — nur einmal lesen
    const payload = await request.text();
    console.log("Payload:", payload);

    // 2. Svix-Header auslesen
    const svixId = request.headers.get("svix-id") ?? "";
    const svixTimestamp = request.headers.get("svix-timestamp") ?? "";
    const svixSignature = request.headers.get("svix-signature") ?? "";

    if (!process.env.RESEND_WEBHOOK_SECRET) {
      console.error("RESEND_WEBHOOK_SECRET is not set");
      return new NextResponse("Webhook secret not configured", {status: 500});
    }

    // 3. Signatur verifizieren
    const event = resend.webhooks.verify({
      payload,
      headers: {
        id: svixId,
        timestamp: svixTimestamp,
        signature: svixSignature,
      },
      webhookSecret: process.env.RESEND_WEBHOOK_SECRET,
    });

    // 4. Event-Typ auswerten
    switch (event.type) {
      case "email.bounced": {
        const email = event.data.to?.[0]; // Empfängeradresse
        if (!email) break;

        console.log("Bounce for Email", email);

        await prisma.newsletterSubscriber.updateMany({
          where: {email},
          data: {
            status: "BOUNCED",
          },
        });
        break;
      }

      case "email.complained": {
        const email = event.data.to?.[0];
        if (!email) break;

        await prisma.newsletterSubscriber.updateMany({
          where: {email},
          data: {
            status: "UNSUBSCRIBED",
          },
        });
        break;
      }

      case "email.delivered":
      case "email.sent":
      case "email.opened":
      case "email.clicked":
        // Optional: für Analytics in eine separate Event-Tabelle schreiben
        break;

      default:
        // Unbekannter Event-Typ – trotzdem 200 zurückgeben
        break;
    }

    return NextResponse.json({ok: true}, {status: 200});
  } catch (err) {
    console.error("Webhook handling failed:", err);
    return new NextResponse("Invalid webhook", {status: 400});
  }
}
 */

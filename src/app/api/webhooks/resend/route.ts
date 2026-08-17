import {NextRequest, NextResponse} from "next/server";
import {Resend} from "resend";
import {prisma} from "@/lib/prisma"; // dein Prisma-Client

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  console.log("Webhook received");
  const payload = await request.text();
  console.log("Payload:", payload);
  try {
    // 1. Raw Body auslesen (wichtig für Signatur-Check!)
    const payload = await request.text();

    // 2. Svix-Header auslesen
    const svixId = request.headers.get("svix-id") ?? "";
    const svixTimestamp = request.headers.get("svix-timestamp") ?? "";
    const svixSignature = request.headers.get("svix-signature") ?? "";

    // 3. Signatur verifizieren
    const event = resend.webhooks.verify({
      payload,
      headers: {
        id: svixId,
        timestamp: svixTimestamp,
        signature: svixSignature,
      },
      webhookSecret: process.env.RESEND_WEBHOOK_SECRET!,
    });

    // 4. Event-Typ auswerten
    // Typen: email.sent, email.delivered, email.bounced, email.complained, etc.
    switch (event.type) {
      case "email.bounced": {
        const email = event.data.to[0]; // Empfängeradresse
        if (!email) break;

        console.log("Bounce for Email", email);

        await prisma.newsletterSubscriber.updateMany({
          where: {email},
          data: {
            status: "BOUNCED",
            // optional: bouncedAt: new Date(),
          },
        });
        break;
      }

      case "email.complained": {
        const email = event.data.to[0];
        if (!email) break;

        await prisma.newsletterSubscriber.updateMany({
          where: {email},
          data: {
            status: "UNSUBSCRIBED",
            // optional: complaintAt: new Date(),
          },
        });
        break;
      }

      case "email.delivered":
      case "email.sent":
      case "email.opened":
      case "email.clicked":
        // Optional: für Analytics in eine separate Event-Tabelle schreiben
        // z.B. NewsletterEvent { type, email, createdAt }
        break;

      default:
        // Unbekannter Event-Typ – trotzdem 200 zurückgeben
        break;
    }

    return NextResponse.json({ok: true}, {status: 200});
  } catch {
    // Signatur ungültig oder anderer Fehler
    return new NextResponse("Invalid webhook", {status: 400});
  }
}

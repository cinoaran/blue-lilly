import {NextRequest, NextResponse} from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      {message: "Not allowed in production"},
      {status: 403},
    );
  }

  try {
    const {eventType, email} = await request.json();
    if (!eventType || !email) {
      return NextResponse.json({message: "Fehlende Parameter"}, {status: 400});
    }

    switch (eventType) {
      case "email.bounced":
        await prisma.newsletterSubscriber.updateMany({
          where: {email: String(email).toLowerCase()},
          data: {status: "BOUNCED"},
        });
        break;
      case "email.complained":
        await prisma.newsletterSubscriber.updateMany({
          where: {email: String(email).toLowerCase()},
          data: {status: "UNSUBSCRIBED"},
        });
        break;
      default:
        // no-op for other events
        break;
    }

    return NextResponse.json({ok: true}, {status: 200});
  } catch (err) {
    console.error("Simulation failed:", err);
    return NextResponse.json(
      {message: "Simulation fehlgeschlagen"},
      {status: 500},
    );
  }
}

import {NextResponse} from "next/server";
import {ensureAndRequire} from "@/acl/acl";
import {createNewsletterCampaign} from "@/lib/resend/campaign-services";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    // Server-side auth: require admin permission
    await ensureAndRequire(undefined, "admin:access");

    const body = await request.json();

    // Validate required fields
    if (
      typeof body.name !== "string" ||
      typeof body.subject !== "string" ||
      typeof body.html !== "string"
    ) {
      return NextResponse.json(
        {error: "Ungültige Newsletter-Daten"},
        {status: 400},
      );
    }

    const segmentId = process.env.RESEND_NEWSLETTER_SEGMENT_ID;
    if (!segmentId) {
      return NextResponse.json(
        {error: "RESEND_NEWSLETTER_SEGMENT_ID fehlt auf dem Server"},
        {status: 500},
      );
    }

    const campaign = await createNewsletterCampaign({
      name: body.name,
      subject: body.subject,
      html: body.html,
      text: typeof body.text === "string" ? body.text : undefined,
      segmentId,
    });

    return NextResponse.json({success: true, campaign}, {status: 201});
  } catch (error) {
    console.error("create newsletter failed", error);
    const message = error instanceof Error ? error.message : "Serverfehler";
    // Wenn der Abmeldelink fehlt, ist das ein Client-Fehler (400)
    if (
      message.includes("Resend-Abmeldelink") ||
      message.includes("RESEND_UNSUBSCRIBE_URL")
    ) {
      return NextResponse.json({error: message}, {status: 400});
    }

    return NextResponse.json({error: message}, {status: 500});
  }
}

export async function GET(request: Request) {
  try {
    await ensureAndRequire(undefined, "admin:access");

    const campaigns = await prisma.newsletterCampaign.findMany({
      orderBy: {createdAt: "desc"},
    });

    return NextResponse.json({success: true, campaigns});
  } catch (error) {
    console.error("list newsletters failed", error);
    return NextResponse.json(
      {error: error instanceof Error ? error.message : "Serverfehler"},
      {status: 500},
    );
  }
}

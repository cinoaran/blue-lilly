import {NextRequest, NextResponse} from "next/server";
import {render} from "@react-email/components";
import BlueLillyNewsletter from "@/app/newsletter/september06/week1";
import {resend} from "@/lib/resend";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const template = String(body.template || "week1");

    // Only week1 supported for now
    if (template !== "week1") {
      return NextResponse.json(
        {message: "Template not supported"},
        {status: 400},
      );
    }

    const segmentId = process.env.RESEND_NEWSLETTER_SEGMENT_ID;
    const topicId = process.env.RESEND_NEWSLETTER_TOPIC_ID;
    const from = process.env.RESEND_NEWSLETTER_FROM;

    if (!segmentId)
      return NextResponse.json(
        {message: "RESEND_NEWSLETTER_SEGMENT_ID fehlt"},
        {status: 500},
      );
    if (!from)
      return NextResponse.json(
        {message: "RESEND_NEWSLETTER_FROM fehlt"},
        {status: 500},
      );

    const element = BlueLillyNewsletter();
    const html = await render(element);

    const {data, error} = await resend.broadcasts.create({
      name: `Blue Lilly Broadcast (${template})`,
      segmentId,
      topicId: topicId || undefined,
      from,
      subject: "Produktneuheiten & exklusive Vorteile",
      html,
      text: `Produktneuheiten & exklusive Vorteile\n\nNeu: Die Royal Nap Kuschel-Kollektion.\n\nJetzt entdecken:\nhttps://blue-lilly.de/royal-nap\n\nNewsletter abbestellen:\n{{{RESEND_UNSUBSCRIBE_URL}}}`,
      send: true,
    });

    if (error || !data?.id) {
      return NextResponse.json(
        {message: error?.message || "Broadcast creation failed"},
        {status: 500},
      );
    }

    return NextResponse.json({ok: true, broadcastId: data.id}, {status: 200});
  } catch (err) {
    console.error("[send-broadcast] error", err);
    return NextResponse.json({message: "Internal error"}, {status: 500});
  }
}

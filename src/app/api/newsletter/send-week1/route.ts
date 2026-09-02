import {NextRequest, NextResponse} from "next/server";
import {resend} from "@/lib/resend";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    if (!email)
      return NextResponse.json({message: "Email fehlt"}, {status: 400});

    const previewUrl = `${process.env.NEXT_PUBLIC_APP_URL}/newsletter/september06/week1`;
    const html = `<p>Dies ist eine Test‑Vorschau des Newsletters. Zur Vorschau: <a href="${previewUrl}">${previewUrl}</a></p>`;

    console.log(
      "[send-week1] Sending week1 newsletter (preview link) to:",
      email,
    );
    const domain = process.env.RESEND_DOMAIN ?? "blue-lilly.de";

    const resp = await resend.emails.send({
      from: `Blue Lilly <newsletter@${domain}>`,
      to: email,
      subject: "[Test] Blue Lilly — Vorschau Newsletter",
      html,
    });

    console.log("[send-week1] Resend response:", resp);

    return NextResponse.json({ok: true, result: resp}, {status: 200});
  } catch (err) {
    console.error("[send-week1] Fehler beim Versenden:", err);
    return NextResponse.json({message: "Senden fehlgeschlagen"}, {status: 500});
  }
}

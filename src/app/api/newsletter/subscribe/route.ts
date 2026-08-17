import {NextResponse} from "next/server";
import {createPendingSubscriber} from "@/lib/newsletter/service";
import {defaultLimiter} from "@/lib/rateLimiter";
import {isDisposableEmail} from "@/lib/disposable-email-check";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const email = String(form.get("email") ?? "").trim();
    const consent = form.get("consent") === "on";
    // basic validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !consent) {
      return NextResponse.json(
        {success: false, message: "Eingaben prüfen."},
        {status: 400},
      );
    }

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {success: false, message: "Ungültige E-Mail-Adresse."},
        {status: 400},
      );
    }

    if (isDisposableEmail(email)) {
      return NextResponse.json(
        {
          success: false,
          message: "Temporäre E‑Mail‑Adressen sind nicht erlaubt.",
        },
        {status: 400},
      );
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const rl = defaultLimiter.consume(ip, email);
    if (!rl.allowed) {
      const status = 429;
      const message =
        rl.reason === "email_limit_exceeded"
          ? "Zu viele Anmeldeversuche für diese E-Mail. Bitte später erneut versuchen."
          : "Zu viele Anfragen von deiner IP. Bitte später erneut versuchen.";
      return NextResponse.json({success: false, message}, {status});
    }

    const result = await createPendingSubscriber(email);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Error in newsletter subscribe route:", err);
    return NextResponse.json(
      {success: false, message: "Serverfehler."},
      {status: 500},
    );
  }
}

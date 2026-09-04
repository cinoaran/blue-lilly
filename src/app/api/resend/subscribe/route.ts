import {NextResponse} from "next/server";
import {createPendingSubscriber} from "@/lib/resend-newsletter/service";
import {getSessionOnce} from "@/lib/session/sessionCache";
import {defaultLimiter} from "@/lib/rateLimiter";
import {isDisposableEmail} from "@/lib/disposable-email-check";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const email = String(form.get("email") ?? "").trim();
    const consent = form.get("consent") === "on";
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

    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const rl = defaultLimiter.consume(clientIp, email);
    if (!rl.allowed) {
      const status = 429;
      const message =
        rl.reason === "email_limit_exceeded"
          ? "Zu viele Anmeldeversuche für diese E-Mail. Bitte später erneut versuchen."
          : "Zu viele Anfragen von deiner IP. Bitte später erneut versuchen.";
      return NextResponse.json({success: false, message}, {status});
    }

    const session = await getSessionOnce({headers: req.headers});
    const userId = session?.user?.id ?? null;
    const username = session?.user?.name ?? null;
    const consentIp =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      null;
    const userAgent = req.headers.get("user-agent") || null;

    const result = await createPendingSubscriber(email, {
      userId,
      username,
      ip: consentIp,
      userAgent,
      source: "website",
      pageUrl: `${req.headers.get("origin") || ""}/newsletter`,
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error("Error in resend subscribe route:", err);
    return NextResponse.json(
      {success: false, message: "Serverfehler."},
      {status: 500},
    );
  }
}

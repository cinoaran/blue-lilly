"use server";
import crypto from "node:crypto";
import prisma from "@/lib/prisma";
import {resend} from "@/lib/resend";

export async function subscribeToNewsletter(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const consent = formData.get("consent") === "on";
  if (!email || !consent) {
    return {success: false, message: "Eingaben prüfen."};
  }
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  await prisma.newsletterSubscriber.upsert({
    where: {emailNormalized: email},
    update: {
      status: "PENDING",
      confirmationTokenHash: tokenHash,
      confirmationExpiresAt: new Date(Date.now() + 86400000),
      consentGivenAt: new Date(),
      consentTextVersion: "newsletter-v1",
    },
    create: {
      email,
      emailNormalized: email,
      status: "PENDING",
      confirmationTokenHash: tokenHash,
      confirmationExpiresAt: new Date(Date.now() + 86400000),
      consentGivenAt: new Date(),
      consentTextVersion: "newsletter-v1",
    },
  });
  try {
    const res = await resend.emails.send({
      from: "Blue Lilly <newletter@030web.com>",
      to: email,
      subject: "Bitte bestätige deine Newsletter-Anmeldung",
      html: `<a href="${process.env.NEXT_PUBLIC_APP_URL}/newsletter/confirm?token=${token}">Anmeldung bestätigen</a>`,
    });
    console.log("Resend send response:", res);
  } catch (err) {
    console.error("Resend send failed:", err);
  }
  return {success: true, message: "Postfach prüfen."};
}

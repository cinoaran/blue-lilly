import crypto from "node:crypto";
import prisma from "@/lib/prisma";
import {resend} from "@/lib/resend";

export async function createPendingSubscriber(email: string) {
  const normalized = email.trim().toLowerCase();
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const unsubscribeToken = crypto.randomBytes(24).toString("hex");
  const unsubscribeTokenHash = crypto
    .createHash("sha256")
    .update(unsubscribeToken)
    .digest("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.newsletterSubscriber.upsert({
    where: {emailNormalized: normalized},
    update: {
      status: "PENDING",
      confirmationTokenHash: tokenHash,
      unsubscribeTokenHash: unsubscribeTokenHash,
      confirmationExpiresAt: expires,
      consentGivenAt: new Date(),
      consentTextVersion: "newsletter-v1",
    },
    create: {
      email: email,
      emailNormalized: normalized,
      status: "PENDING",
      confirmationTokenHash: tokenHash,
      unsubscribeTokenHash: unsubscribeTokenHash,
      confirmationExpiresAt: expires,
      consentGivenAt: new Date(),
      consentTextVersion: "newsletter-v1",
    },
  });

  // send confirmation email via Resend
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const confirmUrl = `${appUrl}/newsletter/confirm?token=${token}`;
  const unsubscribeUrl = `${appUrl}/newsletter/unsubscribe?token=${unsubscribeToken}`;

  await resend.emails.send({
    from: `Blue Lilly <newletter@030web.com>`,
    to: normalized,
    subject: "Bitte bestätige deine Newsletter-Anmeldung",
    html: `<p>Bitte bestätige deine Anmeldung: <a href="${confirmUrl}">Anmeldung bestätigen</a></p><p>Abmelden: <a href="${unsubscribeUrl}">Abmelden</a></p>`,
  });

  return {success: true, message: "Bestätigungs-E-Mail gesendet."};
}

export async function confirmSubscriberByToken(token: string) {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const now = new Date();
  const subscriber = await prisma.newsletterSubscriber.findFirst({
    where: {confirmationTokenHash: tokenHash},
  });
  if (!subscriber) {
    return {success: false, message: "Der Link ist ungültig."};
  }

  // If the subscriber is already marked subscribed, return a clear message
  if (subscriber.status === "SUBSCRIBED") {
    return {
      success: false,
      message:
        "Der Link ist ungültig da er bereits verwendet wurde. Sie sind bereits angemeldet.",
    };
  }

  if (
    !subscriber.confirmationExpiresAt ||
    subscriber.confirmationExpiresAt < now
  ) {
    return {success: false, message: "Token abgelaufen."};
  }

  // Mark subscribed but keep the token hash so repeated clicks can be
  // recognized as 'already used' and produce a friendly message.
  await prisma.newsletterSubscriber.updateMany({
    where: {confirmationTokenHash: tokenHash},
    data: {
      status: "SUBSCRIBED",
      confirmedAt: new Date(),
      confirmationExpiresAt: null,
      // intentionally do not clear confirmationTokenHash
    },
  });

  return {success: true, message: "Anmeldung bestätigt."};
}
export async function unsubscribeByToken(token: string) {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  // Atomically mark subscriber as unsubscribed and clear the stored token.
  // Using updateMany with the tokenHash in the WHERE clause prevents a
  // TOCTOU race between lookup and update and makes the token single‑use.
  const result = await prisma.newsletterSubscriber.updateMany({
    where: {unsubscribeTokenHash: tokenHash},
    data: {
      status: "UNSUBSCRIBED",
      unsubscribedAt: new Date(),
      unsubscribeTokenHash: null,
    },
  });

  if (result.count === 0) {
    // No rows updated -> token not found or already used
    return {success: false, message: "Sie sind bereits abgemeldet."};
  }

  return {
    success: true,
    message: "Sie wurden erfolgreich vom Newsletter abgemeldet.",
  };
}

export async function markBounceForEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  await prisma.newsletterSubscriber.updateMany({
    where: {emailNormalized: normalized},
    data: {status: "BOUNCED", unsubscribedAt: new Date()},
  });
}

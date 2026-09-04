// src/lib/newsletter/service.ts

import crypto from "node:crypto";

import {render} from "@react-email/components";

import prisma from "@/lib/prisma";
import {resend} from "@/lib/resend";

import {
  ensureContactInSegment,
  findContactByEmail,
  removeContactFromSegment,
  setContactUnsubscribed,
} from "@/lib/resendClient";

import NewsletterSubscriptionEmail from "@/emails/NewsletterSubscriptionEmail";

type ServiceResult = {
  success: boolean;
  message: string;
};

type SubscriberForProviderSync = {
  id: string;
  email: string;
  provider?: string | null;
  providerContactId?: string | null;
};

/**
 * Erstellt einen SHA-256-Hash für Bestätigungs-
 * und Abmeldetokens.
 */
function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Hash für IP-Adressen.
 *
 * Für IP-Adressen wird HMAC mit einem geheimen Schlüssel
 * verwendet. Dadurch sind einfache Dictionary-Angriffe
 * schwieriger als bei einem normalen SHA-256-Hash.
 */
function hashIp(ip: string): string {
  const secret = process.env.CONSENT_HASH_SECRET;

  if (!secret) {
    throw new Error("CONSENT_HASH_SECRET ist nicht gesetzt");
  }

  return crypto.createHmac("sha256", secret).update(ip).digest("hex");
}

/**
 * Entfernt einen abschließenden Slash von einer URL.
 */
function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

/**
 * Liest die konfigurierte Resend-Absenderadresse.
 */
function getNewsletterFromAddress(): string {
  if (process.env.RESEND_NEWSLETTER_FROM) {
    return process.env.RESEND_NEWSLETTER_FROM;
  }

  const domain = process.env.RESEND_DOMAIN;

  if (!domain) {
    throw new Error("RESEND_NEWSLETTER_FROM oder RESEND_DOMAIN fehlt");
  }

  return `Blue Lilly <newsletter@${domain}>`;
}

/**
 * Erstellt einen neuen Pending-Subscriber und sendet
 * die Double-Opt-in-E-Mail.
 */
export async function createPendingSubscriber(
  email: string,
  opts: {
    username?: string | null;
    userId?: string | null;
    ip?: string | null;
    userAgent?: string | null;
    source?: string | null;
    pageUrl?: string | null;
  } = {},
): Promise<ServiceResult> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail || !normalizedEmail.includes("@")) {
    return {
      success: false,
      message: "Bitte gib eine gültige E-Mail-Adresse ein.",
    };
  }

  const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
    where: {
      emailNormalized: normalizedEmail,
    },
  });

  if (existingSubscriber?.status === "SUBSCRIBED") {
    return {
      success: true,
      message:
        "Diese E-Mail-Adresse ist bereits für den Newsletter angemeldet.",
    };
  }

  const confirmationToken = crypto.randomBytes(32).toString("hex");

  const confirmationTokenHash = hashToken(confirmationToken);

  const unsubscribeToken = crypto.randomBytes(24).toString("hex");

  const unsubscribeTokenHash = hashToken(unsubscribeToken);

  const now = new Date();

  const confirmationExpiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const consentIpHash = opts.ip ? hashIp(opts.ip) : null;

  await prisma.newsletterSubscriber.upsert({
    where: {
      emailNormalized: normalizedEmail,
    },
    update: {
      email: normalizedEmail,
      status: "PENDING",

      userId: opts.userId ?? null,

      confirmationTokenHash,
      confirmationExpiresAt,

      unsubscribeTokenHash,

      confirmedAt: null,

      consentTextVersion: "newsletter-v1",
      consentGivenAt: now,
      consentIpHash,
      consentUserAgent: opts.userAgent ?? null,

      source: opts.source ?? null,
      pageUrl: opts.pageUrl ?? null,

      // Die alte Provider-Synchronisierung ist
      // nach einer neuen Anmeldung nicht mehr gültig.
      providerSyncedAt: null,
    },
    create: {
      email: normalizedEmail,
      emailNormalized: normalizedEmail,

      status: "PENDING",

      userId: opts.userId ?? null,

      confirmationTokenHash,
      confirmationExpiresAt,

      unsubscribeTokenHash,

      consentTextVersion: "newsletter-v1",
      consentGivenAt: now,
      consentIpHash,
      consentUserAgent: opts.userAgent ?? null,

      source: opts.source ?? null,
      pageUrl: opts.pageUrl ?? null,
    },
  });

  const appUrl = normalizeBaseUrl(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  );

  const confirmUrl = `${appUrl}/newsletter/confirm?token=${confirmationToken}`;

  const unsubscribeUrl = `${appUrl}/newsletter/unsubscribe?token=${unsubscribeToken}`;

  const html = await render(
    NewsletterSubscriptionEmail({
      username: opts.username ?? undefined,
      subscribeUrl: confirmUrl,
      unsubscribeUrl,
    }),
  );

  const {data, error} = await resend.emails.send({
    from: getNewsletterFromAddress(),
    to: normalizedEmail,
    subject: "Bitte bestätige deine Newsletter-Anmeldung",
    html,
  });

  if (error || !data?.id) {
    console.error("Double-Opt-in-E-Mail konnte nicht gesendet werden:", error);

    return {
      success: false,
      message:
        "Die Bestätigungs-E-Mail konnte nicht gesendet werden. Bitte versuche es später erneut.",
    };
  }

  return {
    success: true,
    message: "Bestätigungs-E-Mail wurde gesendet.",
  };
}

/**
 * Synchronisiert einen bestätigten Subscriber
 * mit Resend.
 *
 * Diese Funktion darf nur verwendet werden,
 * wenn der Status bereits SUBSCRIBED ist.
 */
async function syncSubscriberToResend(subscriberId: string): Promise<string> {
  const subscriber = await prisma.newsletterSubscriber.findUnique({
    where: {
      id: subscriberId,
    },
  });

  if (!subscriber) {
    throw new Error("Subscriber für Resend-Synchronisierung nicht gefunden");
  }

  if (subscriber.status !== "SUBSCRIBED" || !subscriber.confirmedAt) {
    throw new Error(
      "Nur bestätigte Subscriber dürfen mit Resend synchronisiert werden",
    );
  }

  const segmentId = process.env.RESEND_NEWSLETTER_SEGMENT_ID;

  if (!segmentId) {
    throw new Error("RESEND_NEWSLETTER_SEGMENT_ID fehlt");
  }

  const topicId = process.env.RESEND_NEWSLETTER_TOPIC_ID;

  const contactId = await ensureContactInSegment(
    subscriber.email,
    segmentId,
    topicId,
  );

  await prisma.newsletterSubscriber.update({
    where: {
      id: subscriber.id,
    },
    data: {
      provider: "resend",
      providerContactId: contactId,
      providerSyncedAt: new Date(),
    },
  });

  return contactId;
}

/**
 * Bestätigt einen Subscriber per DOI-Token.
 */
export async function confirmSubscriberByToken(
  token: string,
): Promise<ServiceResult> {
  const tokenHash = hashToken(token);
  const now = new Date();

  const subscriber = await prisma.newsletterSubscriber.findUnique({
    where: {
      confirmationTokenHash: tokenHash,
    },
  });

  if (!subscriber) {
    return {
      success: false,
      message:
        "Der Bestätigungslink ist ungültig oder wurde bereits verwendet.",
    };
  }

  if (subscriber.status === "SUBSCRIBED") {
    return {
      success: true,
      message: "Diese Newsletter-Anmeldung wurde bereits bestätigt.",
    };
  }

  if (
    !subscriber.confirmationExpiresAt ||
    subscriber.confirmationExpiresAt <= now
  ) {
    return {
      success: false,
      message: "Der Bestätigungslink ist abgelaufen.",
    };
  }

  /**
   * Atomare Statusänderung:
   *
   * Nur der erste parallele Aufruf darf
   * den Status von PENDING auf SUBSCRIBED ändern.
   */
  const updated = await prisma.newsletterSubscriber.updateMany({
    where: {
      id: subscriber.id,
      status: "PENDING",
      confirmationExpiresAt: {
        gt: now,
      },
    },
    data: {
      status: "SUBSCRIBED",
      confirmedAt: now,

      confirmationTokenHash: null,
      confirmationExpiresAt: null,

      // Falls der Nutzer sich früher abgemeldet hatte
      // und sich jetzt erneut anmeldet.
      unsubscribedAt: null,
    },
  });

  if (updated.count !== 1) {
    return {
      success: false,
      message:
        "Der Bestätigungslink ist ungültig oder wurde bereits verwendet.",
    };
  }

  try {
    await syncSubscriberToResend(subscriber.id);

    return {
      success: true,
      message: "Deine Newsletter-Anmeldung wurde bestätigt.",
    };
  } catch (error) {
    console.error(
      "Subscriber wurde bestätigt, aber nicht mit Resend synchronisiert:",
      error,
    );

    /**
     * Die lokale Anmeldung bleibt gültig.
     * Der Subscriber ist aber noch nicht im Resend-Segment.
     * Ein späterer Retry-Job sollte diese Synchronisierung
     * erneut versuchen.
     */
    return {
      success: true,
      message:
        "Deine Anmeldung wurde bestätigt. Die technische Aktivierung wird noch abgeschlossen.",
    };
  }
}

/**
 * Sucht die vorhandene Resend-Kontakt-ID.
 *
 * Wichtig:
 * Bei einer Abmeldung wird kein neuer Kontakt erstellt.
 */
async function resolveExistingResendContactId(
  subscriber: SubscriberForProviderSync,
): Promise<string | null> {
  if (subscriber.providerContactId) {
    return subscriber.providerContactId;
  }

  const contact = await findContactByEmail(subscriber.email);

  if (!contact) {
    return null;
  }

  return contact.id;
}

/**
 * Synchronisiert eine lokale Abmeldung mit Resend.
 */
async function syncUnsubscribeToResend(
  subscriber: SubscriberForProviderSync,
): Promise<boolean> {
  const contactId = await resolveExistingResendContactId(subscriber);

  if (!contactId) {
    // Kein Resend-Kontakt vorhanden.
    // Es muss nichts bei Resend geändert werden.
    return true;
  }

  const segmentId = process.env.RESEND_NEWSLETTER_SEGMENT_ID;

  // Global von Resend-Broadcasts abmelden
  await setContactUnsubscribed(contactId, true);

  // Zusätzlich aus dem Newsletter-Segment entfernen
  if (segmentId) {
    await removeContactFromSegment(contactId, segmentId);
  }

  // Erst nach erfolgreicher Provider-Synchronisierung
  // den Sync-Zeitpunkt setzen.
  await prisma.newsletterSubscriber.update({
    where: {
      id: subscriber.id,
    },
    data: {
      provider: "resend",
      providerContactId: contactId,
      providerSyncedAt: new Date(),
    },
  });

  return true;
}

/**
 * Meldet einen Subscriber per Abmeldetoken ab.
 */
export async function unsubscribeByToken(
  token: string,
): Promise<ServiceResult> {
  const tokenHash = hashToken(token);

  const subscriber = await prisma.newsletterSubscriber.findUnique({
    where: {
      unsubscribeTokenHash: tokenHash,
    },
  });

  if (!subscriber) {
    return {
      success: false,
      message: "Der Abmeldelink ist ungültig oder wurde bereits verwendet.",
    };
  }

  const unsubscribeDate = subscriber.unsubscribedAt ?? new Date();

  /**
   * Lokale Abmeldung zuerst.
   */
  await prisma.newsletterSubscriber.update({
    where: {
      id: subscriber.id,
    },
    data: {
      status: "UNSUBSCRIBED",
      unsubscribedAt: unsubscribeDate,

      // Token nach Verwendung ungültig machen
      unsubscribeTokenHash: null,
    },
  });

  let providerSyncFailed = false;

  try {
    await syncUnsubscribeToResend(subscriber);
  } catch (error) {
    providerSyncFailed = true;

    console.error(
      "Lokale Abmeldung erfolgreich, Resend-Synchronisierung fehlgeschlagen:",
      error,
    );
  }

  if (providerSyncFailed) {
    return {
      success: true,
      message:
        "Du wurdest lokal abgemeldet. Die technische Synchronisierung wird noch nachgeholt.",
    };
  }

  return {
    success: true,
    message: "Du wurdest erfolgreich vom Newsletter abgemeldet.",
  };
}

/**
 * Markiert eine E-Mail-Adresse als Bounce.
 *
 * Ein Bounce ist keine manuelle Abmeldung.
 * Deshalb wird unsubscribedAt nicht gesetzt.
 */
export async function markBounceForEmail(email: string): Promise<number> {
  const normalizedEmail = email.trim().toLowerCase();

  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: {
      emailNormalized: normalizedEmail,
    },
  });

  const result = await prisma.newsletterSubscriber.updateMany({
    where: {
      emailNormalized: normalizedEmail,
    },
    data: {
      status: "BOUNCED",
    },
  });

  const segmentId = process.env.RESEND_NEWSLETTER_SEGMENT_ID;

  if (!segmentId) {
    return result.count;
  }

  /**
   * Bei einem Bounce wird der Kontakt nicht neu erstellt.
   * Wenn er existiert, wird er nur aus dem Newsletter-Segment entfernt.
   */
  for (const subscriber of subscribers) {
    try {
      const contactId = await resolveExistingResendContactId(subscriber);

      if (!contactId) {
        continue;
      }

      await removeContactFromSegment(contactId, segmentId);

      await prisma.newsletterSubscriber.update({
        where: {
          id: subscriber.id,
        },
        data: {
          provider: "resend",
          providerContactId: contactId,
          providerSyncedAt: new Date(),
        },
      });
    } catch (error) {
      console.error("Bounce-Synchronisierung zu Resend fehlgeschlagen:", error);
    }
  }

  return result.count;
}

/**
 * Meldet alle Newsletter-Subscriber eines Users ab.
 */
export async function unsubscribeByUserId(
  userId: string,
): Promise<ServiceResult> {
  if (!userId) {
    return {
      success: false,
      message: "Keine userId angegeben.",
    };
  }

  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: {
      userId,
      status: {
        in: ["PENDING", "SUBSCRIBED"],
      },
    },
  });

  if (subscribers.length === 0) {
    return {
      success: false,
      message:
        "Keine aktive Newsletter-Anmeldung für diesen Benutzer gefunden.",
    };
  }

  const unsubscribeDate = new Date();

  /**
   * Alle lokalen Datensätze in einer Transaktion abmelden.
   */
  await prisma.$transaction(
    subscribers.map((subscriber) =>
      prisma.newsletterSubscriber.update({
        where: {
          id: subscriber.id,
        },
        data: {
          status: "UNSUBSCRIBED",
          unsubscribedAt: unsubscribeDate,
          unsubscribeTokenHash: null,
        },
      }),
    ),
  );

  const syncResults = await Promise.allSettled(
    subscribers.map((subscriber) => syncUnsubscribeToResend(subscriber)),
  );

  const failedSyncs = syncResults.filter(
    (result) => result.status === "rejected",
  );

  if (failedSyncs.length > 0) {
    console.error(`${failedSyncs.length} Resend-Abmeldungen fehlgeschlagen`);

    return {
      success: true,
      message:
        "Du wurdest lokal vom Newsletter abgemeldet. Einige Provider-Synchronisierungen werden noch nachgeholt.",
    };
  }

  return {
    success: true,
    message: "Du wurdest erfolgreich vom Newsletter abgemeldet.",
  };
}

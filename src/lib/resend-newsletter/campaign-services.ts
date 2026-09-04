// src/lib/resend-newsletter/campaign-services.ts

import {NewsletterCampaignStatus} from "@/generated/prisma/edge";
import prisma from "@/lib/prisma";
import {resend} from "@/lib/resend";

type CreateCampaignInput = {
  name: string;
  subject: string;
  html: string;
  text?: string;
  segmentId: string;
};

function getNewsletterFrom() {
  const from = process.env.RESEND_NEWSLETTER_FROM;

  if (!from) {
    throw new Error("RESEND_NEWSLETTER_FROM fehlt");
  }

  return from;
}

export async function createNewsletterCampaign(input: CreateCampaignInput) {
  if (!input.html.includes("RESEND_UNSUBSCRIBE_URL")) {
    throw new Error("Der Resend-Abmeldelink fehlt im Newsletter");
  }

  const campaign = await prisma.newsletterCampaign.create({
    data: {
      name: input.name,
      subject: input.subject,
      html: input.html,
      text: input.text,
      resendSegmentId: input.segmentId,
      status: NewsletterCampaignStatus.SYNCING,
    },
  });

  try {
    const {data, error} = await resend.broadcasts.create({
      name: input.name,
      segmentId: input.segmentId,
      topicId: process.env.RESEND_NEWSLETTER_TOPIC_ID || undefined,
      from: getNewsletterFrom(),
      subject: input.subject,
      html: input.html,
      text: input.text || undefined,
    });

    if (error || !data?.id) {
      throw new Error(
        error?.message || "Resend-Draft konnte nicht erstellt werden",
      );
    }

    return await prisma.newsletterCampaign.update({
      where: {
        id: campaign.id,
      },
      data: {
        resendBroadcastId: data.id,
        status: NewsletterCampaignStatus.DRAFT,
        errorMessage: null,
      },
    });
  } catch (error) {
    try {
      await prisma.newsletterCampaign.update({
        where: {
          id: campaign.id,
        },
        data: {
          status: NewsletterCampaignStatus.FAILED,
          errorMessage:
            error instanceof Error
              ? error.message
              : "Unbekannter Resend-Fehler",
        },
      });
    } catch (databaseError) {
      console.error(
        "Kampagne konnte nach einem Fehler nicht auf FAILED gesetzt werden:",
        databaseError,
      );
    }

    throw error;
  }
}

type UpdateCampaignInput = {
  name?: string;
  subject?: string;
  html?: string;
  text?: string;
};

export async function updateNewsletterCampaign(
  campaignId: string,
  input: UpdateCampaignInput,
) {
  const campaign = await prisma.newsletterCampaign.findUnique({
    where: {
      id: campaignId,
    },
  });

  if (!campaign) {
    throw new Error("Kampagne nicht gefunden");
  }

  if (campaign.status !== NewsletterCampaignStatus.DRAFT) {
    throw new Error("Nur Draft-Kampagnen können bearbeitet werden");
  }

  if (!campaign.resendBroadcastId) {
    throw new Error("Keine Resend-Broadcast-ID vorhanden");
  }

  const html = input.html ?? campaign.html;

  if (!html.includes("RESEND_UNSUBSCRIBE_URL")) {
    throw new Error("Der Resend-Abmeldelink fehlt im Newsletter");
  }

  const {error} = await resend.broadcasts.update(campaign.resendBroadcastId, {
    name: input.name ?? campaign.name,
    subject: input.subject ?? campaign.subject,
    html,
    text: input.text ?? campaign.text ?? undefined,
  });

  if (error) {
    throw new Error(
      error.message || "Resend-Broadcast konnte nicht aktualisiert werden",
    );
  }

  return await prisma.newsletterCampaign.update({
    where: {
      id: campaignId,
    },
    data: {
      name: input.name ?? campaign.name,
      subject: input.subject ?? campaign.subject,
      html,
      text: input.text ?? campaign.text,
      errorMessage: null,
    },
  });
}

export async function deleteNewsletterCampaign(campaignId: string) {
  const campaign = await prisma.newsletterCampaign.findUnique({
    where: {
      id: campaignId,
    },
  });

  if (!campaign) {
    throw new Error("Kampagne nicht gefunden");
  }

  if (campaign.status !== NewsletterCampaignStatus.DRAFT) {
    throw new Error("Nur Draft-Kampagnen können gelöscht werden");
  }

  return await prisma.newsletterCampaign.delete({
    where: {
      id: campaignId,
    },
  });
}

export async function sendNewsletterCampaign(campaignId: string) {
  const campaign = await prisma.newsletterCampaign.findUnique({
    where: {
      id: campaignId,
    },
    select: {
      id: true,
      status: true,
      resendBroadcastId: true,
    },
  });

  if (!campaign) {
    throw new Error("Newsletter-Kampagne nicht gefunden");
  }

  if (campaign.status !== NewsletterCampaignStatus.DRAFT) {
    throw new Error(
      `Diese Kampagne kann nicht gesendet werden. Aktueller Status: ${campaign.status}`,
    );
  }

  if (!campaign.resendBroadcastId) {
    throw new Error("Für diese Kampagne existiert kein Resend-Broadcast");
  }

  const claimed = await prisma.newsletterCampaign.updateMany({
    where: {
      id: campaignId,
      status: NewsletterCampaignStatus.DRAFT,
      resendBroadcastId: {
        not: null,
      },
    },
    data: {
      status: NewsletterCampaignStatus.SENDING,
      errorMessage: null,
    },
  });

  if (claimed.count === 0) {
    const currentCampaign = await prisma.newsletterCampaign.findUnique({
      where: {
        id: campaignId,
      },
      select: {
        status: true,
        resendBroadcastId: true,
        errorMessage: true,
      },
    });

    throw new Error(
      `Diese Kampagne ist nicht mehr als Draft verfügbar. ` +
        `Aktueller Status: ${currentCampaign?.status ?? "nicht gefunden"}`,
    );
  }

  if (claimed.count > 1) {
    throw new Error(
      `Unerwarteter Fehler: ${claimed.count} Kampagnen wurden gleichzeitig geclaimt`,
    );
  }

  try {
    const {data, error} = await resend.broadcasts.send(
      campaign.resendBroadcastId,
    );

    if (error || !data?.id) {
      throw new Error(
        error?.message || "Resend-Broadcast konnte nicht gesendet werden",
      );
    }

    const updatedCampaign = await prisma.newsletterCampaign.update({
      where: {
        id: campaignId,
      },
      data: {
        status: NewsletterCampaignStatus.SENT,
        sentAt: new Date(),
        errorMessage: null,
      },
    });

    return {
      campaign: updatedCampaign,
      broadcastId: data.id,
    };
  } catch (error) {
    try {
      await prisma.newsletterCampaign.update({
        where: {
          id: campaignId,
        },
        data: {
          status: NewsletterCampaignStatus.FAILED,
          errorMessage:
            error instanceof Error
              ? error.message
              : "Unbekannter Resend-Fehler",
        },
      });
    } catch (databaseError) {
      console.error(
        "Kampagne konnte nach dem Versandfehler nicht auf FAILED gesetzt werden:",
        databaseError,
      );
    }

    throw error;
  }
}

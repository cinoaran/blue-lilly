/*
  Warnings:

  - A unique constraint covering the columns `[providerContactId]` on the table `NewsletterSubscriber` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "NewsletterCampaignStatus" AS ENUM ('DRAFT', 'PENDING', 'SCHEDULED', 'SENDING', 'SENT', 'CANCELED', 'FAILED');

-- CreateTable
CREATE TABLE "NewsletterCampaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "html" TEXT NOT NULL,
    "text" TEXT,
    "resendSegmentId" TEXT NOT NULL,
    "resendBroadcastId" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "status" "NewsletterCampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsletterCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterCampaign_resendBroadcastId_key" ON "NewsletterCampaign"("resendBroadcastId");

-- CreateIndex
CREATE INDEX "NewsletterCampaign_status_idx" ON "NewsletterCampaign"("status");

-- CreateIndex
CREATE INDEX "NewsletterCampaign_scheduledAt_idx" ON "NewsletterCampaign"("scheduledAt");

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterSubscriber_providerContactId_key" ON "NewsletterSubscriber"("providerContactId");

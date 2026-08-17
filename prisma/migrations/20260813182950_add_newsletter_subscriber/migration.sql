/*
  Warnings:

  - You are about to drop the column `otpCode` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `otpExpires` on the `user` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "NewsletterStatus" AS ENUM ('PENDING', 'SUBSCRIBED', 'UNSUBSCRIBED', 'BOUNCED');

-- DropForeignKey
ALTER TABLE "Partner" DROP CONSTRAINT "Partner_merchantId_fkey";

-- AlterTable
ALTER TABLE "Option" ALTER COLUMN "entryPrice" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "sellPrice" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "quantity" SET DEFAULT 0,
ALTER COLUMN "weight" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "user" DROP COLUMN "otpCode",
DROP COLUMN "otpExpires";

-- CreateTable
CREATE TABLE "NewsletterSubscriber" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT NOT NULL,
    "emailNormalized" TEXT NOT NULL,
    "status" "NewsletterStatus" NOT NULL DEFAULT 'PENDING',
    "confirmationTokenHash" TEXT,
    "confirmationExpiresAt" TIMESTAMP(3),
    "confirmedAt" TIMESTAMP(3),
    "unsubscribeTokenHash" TEXT,
    "unsubscribedAt" TIMESTAMP(3),
    "consentTextVersion" TEXT NOT NULL,
    "consentGivenAt" TIMESTAMP(3) NOT NULL,
    "consentIpHash" TEXT,
    "consentUserAgent" TEXT,
    "source" TEXT,
    "pageUrl" TEXT,
    "provider" TEXT,
    "providerContactId" TEXT,
    "providerSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsletterSubscriber_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterSubscriber_email_key" ON "NewsletterSubscriber"("email");

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterSubscriber_emailNormalized_key" ON "NewsletterSubscriber"("emailNormalized");

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterSubscriber_confirmationTokenHash_key" ON "NewsletterSubscriber"("confirmationTokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterSubscriber_unsubscribeTokenHash_key" ON "NewsletterSubscriber"("unsubscribeTokenHash");

-- CreateIndex
CREATE INDEX "NewsletterSubscriber_userId_idx" ON "NewsletterSubscriber"("userId");

-- CreateIndex
CREATE INDEX "NewsletterSubscriber_status_idx" ON "NewsletterSubscriber"("status");

-- CreateIndex
CREATE INDEX "NewsletterSubscriber_status_createdAt_idx" ON "NewsletterSubscriber"("status", "createdAt");

-- CreateIndex
CREATE INDEX "NewsletterSubscriber_confirmationExpiresAt_idx" ON "NewsletterSubscriber"("confirmationExpiresAt");

-- CreateIndex
CREATE INDEX "Order_userId_status_idx" ON "Order"("userId", "status");

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

-- CreateIndex
CREATE INDEX "Order_status_createdAt_idx" ON "Order"("status", "createdAt");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_optionId_idx" ON "OrderItem"("optionId");

-- AddForeignKey
ALTER TABLE "Partner" ADD CONSTRAINT "Partner_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsletterSubscriber" ADD CONSTRAINT "NewsletterSubscriber_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "unique_root_category_slug" RENAME TO "Category_slug_key";

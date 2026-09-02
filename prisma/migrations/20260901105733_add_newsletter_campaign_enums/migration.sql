/*
  Warnings:

  - The values [PENDING] on the enum `NewsletterCampaignStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "NewsletterCampaignStatus_new" AS ENUM ('DRAFT', 'SYNCING', 'SCHEDULED', 'SENDING', 'SENT', 'CANCELED', 'FAILED');
ALTER TABLE "public"."NewsletterCampaign" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "NewsletterCampaign" ALTER COLUMN "status" TYPE "NewsletterCampaignStatus_new" USING ("status"::text::"NewsletterCampaignStatus_new");
ALTER TYPE "NewsletterCampaignStatus" RENAME TO "NewsletterCampaignStatus_old";
ALTER TYPE "NewsletterCampaignStatus_new" RENAME TO "NewsletterCampaignStatus";
DROP TYPE "public"."NewsletterCampaignStatus_old";
ALTER TABLE "NewsletterCampaign" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

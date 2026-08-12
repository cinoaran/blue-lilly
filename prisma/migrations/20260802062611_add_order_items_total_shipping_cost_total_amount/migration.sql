/*
  Warnings:

  - You are about to drop the column `stripePaymentIntentId` on the `Order` table. All the data in the column will be lost.
  - Added the required column `itemsTotal` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shippingCost` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Order_stripeSessionId_idx";

-- DropIndex
DROP INDEX "Order_userId_idx";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "stripePaymentIntentId",
ADD COLUMN     "itemsTotal" INTEGER NOT NULL,
ADD COLUMN     "shippingCost" INTEGER NOT NULL;

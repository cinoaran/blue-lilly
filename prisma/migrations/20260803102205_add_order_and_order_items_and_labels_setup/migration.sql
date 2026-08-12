/*
  Warnings:

  - You are about to drop the column `optionName` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `productName` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `sku` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `variantName` on the `OrderItem` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[stripePaymentIntentId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nameAtOrder` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_billingAddressId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_shippingAddressId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_optionId_fkey";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "billingSnapshot" JSONB,
ADD COLUMN     "shippingSnapshot" JSONB,
ADD COLUMN     "stripePaymentIntentId" TEXT,
ALTER COLUMN "shippingAddressId" DROP NOT NULL,
ALTER COLUMN "billingAddressId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "optionName",
DROP COLUMN "productName",
DROP COLUMN "sku",
DROP COLUMN "variantName",
ADD COLUMN     "nameAtOrder" TEXT NOT NULL,
ADD COLUMN     "optionLabelAtOrder" TEXT,
ADD COLUMN     "productIdAtOrder" TEXT,
ADD COLUMN     "skuAtOrder" TEXT,
ALTER COLUMN "optionId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Order_stripePaymentIntentId_key" ON "Order"("stripePaymentIntentId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_shippingAddressId_fkey" FOREIGN KEY ("shippingAddressId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_billingAddressId_fkey" FOREIGN KEY ("billingAddressId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "Option"("id") ON DELETE SET NULL ON UPDATE CASCADE;

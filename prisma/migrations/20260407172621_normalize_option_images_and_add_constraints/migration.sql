/*
  Warnings:

  - You are about to drop the column `image` on the `Option` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[variantId,color]` on the table `Option` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[productId,size,unitId]` on the table `Variant` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Option" DROP COLUMN "image",
ALTER COLUMN "entryPrice" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "sellPrice" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "taxPercentage" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "weight" SET DATA TYPE DECIMAL(10,3);

-- CreateTable
CREATE TABLE "OptionImage" (
    "id" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OptionImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OptionImage_optionId_idx" ON "OptionImage"("optionId");

-- CreateIndex
CREATE UNIQUE INDEX "OptionImage_optionId_position_key" ON "OptionImage"("optionId", "position");

-- CreateIndex
CREATE INDEX "Option_variantId_idx" ON "Option"("variantId");

-- CreateIndex
CREATE UNIQUE INDEX "Option_variantId_color_key" ON "Option"("variantId", "color");

-- CreateIndex
CREATE INDEX "Product_merchantId_idx" ON "Product"("merchantId");

-- CreateIndex
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");

-- CreateIndex
CREATE INDEX "Variant_productId_idx" ON "Variant"("productId");

-- CreateIndex
CREATE INDEX "Variant_unitId_idx" ON "Variant"("unitId");

-- CreateIndex
CREATE UNIQUE INDEX "Variant_productId_size_unitId_key" ON "Variant"("productId", "size", "unitId");

-- AddForeignKey
ALTER TABLE "OptionImage" ADD CONSTRAINT "OptionImage_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "Option"("id") ON DELETE CASCADE ON UPDATE CASCADE;

/*
  Warnings:

  - Changed the type of `color` on the `Option` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Option" ADD COLUMN     "baseColor" "BaseColor",
DROP COLUMN "color",
ADD COLUMN     "color" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Option_variantId_color_idx" ON "Option"("variantId", "color");

-- CreateIndex
CREATE INDEX "Option_variantId_baseColor_idx" ON "Option"("variantId", "baseColor");

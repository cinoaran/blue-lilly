/*
  Warnings:

  - You are about to alter the column `entryPrice` on the `Option` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Decimal(6,2)`.
  - You are about to alter the column `sellPrice` on the `Option` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Decimal(6,2)`.
  - You are about to alter the column `taxPercentage` on the `Option` table. The data in that column could be lost. The data in that column will be cast from `Decimal(5,2)` to `Decimal(4,2)`.
  - You are about to alter the column `weight` on the `Option` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,3)` to `Decimal(6,2)`.
  - You are about to drop the column `type` on the `Unit` table. All the data in the column will be lost.
  - You are about to drop the column `values` on the `Unit` table. All the data in the column will be lost.
  - You are about to drop the `OptionImage` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[code]` on the table `Unit` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `stockLevel` to the `Option` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `Unit` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "OptionImage" DROP CONSTRAINT "OptionImage_optionId_fkey";

-- DropIndex
DROP INDEX "Option_variantId_color_key";

-- DropIndex
DROP INDEX "Option_variantId_idx";

-- DropIndex
DROP INDEX "Product_categoryId_idx";

-- DropIndex
DROP INDEX "Unit_name_key";

-- DropIndex
DROP INDEX "Variant_productId_idx";

-- DropIndex
DROP INDEX "Variant_productId_size_unitId_key";

-- DropIndex
DROP INDEX "Variant_unitId_idx";

-- AlterTable
ALTER TABLE "Option" ADD COLUMN     "image" TEXT[],
ADD COLUMN     "stockLevel" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "entryPrice" SET DATA TYPE DECIMAL(6,2),
ALTER COLUMN "sellPrice" SET DATA TYPE DECIMAL(6,2),
ALTER COLUMN "taxPercentage" SET DATA TYPE DECIMAL(4,2),
ALTER COLUMN "weight" SET DATA TYPE DECIMAL(6,2);

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "subcategory" DROP NOT NULL,
ALTER COLUMN "subcategory" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Unit" DROP COLUMN "type",
DROP COLUMN "values",
ADD COLUMN     "code" TEXT NOT NULL DEFAULT '';

-- DropTable
DROP TABLE "OptionImage";

-- DropEnum
DROP TYPE "UnitType";

-- CreateIndex
CREATE INDEX "Product_categoryId_isActive_idx" ON "Product"("categoryId", "isActive");

-- CreateIndex
-- Use a partial unique index to allow the default empty-string placeholder
-- to exist while enforcing uniqueness for real codes (non-empty).
CREATE UNIQUE INDEX "Unit_code_key" ON "Unit"("code") WHERE "code" <> '';

/*
  Warnings:

  - You are about to drop the column `unitId` on the `Variant` table. All the data in the column will be lost.
  - You are about to drop the `Unit` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[parentId,slug]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `attributes` to the `Category` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Variant" DROP CONSTRAINT "Variant_unitId_fkey";

-- DropIndex
DROP INDEX "Category_slug_key";

-- AlterTable
ALTER TABLE "Category" ADD COLUMN "attributes" JSONB;

-- Backfill default for existing rows
UPDATE "Category" SET "attributes" = '{}' WHERE "attributes" IS NULL;

-- Make column NOT NULL
ALTER TABLE "Category" ALTER COLUMN "attributes" SET NOT NULL;

ALTER TABLE "Category" ADD COLUMN "parentId" TEXT;

-- AlterTable
ALTER TABLE "Variant" DROP COLUMN "unitId";

-- DropTable
DROP TABLE "Unit";

-- CreateIndex
CREATE INDEX "Category_parentId_idx" ON "Category"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_parentId_slug_key" ON "Category"("parentId", "slug");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

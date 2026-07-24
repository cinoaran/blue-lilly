/*
  Warnings:

  - You are about to drop the column `color` on the `Option` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Option_variantId_color_idx";

-- AlterTable
ALTER TABLE "Option" DROP COLUMN "color";

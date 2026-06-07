/*
  Warnings:

  - You are about to drop the column `attributes` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `parentId` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the `verifications` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Category` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_parentId_fkey";

-- DropIndex
DROP INDEX "Category_parentId_idx";

-- DropIndex
DROP INDEX "Category_parentId_slug_key";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "attributes",
DROP COLUMN "parentId";

-- DropTable
DROP TABLE "verifications";

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

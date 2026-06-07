/*
  Warnings:

  - You are about to drop the column `href` on the `Category` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Category_href_key";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "href";

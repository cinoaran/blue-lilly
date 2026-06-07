/*
  Warnings:

  - You are about to drop the column `stockLevel` on the `Option` table. All the data in the column will be lost.
  - You are about to drop the column `code` on the `Unit` table. All the data in the column will be lost.
  - Added the required column `type` to the `Unit` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Unit_code_key";

-- AlterTable
ALTER TABLE "Option" DROP COLUMN "stockLevel";

-- AlterTable
ALTER TABLE "Unit" DROP COLUMN "code",
ADD COLUMN     "type" TEXT NOT NULL,
ADD COLUMN     "values" TEXT[];

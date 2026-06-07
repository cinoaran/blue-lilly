/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Unit` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `type` on the `Unit` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "UnitType" AS ENUM ('WEIGHT', 'VOLUME', 'LENGTH', 'COUNT', 'AREA');

-- AlterTable
ALTER TABLE "Unit" DROP COLUMN "type",
ADD COLUMN     "type" "UnitType" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Unit_name_key" ON "Unit"("name");

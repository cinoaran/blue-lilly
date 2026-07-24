/*
  Warnings:

  - You are about to drop the column `stockLevel` on the `Option` table. All the data in the column will be lost.
  - Changed the type of `color` on the `Option` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "BaseColor" AS ENUM ('RED', 'BLUE', 'GREEN', 'PURPLE', 'BLACK', 'WHITE', 'GREY', 'BROWN', 'YELLOW', 'ORANGE', 'PINK', 'MULTICOLOR', 'OTHER');

-- CreateEnum
CREATE TYPE "UnitCategory" AS ENUM ('INTERNATIONAL', 'LENGTH', 'WEIGHT', 'VOLUME', 'COUNT', 'OTHER');

-- AlterTable
ALTER TABLE "Option" DROP COLUMN "stockLevel",
ADD COLUMN     "displayColor" TEXT,
ADD COLUMN     "unitCategory" "UnitCategory",
ADD COLUMN     "unitValue" TEXT,
DROP COLUMN "color",
ADD COLUMN     "color" "BaseColor" NOT NULL;

-- CreateIndex
CREATE INDEX "Option_variantId_color_idx" ON "Option"("variantId", "color");

-- CreateIndex
CREATE INDEX "Option_unitCategory_unitValue_idx" ON "Option"("unitCategory", "unitValue");

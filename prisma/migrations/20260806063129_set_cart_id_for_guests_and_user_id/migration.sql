-- DropIndex
DROP INDEX "Cart_userId_idx";

-- DropIndex
DROP INDEX "Cart_userId_key";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "cartId" TEXT;

-- CreateIndex
CREATE INDEX "Cart_userId_status_idx" ON "Cart"("userId", "status");

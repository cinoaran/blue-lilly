-- CreateTable
CREATE TABLE "Carousel" (
    "id" TEXT NOT NULL,
    "kicker" TEXT,
    "title" TEXT NOT NULL,
    "teaser" TEXT,
    "cta" TEXT,
    "href" TEXT,
    "image" TEXT NOT NULL,
    "alt" TEXT,
    "theme" TEXT,
    "goal" TEXT,
    "audience" TEXT,
    "angle" TEXT,
    "trackEvent" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Carousel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Carousel_isActive_position_idx" ON "Carousel"("isActive", "position");

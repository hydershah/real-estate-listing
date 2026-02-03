-- CreateEnum
CREATE TYPE "SavedHomeStatus" AS ENUM ('SAVED', 'TOURING', 'OFFER_SUBMITTED');

-- CreateEnum
CREATE TYPE "TourStatus" AS ENUM ('REQUESTED', 'SCHEDULED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OfferStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'COUNTERED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

-- CreateTable
CREATE TABLE "SavedHome" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "price" DECIMAL(12,2),
    "bedrooms" INTEGER,
    "bathrooms" DECIMAL(3,1),
    "squareFeet" INTEGER,
    "listingUrl" TEXT,
    "notes" TEXT,
    "status" "SavedHomeStatus" NOT NULL DEFAULT 'SAVED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedHome_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tour" (
    "id" TEXT NOT NULL,
    "savedHomeId" TEXT NOT NULL,
    "requestedDate" TIMESTAMP(3),
    "scheduledDate" TIMESTAMP(3),
    "availability" TEXT,
    "status" "TourStatus" NOT NULL DEFAULT 'REQUESTED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tour_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL,
    "savedHomeId" TEXT NOT NULL,
    "amount" DECIMAL(12,2),
    "status" "OfferStatus" NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SavedHome_userId_idx" ON "SavedHome"("userId");

-- CreateIndex
CREATE INDEX "SavedHome_status_idx" ON "SavedHome"("status");

-- CreateIndex
CREATE INDEX "Tour_savedHomeId_idx" ON "Tour"("savedHomeId");

-- CreateIndex
CREATE INDEX "Tour_status_idx" ON "Tour"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Offer_savedHomeId_key" ON "Offer"("savedHomeId");

-- CreateIndex
CREATE INDEX "Offer_status_idx" ON "Offer"("status");

-- AddForeignKey
ALTER TABLE "SavedHome" ADD CONSTRAINT "SavedHome_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tour" ADD CONSTRAINT "Tour_savedHomeId_fkey" FOREIGN KEY ("savedHomeId") REFERENCES "SavedHome"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_savedHomeId_fkey" FOREIGN KEY ("savedHomeId") REFERENCES "SavedHome"("id") ON DELETE CASCADE ON UPDATE CASCADE;

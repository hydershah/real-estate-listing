-- CreateEnum
CREATE TYPE "ListingPackage" AS ENUM ('SMART_SELLER', 'FULL_SERVICE_AGENT');

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "listingPackage" "ListingPackage",
ADD COLUMN     "offersReceived" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "scheduledShowings" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "title" DROP NOT NULL,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "listingType" SET DEFAULT 'FOR_SALE';

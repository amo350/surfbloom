/*
  Warnings:

  - You are about to drop the column `locationId` on the `report` table. All the data in the column will be lost.
  - You are about to drop the `location` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "location" DROP CONSTRAINT "location_workspaceId_fkey";

-- DropForeignKey
ALTER TABLE "report" DROP CONSTRAINT "report_locationId_fkey";

-- DropIndex
DROP INDEX "report_locationId_idx";

-- AlterTable
ALTER TABLE "report" DROP COLUMN "locationId";

-- AlterTable
ALTER TABLE "workspace" ADD COLUMN     "address" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT NOT NULL DEFAULT 'US',
ADD COLUMN     "googlePlaceId" TEXT,
ADD COLUMN     "googleRating" DOUBLE PRECISION,
ADD COLUMN     "googleReviewCount" INTEGER,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "primaryCategory" TEXT,
ADD COLUMN     "secondaryCategories" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "state" TEXT,
ADD COLUMN     "timezone" TEXT,
ADD COLUMN     "website" TEXT,
ADD COLUMN     "zipCode" TEXT;

-- DropTable
DROP TABLE "location";

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "report_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

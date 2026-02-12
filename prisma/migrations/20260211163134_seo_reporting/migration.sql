-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'FETCHING', 'ANALYZING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "location" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "googlePlaceId" TEXT,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "country" TEXT NOT NULL DEFAULT 'US',
    "phone" TEXT,
    "website" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "timezone" TEXT,
    "primaryCategory" TEXT,
    "secondaryCategories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "googleRating" DOUBLE PRECISION,
    "googleReviewCount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "visibilityScore" DOUBLE PRECISION,
    "reputationScore" DOUBLE PRECISION,
    "visibilityBreakdown" JSONB,
    "reputationBreakdown" JSONB,
    "strengths" JSONB,
    "weaknesses" JSONB,
    "recommendations" JSONB,
    "rawData" JSONB,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "location_workspaceId_idx" ON "location"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "location_workspaceId_googlePlaceId_key" ON "location"("workspaceId", "googlePlaceId");

-- CreateIndex
CREATE INDEX "report_locationId_idx" ON "report"("locationId");

-- CreateIndex
CREATE INDEX "report_workspaceId_idx" ON "report"("workspaceId");

-- CreateIndex
CREATE INDEX "report_workspaceId_createdAt_idx" ON "report"("workspaceId", "createdAt");

-- AddForeignKey
ALTER TABLE "location" ADD CONSTRAINT "location_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "report_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

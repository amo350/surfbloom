-- AlterTable
ALTER TABLE "workspace" ADD COLUMN     "lastScrapedAt" TIMESTAMP(3),
ADD COLUMN     "scrapedCompetitors" JSONB,
ADD COLUMN     "scrapedPlaceData" JSONB;

-- CreateTable
CREATE TABLE "review" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "googleReviewId" TEXT,
    "authorName" TEXT,
    "authorUrl" TEXT,
    "authorImageUrl" TEXT,
    "rating" DOUBLE PRECISION NOT NULL,
    "text" TEXT,
    "publishedAt" TIMESTAMP(3),
    "ownerResponse" TEXT,
    "ownerRespondedAt" TIMESTAMP(3),
    "source" TEXT NOT NULL DEFAULT 'google',
    "language" TEXT,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "review_workspaceId_publishedAt_idx" ON "review"("workspaceId", "publishedAt");

-- CreateIndex
CREATE INDEX "review_workspaceId_rating_idx" ON "review"("workspaceId", "rating");

-- CreateIndex
CREATE INDEX "review_workspaceId_source_idx" ON "review"("workspaceId", "source");

-- CreateIndex
CREATE UNIQUE INDEX "review_workspaceId_googleReviewId_key" ON "review"("workspaceId", "googleReviewId");

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

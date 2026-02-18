/*
  Warnings:

  - A unique constraint covering the columns `[feedbackSlug]` on the table `workspace` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "workspace" ADD COLUMN     "feedbackHeading" TEXT,
ADD COLUMN     "feedbackMessage" TEXT,
ADD COLUMN     "feedbackSlug" TEXT,
ADD COLUMN     "googleReviewUrl" TEXT;

-- CreateTable
CREATE TABLE "feedback_visit" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "contactPhone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedback_visit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "feedback_visit_workspaceId_idx" ON "feedback_visit"("workspaceId");

-- CreateIndex
CREATE INDEX "feedback_visit_workspaceId_createdAt_idx" ON "feedback_visit"("workspaceId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_feedbackSlug_key" ON "workspace"("feedbackSlug");

-- AddForeignKey
ALTER TABLE "feedback_visit" ADD CONSTRAINT "feedback_visit_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "campaign" ADD COLUMN     "surveyId" TEXT;

-- CreateIndex
CREATE INDEX "campaign_surveyId_idx" ON "campaign"("surveyId");

-- AddForeignKey
ALTER TABLE "campaign" ADD CONSTRAINT "campaign_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "survey"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "campaign" ADD COLUMN "parentCampaignId" TEXT;

-- CreateIndex
CREATE INDEX "campaign_parentCampaignId_idx" ON "campaign"("parentCampaignId");

-- AddForeignKey
ALTER TABLE "campaign" ADD CONSTRAINT "campaign_parentCampaignId_fkey"
    FOREIGN KEY ("parentCampaignId") REFERENCES "campaign"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

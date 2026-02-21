-- AlterTable
ALTER TABLE "campaign" ADD COLUMN     "lastRecurredAt" TIMESTAMP(3),
ADD COLUMN     "recurringDay" INTEGER,
ADD COLUMN     "recurringEndAt" TIMESTAMP(3),
ADD COLUMN     "recurringTime" TEXT,
ADD COLUMN     "recurringType" TEXT,
ADD COLUMN     "segmentId" TEXT,
ADD COLUMN     "sendWindowEnd" TEXT,
ADD COLUMN     "sendWindowStart" TEXT,
ADD COLUMN     "subject" TEXT,
ADD COLUMN     "templateId" TEXT,
ADD COLUMN     "variantADelivered" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "variantAReplied" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "variantASent" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "variantB" TEXT,
ADD COLUMN     "variantBDelivered" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "variantBReplied" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "variantBSent" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "variantSplit" INTEGER NOT NULL DEFAULT 50;

-- AlterTable
ALTER TABLE "campaign_recipient" ADD COLUMN     "variant" TEXT;

-- CreateTable
CREATE TABLE "campaign_template" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'custom',
    "channel" TEXT NOT NULL DEFAULT 'sms',
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "isLibrary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaign_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_segment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "audienceType" TEXT NOT NULL DEFAULT 'all',
    "audienceStage" TEXT,
    "audienceCategoryId" TEXT,
    "audienceInactiveDays" INTEGER,
    "frequencyCapDays" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saved_segment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "campaign_template_userId_idx" ON "campaign_template"("userId");

-- CreateIndex
CREATE INDEX "campaign_template_category_idx" ON "campaign_template"("category");

-- CreateIndex
CREATE INDEX "campaign_template_isLibrary_idx" ON "campaign_template"("isLibrary");

-- CreateIndex
CREATE INDEX "saved_segment_userId_idx" ON "saved_segment"("userId");

-- CreateIndex
CREATE INDEX "campaign_templateId_idx" ON "campaign"("templateId");

-- CreateIndex
CREATE INDEX "campaign_segmentId_idx" ON "campaign"("segmentId");

-- CreateIndex
CREATE INDEX "campaign_recurringType_idx" ON "campaign"("recurringType");

-- AddForeignKey
ALTER TABLE "campaign" ADD CONSTRAINT "campaign_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "campaign_template"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign" ADD CONSTRAINT "campaign_segmentId_fkey" FOREIGN KEY ("segmentId") REFERENCES "saved_segment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_template" ADD CONSTRAINT "campaign_template_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_segment" ADD CONSTRAINT "saved_segment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

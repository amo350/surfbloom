-- AlterTable
ALTER TABLE "campaign" ADD COLUMN "unsubscribeLink" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "campaign_recipient" ADD COLUMN "aiRepliesSent" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "campaign_auto_reply" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "tone" TEXT NOT NULL DEFAULT 'friendly',
    "context" TEXT,
    "maxReplies" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaign_auto_reply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_link" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "originalUrl" TEXT NOT NULL,
    "shortCode" TEXT NOT NULL,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_link_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_link_click" (
    "id" TEXT NOT NULL,
    "linkId" TEXT NOT NULL,
    "recipientId" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_link_click_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "text_to_join_keyword" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "autoReply" TEXT NOT NULL,
    "stage" TEXT NOT NULL DEFAULT 'new_lead',
    "categoryId" TEXT,
    "source" TEXT NOT NULL DEFAULT 'text_to_join',
    "contactCount" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "text_to_join_keyword_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "campaign_auto_reply_campaignId_key" ON "campaign_auto_reply"("campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "campaign_link_shortCode_key" ON "campaign_link"("shortCode");

-- CreateIndex
CREATE INDEX "campaign_link_campaignId_idx" ON "campaign_link"("campaignId");

-- CreateIndex
CREATE INDEX "campaign_link_click_linkId_idx" ON "campaign_link_click"("linkId");

-- CreateIndex
CREATE INDEX "campaign_link_click_recipientId_idx" ON "campaign_link_click"("recipientId");

-- CreateIndex
CREATE UNIQUE INDEX "text_to_join_keyword_workspaceId_keyword_key" ON "text_to_join_keyword"("workspaceId", "keyword");

-- CreateIndex
CREATE INDEX "text_to_join_keyword_workspaceId_idx" ON "text_to_join_keyword"("workspaceId");

-- AddForeignKey
ALTER TABLE "campaign_auto_reply" ADD CONSTRAINT "campaign_auto_reply_campaignId_fkey"
    FOREIGN KEY ("campaignId") REFERENCES "campaign"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_link" ADD CONSTRAINT "campaign_link_campaignId_fkey"
    FOREIGN KEY ("campaignId") REFERENCES "campaign"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_link_click" ADD CONSTRAINT "campaign_link_click_linkId_fkey"
    FOREIGN KEY ("linkId") REFERENCES "campaign_link"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_link_click" ADD CONSTRAINT "campaign_link_click_recipientId_fkey"
    FOREIGN KEY ("recipientId") REFERENCES "campaign_recipient"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "text_to_join_keyword" ADD CONSTRAINT "text_to_join_keyword_workspaceId_fkey"
    FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

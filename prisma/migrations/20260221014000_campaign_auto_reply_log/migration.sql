CREATE TABLE "campaign_auto_reply_log" (
    "id" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "inboundMessage" TEXT NOT NULL,
    "aiResponse" TEXT NOT NULL,
    "tone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "campaign_auto_reply_log_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "campaign_auto_reply_log_recipientId_idx" ON "campaign_auto_reply_log"("recipientId");
CREATE INDEX "campaign_auto_reply_log_campaignId_idx" ON "campaign_auto_reply_log"("campaignId");

ALTER TABLE "campaign_auto_reply_log" ADD CONSTRAINT "campaign_auto_reply_log_recipientId_fkey"
    FOREIGN KEY ("recipientId") REFERENCES "campaign_recipient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "campaign_auto_reply_log" ADD CONSTRAINT "campaign_auto_reply_log_campaignId_fkey"
    FOREIGN KEY ("campaignId") REFERENCES "campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "workspace" ADD COLUMN     "fromEmail" TEXT,
ADD COLUMN     "fromEmailName" TEXT;

-- CreateTable
CREATE TABLE "campaign_sequence" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "audienceType" TEXT NOT NULL DEFAULT 'all',
    "audienceStage" TEXT,
    "audienceCategoryId" TEXT,
    "audienceInactiveDays" INTEGER,
    "frequencyCapDays" INTEGER,
    "triggerType" TEXT NOT NULL DEFAULT 'manual',
    "triggerValue" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaign_sequence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_sequence_step" (
    "id" TEXT NOT NULL,
    "sequenceId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'sms',
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "templateId" TEXT,
    "delayMinutes" INTEGER NOT NULL DEFAULT 0,
    "conditionType" TEXT,
    "conditionAction" TEXT NOT NULL DEFAULT 'continue',
    "sendWindowStart" TEXT,
    "sendWindowEnd" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_sequence_step_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_sequence_enrollment" (
    "id" TEXT NOT NULL,
    "sequenceId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "currentStep" INTEGER NOT NULL DEFAULT 0,
    "nextStepAt" TIMESTAMP(3),
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "stoppedAt" TIMESTAMP(3),
    "stoppedReason" TEXT,

    CONSTRAINT "campaign_sequence_enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_sequence_step_log" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "messageId" TEXT,
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "skippedReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_sequence_step_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_template" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "htmlBody" TEXT NOT NULL,
    "textBody" TEXT,
    "category" TEXT NOT NULL DEFAULT 'custom',
    "isLibrary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_send" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT,
    "recipientId" TEXT,
    "contactId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "toEmail" TEXT NOT NULL,
    "fromEmail" TEXT NOT NULL,
    "fromName" TEXT,
    "subject" TEXT NOT NULL,
    "providerId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "openCount" INTEGER NOT NULL DEFAULT 0,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "bouncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_send_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_endpoint" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "events" TEXT[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastStatus" INTEGER,
    "lastError" TEXT,
    "lastFiredAt" TIMESTAMP(3),
    "failCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "webhook_endpoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_delivery" (
    "id" TEXT NOT NULL,
    "endpointId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "status" INTEGER,
    "responseBody" TEXT,
    "duration" INTEGER,
    "error" TEXT,
    "attemptCount" INTEGER NOT NULL DEFAULT 1,
    "nextRetryAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_delivery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "campaign_sequence_workspaceId_idx" ON "campaign_sequence"("workspaceId");

-- CreateIndex
CREATE INDEX "campaign_sequence_status_idx" ON "campaign_sequence"("status");

-- CreateIndex
CREATE INDEX "campaign_sequence_step_sequenceId_order_idx" ON "campaign_sequence_step"("sequenceId", "order");

-- CreateIndex
CREATE INDEX "campaign_sequence_enrollment_sequenceId_status_idx" ON "campaign_sequence_enrollment"("sequenceId", "status");

-- CreateIndex
CREATE INDEX "campaign_sequence_enrollment_contactId_idx" ON "campaign_sequence_enrollment"("contactId");

-- CreateIndex
CREATE INDEX "campaign_sequence_enrollment_nextStepAt_idx" ON "campaign_sequence_enrollment"("nextStepAt");

-- CreateIndex
CREATE UNIQUE INDEX "campaign_sequence_enrollment_sequenceId_contactId_key" ON "campaign_sequence_enrollment"("sequenceId", "contactId");

-- CreateIndex
CREATE INDEX "campaign_sequence_step_log_enrollmentId_idx" ON "campaign_sequence_step_log"("enrollmentId");

-- CreateIndex
CREATE INDEX "campaign_sequence_step_log_stepId_idx" ON "campaign_sequence_step_log"("stepId");

-- CreateIndex
CREATE INDEX "email_template_userId_category_idx" ON "email_template"("userId", "category");

-- CreateIndex
CREATE INDEX "email_send_campaignId_idx" ON "email_send"("campaignId");

-- CreateIndex
CREATE INDEX "email_send_contactId_idx" ON "email_send"("contactId");

-- CreateIndex
CREATE INDEX "email_send_workspaceId_idx" ON "email_send"("workspaceId");

-- CreateIndex
CREATE INDEX "email_send_providerId_idx" ON "email_send"("providerId");

-- CreateIndex
CREATE INDEX "webhook_endpoint_workspaceId_idx" ON "webhook_endpoint"("workspaceId");

-- CreateIndex
CREATE INDEX "webhook_delivery_endpointId_idx" ON "webhook_delivery"("endpointId");

-- CreateIndex
CREATE INDEX "webhook_delivery_nextRetryAt_idx" ON "webhook_delivery"("nextRetryAt");

-- AddForeignKey
ALTER TABLE "campaign_sequence" ADD CONSTRAINT "campaign_sequence_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_sequence" ADD CONSTRAINT "campaign_sequence_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_sequence_step" ADD CONSTRAINT "campaign_sequence_step_sequenceId_fkey" FOREIGN KEY ("sequenceId") REFERENCES "campaign_sequence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_sequence_enrollment" ADD CONSTRAINT "campaign_sequence_enrollment_sequenceId_fkey" FOREIGN KEY ("sequenceId") REFERENCES "campaign_sequence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_sequence_enrollment" ADD CONSTRAINT "campaign_sequence_enrollment_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "chat_contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_sequence_step_log" ADD CONSTRAINT "campaign_sequence_step_log_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "campaign_sequence_enrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_sequence_step_log" ADD CONSTRAINT "campaign_sequence_step_log_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "campaign_sequence_step"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_template" ADD CONSTRAINT "email_template_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_send" ADD CONSTRAINT "email_send_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_send" ADD CONSTRAINT "email_send_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "campaign_recipient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webhook_endpoint" ADD CONSTRAINT "webhook_endpoint_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webhook_delivery" ADD CONSTRAINT "webhook_delivery_endpointId_fkey" FOREIGN KEY ("endpointId") REFERENCES "webhook_endpoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

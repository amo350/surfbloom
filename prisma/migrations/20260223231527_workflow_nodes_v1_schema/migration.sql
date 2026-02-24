/*
  Warnings:

  - You are about to drop the `SurveyTemplate` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[workspaceId,contactId,channel]` on the table `chat_room` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "ExecutionStatus" ADD VALUE 'WAITING';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NodeType" ADD VALUE 'CONTACT_CREATED';
ALTER TYPE "NodeType" ADD VALUE 'REVIEW_RECEIVED';
ALTER TYPE "NodeType" ADD VALUE 'SMS_RECEIVED';
ALTER TYPE "NodeType" ADD VALUE 'FEEDBACK_SUBMITTED';
ALTER TYPE "NodeType" ADD VALUE 'STAGE_CHANGED';
ALTER TYPE "NodeType" ADD VALUE 'CATEGORY_ADDED';
ALTER TYPE "NodeType" ADD VALUE 'SURVEY_COMPLETED';
ALTER TYPE "NodeType" ADD VALUE 'KEYWORD_JOINED';
ALTER TYPE "NodeType" ADD VALUE 'TASK_COMPLETED';
ALTER TYPE "NodeType" ADD VALUE 'SCHEDULE';
ALTER TYPE "NodeType" ADD VALUE 'SEND_SMS';
ALTER TYPE "NodeType" ADD VALUE 'SEND_EMAIL';
ALTER TYPE "NodeType" ADD VALUE 'CREATE_TASK';
ALTER TYPE "NodeType" ADD VALUE 'UPDATE_STAGE';
ALTER TYPE "NodeType" ADD VALUE 'ADD_CATEGORY';
ALTER TYPE "NodeType" ADD VALUE 'REMOVE_CATEGORY';
ALTER TYPE "NodeType" ADD VALUE 'REQUEST_REVIEW';
ALTER TYPE "NodeType" ADD VALUE 'ENROLL_SEQUENCE';
ALTER TYPE "NodeType" ADD VALUE 'POST_SLACK';
ALTER TYPE "NodeType" ADD VALUE 'POST_SOCIAL';
ALTER TYPE "NodeType" ADD VALUE 'LOG_NOTE';
ALTER TYPE "NodeType" ADD VALUE 'QUERY_CONTACTS';
ALTER TYPE "NodeType" ADD VALUE 'ASSIGN_CONTACT';
ALTER TYPE "NodeType" ADD VALUE 'SEND_WEBHOOK';
ALTER TYPE "NodeType" ADD VALUE 'IF_ELSE';
ALTER TYPE "NodeType" ADD VALUE 'SWITCH';
ALTER TYPE "NodeType" ADD VALUE 'WAIT';
ALTER TYPE "NodeType" ADD VALUE 'WAIT_UNTIL';
ALTER TYPE "NodeType" ADD VALUE 'FOR_EACH';
ALTER TYPE "NodeType" ADD VALUE 'GOAL';
ALTER TYPE "NodeType" ADD VALUE 'AI_NODE';

-- DropForeignKey
ALTER TABLE "SurveyTemplate" DROP CONSTRAINT "SurveyTemplate_createdBy_fkey";

-- AlterTable
ALTER TABLE "execution" ADD COLUMN     "currentNodeId" TEXT,
ADD COLUMN     "nextStepAt" TIMESTAMP(3),
ADD COLUMN     "triggerDepth" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "triggerType" TEXT,
ADD COLUMN     "waitingAtNodeId" TEXT;

-- AlterTable
ALTER TABLE "workflow" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "workspace" ADD COLUMN     "aiDailyCallLimit" INTEGER,
ADD COLUMN     "aiMonthlyBudgetCents" INTEGER,
ADD COLUMN     "aiPreferredModel" TEXT,
ADD COLUMN     "aiPreferredProvider" TEXT,
ADD COLUMN     "brandIndustry" TEXT,
ADD COLUMN     "brandInstructions" TEXT,
ADD COLUMN     "brandServices" TEXT,
ADD COLUMN     "brandTone" TEXT,
ADD COLUMN     "brandUsps" TEXT;

-- DropTable
DROP TABLE "SurveyTemplate";

-- CreateTable
CREATE TABLE "ai_usage_log" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "nodeId" TEXT,
    "workflowId" TEXT,
    "executionId" TEXT,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "inputTokens" INTEGER NOT NULL,
    "outputTokens" INTEGER NOT NULL,
    "estimatedCost" DOUBLE PRECISION NOT NULL,
    "purpose" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_usage_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "survey_template" (
    "id" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "questions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "survey_template_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ai_usage_log_workspaceId_idx" ON "ai_usage_log"("workspaceId");

-- CreateIndex
CREATE INDEX "ai_usage_log_workspaceId_createdAt_idx" ON "ai_usage_log"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "survey_template_createdBy_idx" ON "survey_template"("createdBy");

-- CreateIndex
CREATE UNIQUE INDEX "chat_room_workspaceId_contactId_channel_key" ON "chat_room"("workspaceId", "contactId", "channel");

-- AddForeignKey
ALTER TABLE "ai_usage_log" ADD CONSTRAINT "ai_usage_log_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_template" ADD CONSTRAINT "survey_template_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the column `workspaceId` on the `chatbot` table. All the data in the column will be lost.
  - You are about to drop the column `workspaceId` on the `filter_question` table. All the data in the column will be lost.
  - You are about to drop the column `workspaceId` on the `help_desk_item` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[domainId]` on the table `chatbot` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `domainId` to the `chat_contact` table without a default value. This is not possible if the table is not empty.
  - Added the required column `domainId` to the `chat_room` table without a default value. This is not possible if the table is not empty.
  - Added the required column `domainId` to the `chatbot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `domainId` to the `filter_question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `domainId` to the `help_desk_item` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "chat_contact" DROP CONSTRAINT "chat_contact_workspaceId_fkey";

-- DropForeignKey
ALTER TABLE "chat_room" DROP CONSTRAINT "chat_room_workspaceId_fkey";

-- DropForeignKey
ALTER TABLE "chatbot" DROP CONSTRAINT "chatbot_workspaceId_fkey";

-- DropForeignKey
ALTER TABLE "filter_question" DROP CONSTRAINT "filter_question_workspaceId_fkey";

-- DropForeignKey
ALTER TABLE "help_desk_item" DROP CONSTRAINT "help_desk_item_workspaceId_fkey";

-- DropIndex
DROP INDEX "chat_contact_workspaceId_email_idx";

-- DropIndex
DROP INDEX "chat_room_workspaceId_createdAt_idx";

-- DropIndex
DROP INDEX "chatbot_workspaceId_idx";

-- DropIndex
DROP INDEX "chatbot_workspaceId_key";

-- DropIndex
DROP INDEX "filter_question_workspaceId_idx";

-- DropIndex
DROP INDEX "help_desk_item_workspaceId_idx";

-- AlterTable
ALTER TABLE "chat_contact" ADD COLUMN     "domainId" TEXT NOT NULL,
ALTER COLUMN "workspaceId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "chat_room" ADD COLUMN     "domainId" TEXT NOT NULL,
ALTER COLUMN "workspaceId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "chatbot" DROP COLUMN "workspaceId",
ADD COLUMN     "domainId" TEXT NOT NULL,
ALTER COLUMN "welcomeMessage" SET DEFAULT 'Hey there! How can we help you today?';

-- AlterTable
ALTER TABLE "filter_question" DROP COLUMN "workspaceId",
ADD COLUMN     "domainId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "help_desk_item" DROP COLUMN "workspaceId",
ADD COLUMN     "domainId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "chat_contact_domainId_idx" ON "chat_contact"("domainId");

-- CreateIndex
CREATE INDEX "chat_contact_domainId_email_idx" ON "chat_contact"("domainId", "email");

-- CreateIndex
CREATE INDEX "chat_room_domainId_idx" ON "chat_room"("domainId");

-- CreateIndex
CREATE INDEX "chat_room_domainId_createdAt_idx" ON "chat_room"("domainId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "chatbot_domainId_key" ON "chatbot"("domainId");

-- CreateIndex
CREATE INDEX "chatbot_domainId_idx" ON "chatbot"("domainId");

-- CreateIndex
CREATE INDEX "filter_question_domainId_idx" ON "filter_question"("domainId");

-- CreateIndex
CREATE INDEX "help_desk_item_domainId_idx" ON "help_desk_item"("domainId");

-- AddForeignKey
ALTER TABLE "chatbot" ADD CONSTRAINT "chatbot_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "help_desk_item" ADD CONSTRAINT "help_desk_item_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "filter_question" ADD CONSTRAINT "filter_question_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_contact" ADD CONSTRAINT "chat_contact_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_contact" ADD CONSTRAINT "chat_contact_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_room" ADD CONSTRAINT "chat_room_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_room" ADD CONSTRAINT "chat_room_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;

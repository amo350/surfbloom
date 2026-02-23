/*
  Warnings:

  - A unique constraint covering the columns `[userId,name]` on the table `email_template` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "campaign_sequence_step_log" ADD COLUMN     "repliedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "email_template_userId_name_key" ON "email_template"("userId", "name");

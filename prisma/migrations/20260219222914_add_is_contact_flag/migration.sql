-- AlterTable
ALTER TABLE "chat_contact" ADD COLUMN     "isContact" BOOLEAN NOT NULL DEFAULT false;

-- Backfill: any contact created via manual, csv, or webhook is a real contact
UPDATE "chat_contact" SET "isContact" = true
WHERE "source" IN ('manual', 'csv', 'webhook')
   OR "firstName" IS NOT NULL;

-- AlterTable
ALTER TABLE "workspace" ADD COLUMN     "webhookSecret" TEXT;

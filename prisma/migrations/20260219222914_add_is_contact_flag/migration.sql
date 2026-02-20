-- AlterTable
ALTER TABLE "chat_contact" ADD COLUMN     "isContact" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "workspace" ADD COLUMN     "webhookSecret" TEXT;

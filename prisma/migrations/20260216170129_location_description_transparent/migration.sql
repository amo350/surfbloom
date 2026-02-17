-- AlterTable
ALTER TABLE "chatbot" ADD COLUMN     "bubbleTransparent" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "workspace" ADD COLUMN     "description" TEXT,
ADD COLUMN     "paymentLink" TEXT;

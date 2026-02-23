-- AlterTable
ALTER TABLE "survey_enrollment" ADD COLUMN     "channel" TEXT NOT NULL DEFAULT 'web',
ADD COLUMN     "currentStep" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastMessageAt" TIMESTAMP(3),
ADD COLUMN     "retryCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "timeoutAt" TIMESTAMP(3);

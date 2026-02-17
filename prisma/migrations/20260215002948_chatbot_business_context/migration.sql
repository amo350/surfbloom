-- AlterTable
ALTER TABLE "chatbot" ADD COLUMN     "businessContext" TEXT,
ALTER COLUMN "welcomeMessage" SET DEFAULT 'Hi, how can we assist you today?';

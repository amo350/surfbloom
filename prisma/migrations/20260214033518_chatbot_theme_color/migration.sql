/*
  Warnings:

  - You are about to drop the column `background` on the `chatbot` table. All the data in the column will be lost.
  - You are about to drop the column `textColor` on the `chatbot` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "chatbot" DROP COLUMN "background",
DROP COLUMN "textColor",
ADD COLUMN     "themeColor" TEXT DEFAULT '#14b8a6',
ALTER COLUMN "welcomeMessage" SET DEFAULT 'Hey there, How can we assist?';

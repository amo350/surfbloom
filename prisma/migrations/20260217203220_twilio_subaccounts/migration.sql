/*
  Warnings:

  - You are about to drop the column `accountSid` on the `twilio_config` table. All the data in the column will be lost.
  - You are about to drop the column `authToken` on the `twilio_config` table. All the data in the column will be lost.
  - You are about to drop the column `isValid` on the `twilio_config` table. All the data in the column will be lost.
  - Added the required column `subaccountSid` to the `twilio_config` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subaccountToken` to the `twilio_config` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "twilio_config" DROP COLUMN "accountSid",
DROP COLUMN "authToken",
DROP COLUMN "isValid",
ADD COLUMN     "friendlyName" TEXT,
ADD COLUMN     "subaccountSid" TEXT NOT NULL,
ADD COLUMN     "subaccountToken" TEXT NOT NULL;

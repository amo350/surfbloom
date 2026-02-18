/*
  Warnings:

  - You are about to drop the column `brandSid` on the `twilio_config` table. All the data in the column will be lost.
  - You are about to drop the column `brandStatus` on the `twilio_config` table. All the data in the column will be lost.
  - You are about to drop the column `businessAddress` on the `twilio_config` table. All the data in the column will be lost.
  - You are about to drop the column `businessCity` on the `twilio_config` table. All the data in the column will be lost.
  - You are about to drop the column `businessIndustry` on the `twilio_config` table. All the data in the column will be lost.
  - You are about to drop the column `businessName` on the `twilio_config` table. All the data in the column will be lost.
  - You are about to drop the column `businessState` on the `twilio_config` table. All the data in the column will be lost.
  - You are about to drop the column `businessType` on the `twilio_config` table. All the data in the column will be lost.
  - You are about to drop the column `businessWebsite` on the `twilio_config` table. All the data in the column will be lost.
  - You are about to drop the column `businessZip` on the `twilio_config` table. All the data in the column will be lost.
  - You are about to drop the column `campaignSid` on the `twilio_config` table. All the data in the column will be lost.
  - You are about to drop the column `campaignStatus` on the `twilio_config` table. All the data in the column will be lost.
  - You are about to drop the column `contactEmail` on the `twilio_config` table. All the data in the column will be lost.
  - You are about to drop the column `contactPhone` on the `twilio_config` table. All the data in the column will be lost.
  - You are about to drop the column `ein` on the `twilio_config` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "twilio_config" DROP COLUMN "brandSid",
DROP COLUMN "brandStatus",
DROP COLUMN "businessAddress",
DROP COLUMN "businessCity",
DROP COLUMN "businessIndustry",
DROP COLUMN "businessName",
DROP COLUMN "businessState",
DROP COLUMN "businessType",
DROP COLUMN "businessWebsite",
DROP COLUMN "businessZip",
DROP COLUMN "campaignSid",
DROP COLUMN "campaignStatus",
DROP COLUMN "contactEmail",
DROP COLUMN "contactPhone",
DROP COLUMN "ein",
ADD COLUMN     "messagingServiceSid" TEXT;

-- DropEnum
DROP TYPE "VerificationStatus";

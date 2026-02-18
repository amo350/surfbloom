-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('NOT_STARTED', 'PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "twilio_config" ADD COLUMN     "brandSid" TEXT,
ADD COLUMN     "brandStatus" "VerificationStatus" NOT NULL DEFAULT 'NOT_STARTED',
ADD COLUMN     "businessAddress" TEXT,
ADD COLUMN     "businessCity" TEXT,
ADD COLUMN     "businessIndustry" TEXT,
ADD COLUMN     "businessName" TEXT,
ADD COLUMN     "businessState" TEXT,
ADD COLUMN     "businessType" TEXT,
ADD COLUMN     "businessWebsite" TEXT,
ADD COLUMN     "businessZip" TEXT,
ADD COLUMN     "campaignSid" TEXT,
ADD COLUMN     "campaignStatus" "VerificationStatus" NOT NULL DEFAULT 'NOT_STARTED',
ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "contactPhone" TEXT,
ADD COLUMN     "ein" TEXT;

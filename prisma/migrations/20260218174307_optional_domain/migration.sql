-- AlterTable
ALTER TABLE "chat_contact" ALTER COLUMN "domainId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "chat_room" ALTER COLUMN "domainId" DROP NOT NULL;

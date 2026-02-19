-- AlterTable
ALTER TABLE "chat_contact" ADD COLUMN     "phone" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "chat_contact_workspaceId_phone_key" ON "chat_contact"("workspaceId", "phone");

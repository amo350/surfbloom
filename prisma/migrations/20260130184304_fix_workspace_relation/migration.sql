-- AlterTable
ALTER TABLE "user" ADD COLUMN     "accountOwnerId" TEXT;

-- CreateIndex
CREATE INDEX "user_accountOwnerId_idx" ON "user"("accountOwnerId");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_accountOwnerId_fkey" FOREIGN KEY ("accountOwnerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

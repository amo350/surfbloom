-- CreateEnum
CREATE TYPE "AccountRole" AS ENUM ('OWNER', 'MANAGER', 'USER');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "accountRole" "AccountRole" NOT NULL DEFAULT 'USER',
ADD COLUMN     "mainWorkspaceId" TEXT;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_mainWorkspaceId_fkey" FOREIGN KEY ("mainWorkspaceId") REFERENCES "workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;

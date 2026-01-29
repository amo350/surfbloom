/*
  Warnings:

  - A unique constraint covering the columns `[inviteCode]` on the table `workspace` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `inviteCode` to the `workspace` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MemberRole" AS ENUM ('ADMIN', 'MEMBER');

-- AlterTable: add inviteCode as nullable first
ALTER TABLE "workspace" ADD COLUMN "inviteCode" TEXT;

-- Backfill existing workspace rows with unique values (where inviteCode IS NULL)
UPDATE "workspace"
SET "inviteCode" = upper(substring(encode(gen_random_bytes(4), 'hex') FROM 1 FOR 7))
WHERE "inviteCode" IS NULL;

-- Set NOT NULL after backfill
ALTER TABLE "workspace" ALTER COLUMN "inviteCode" SET NOT NULL;

-- CreateTable
CREATE TABLE "member" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "role" "MemberRole" NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "member_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "member_userId_idx" ON "member"("userId");

-- CreateIndex
CREATE INDEX "member_workspaceId_idx" ON "member"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "member_userId_workspaceId_key" ON "member"("userId", "workspaceId");

-- CreateIndex: UNIQUE on inviteCode after NOT NULL is set
CREATE UNIQUE INDEX "workspace_inviteCode_key" ON "workspace"("inviteCode");

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill workspaceId on existing contacts when possible (from linked domain)
UPDATE "chat_contact" AS cc
SET "workspaceId" = d."workspaceId"
FROM "domain" AS d
WHERE cc."workspaceId" IS NULL
  AND cc."domainId" = d."id"
  AND d."workspaceId" IS NOT NULL;

-- AlterTable
ALTER TABLE "chat_contact"
ADD COLUMN "firstName" TEXT,
ADD COLUMN "lastName" TEXT,
ADD COLUMN "imageUrl" TEXT,
ADD COLUMN "stage" TEXT NOT NULL DEFAULT 'new_lead',
ADD COLUMN "source" TEXT NOT NULL DEFAULT 'manual',
ADD COLUMN "notes" TEXT,
ADD COLUMN "assignedToId" TEXT,
ADD COLUMN "lastContactedAt" TIMESTAMP(3);

-- Update relation behavior and required workspace reference
ALTER TABLE "chat_contact" DROP CONSTRAINT IF EXISTS "chat_contact_workspaceId_fkey";
ALTER TABLE "chat_contact" DROP CONSTRAINT IF EXISTS "chat_contact_domainId_fkey";

ALTER TABLE "chat_contact"
ALTER COLUMN "workspaceId" SET NOT NULL;

ALTER TABLE "chat_contact"
ADD CONSTRAINT "chat_contact_workspaceId_fkey"
FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "chat_contact"
ADD CONSTRAINT "chat_contact_domainId_fkey"
FOREIGN KEY ("domainId") REFERENCES "domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "chat_contact"
ADD CONSTRAINT "chat_contact_assignedToId_fkey"
FOREIGN KEY ("assignedToId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Remove old contact indexes that no longer match schema
DROP INDEX IF EXISTS "chat_contact_workspaceId_phone_key";
DROP INDEX IF EXISTS "chat_contact_domainId_idx";
DROP INDEX IF EXISTS "chat_contact_domainId_email_idx";

-- CreateIndex
CREATE INDEX IF NOT EXISTS "chat_contact_workspaceId_email_idx" ON "chat_contact"("workspaceId", "email");
CREATE INDEX IF NOT EXISTS "chat_contact_workspaceId_phone_idx" ON "chat_contact"("workspaceId", "phone");
CREATE INDEX IF NOT EXISTS "chat_contact_workspaceId_stage_idx" ON "chat_contact"("workspaceId", "stage");
CREATE INDEX IF NOT EXISTS "chat_contact_assignedToId_idx" ON "chat_contact"("assignedToId");

-- AlterTable
ALTER TABLE "task" ADD COLUMN "contactId" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "task_contactId_idx" ON "task"("contactId");

-- AddForeignKey
ALTER TABLE "task"
ADD CONSTRAINT "task_contactId_fkey"
FOREIGN KEY ("contactId") REFERENCES "chat_contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "category" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "color" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_category" (
  "id" TEXT NOT NULL,
  "contactId" TEXT NOT NULL,
  "categoryId" TEXT NOT NULL,
  CONSTRAINT "contact_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity" (
  "id" TEXT NOT NULL,
  "contactId" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "category_workspaceId_name_key" ON "category"("workspaceId", "name");
CREATE INDEX "category_workspaceId_idx" ON "category"("workspaceId");

CREATE UNIQUE INDEX "contact_category_contactId_categoryId_key" ON "contact_category"("contactId", "categoryId");
CREATE INDEX "contact_category_contactId_idx" ON "contact_category"("contactId");
CREATE INDEX "contact_category_categoryId_idx" ON "contact_category"("categoryId");

CREATE INDEX "activity_contactId_idx" ON "activity"("contactId");
CREATE INDEX "activity_contactId_createdAt_idx" ON "activity"("contactId", "createdAt");
CREATE INDEX "activity_workspaceId_idx" ON "activity"("workspaceId");

-- AddForeignKey
ALTER TABLE "category"
ADD CONSTRAINT "category_workspaceId_fkey"
FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "contact_category"
ADD CONSTRAINT "contact_category_contactId_fkey"
FOREIGN KEY ("contactId") REFERENCES "chat_contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "contact_category"
ADD CONSTRAINT "contact_category_categoryId_fkey"
FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "activity"
ADD CONSTRAINT "activity_contactId_fkey"
FOREIGN KEY ("contactId") REFERENCES "chat_contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "activity"
ADD CONSTRAINT "activity_workspaceId_fkey"
FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

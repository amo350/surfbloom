DROP INDEX IF EXISTS "chat_contact_workspaceId_phone_idx";

CREATE UNIQUE INDEX IF NOT EXISTS "chat_contact_workspaceId_phone_key"
  ON "chat_contact"("workspaceId", "phone");

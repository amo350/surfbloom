-- Step 1: Add userId as nullable
ALTER TABLE "stage" ADD COLUMN "userId" TEXT;

-- Step 2: Backfill userId from workspace owner (first member)
UPDATE "stage" s
SET "userId" = (
  SELECT m."userId"
  FROM "member" m
  WHERE m."workspaceId" = s."workspaceId"
  ORDER BY m."createdAt" ASC
  LIMIT 1
);

-- Step 3: Delete any orphaned stages with no user
DELETE FROM "stage" WHERE "userId" IS NULL;

-- Step 4: Make userId required
ALTER TABLE "stage" ALTER COLUMN "userId" SET NOT NULL;

-- Step 5: Drop old workspaceId column and constraint
ALTER TABLE "stage" DROP CONSTRAINT IF EXISTS "stage_workspaceId_slug_key";
ALTER TABLE "stage" DROP COLUMN "workspaceId";

-- Step 6: Dedupe — if multiple workspaces seeded the same slugs, keep one row per user+slug
DELETE FROM "stage" a
USING "stage" b
WHERE a."userId" = b."userId"
  AND a."slug" = b."slug"
  AND a."id" > b."id";

-- Step 7: Add new constraints
ALTER TABLE "stage" ADD CONSTRAINT "stage_userId_slug_key" UNIQUE ("userId", "slug");
ALTER TABLE "stage" ADD CONSTRAINT "stage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

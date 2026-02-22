-- Pre-migration cleanup for EmailTemplate @@unique([userId, name]).
-- Run this once before applying the migration that enforces uniqueness.
--
-- Strategy:
-- 1) Keep the most recently updated row per (userId, name)
-- 2) Rename older duplicates with deterministic suffixes so no rows are lost
--
-- Verify duplicate groups first:
-- SELECT "userId", "name", COUNT(*) AS duplicate_count
-- FROM "email_template"
-- GROUP BY "userId", "name"
-- HAVING COUNT(*) > 1;

WITH ranked_templates AS (
  SELECT
    id,
    "userId",
    "name",
    ROW_NUMBER() OVER (
      PARTITION BY "userId", "name"
      ORDER BY "updatedAt" DESC, "createdAt" DESC, id DESC
    ) AS row_num
  FROM "email_template"
),
duplicates AS (
  SELECT
    id,
    "userId",
    "name",
    row_num
  FROM ranked_templates
  WHERE row_num > 1
)
UPDATE "email_template" AS et
SET "name" = CONCAT(
  et."name",
  ' (duplicate ',
  d.row_num - 1,
  ')'
)
FROM duplicates AS d
WHERE et.id = d.id;

-- Optional post-check:
-- SELECT "userId", "name", COUNT(*) AS duplicate_count
-- FROM "email_template"
-- GROUP BY "userId", "name"
-- HAVING COUNT(*) > 1;

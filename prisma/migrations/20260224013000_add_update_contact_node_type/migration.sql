DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'NodeType' AND e.enumlabel = 'UPDATE_CONTACT'
  ) THEN
    ALTER TYPE "NodeType" ADD VALUE 'UPDATE_CONTACT';
  END IF;
END
$$;

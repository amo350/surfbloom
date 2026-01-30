-- Create a unique partial index so at most one user can have accountRole = 'OWNER'.
-- This prevents concurrent "first user becomes OWNER" logic from promoting multiple users.
CREATE UNIQUE INDEX "user_single_owner_idx" ON "user"(("accountRole")) WHERE "accountRole" = 'OWNER'::"AccountRole";

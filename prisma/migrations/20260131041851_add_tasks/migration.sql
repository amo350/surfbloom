-- CreateTable
CREATE TABLE "task_column" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6B7280',
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "task_column_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "columnId" TEXT NOT NULL,
    "assigneeId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "position" INTEGER NOT NULL DEFAULT 1000,
    "dueDate" TIMESTAMP(3),
    "startDate" TIMESTAMP(3),
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "task_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "task_column_workspaceId_idx" ON "task_column"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "task_column_workspaceId_position_key" ON "task_column"("workspaceId", "position");

-- CreateIndex
CREATE INDEX "task_workspaceId_idx" ON "task"("workspaceId");

-- CreateIndex
CREATE INDEX "task_columnId_idx" ON "task"("columnId");

-- CreateIndex
CREATE INDEX "task_assigneeId_idx" ON "task"("assigneeId");

-- AddForeignKey
ALTER TABLE "task_column" ADD CONSTRAINT "task_column_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_columnId_fkey" FOREIGN KEY ("columnId") REFERENCES "task_column"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

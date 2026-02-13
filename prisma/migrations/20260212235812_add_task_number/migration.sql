/*
  Warnings:

  - A unique constraint covering the columns `[workspaceId,taskNumber]` on the table `task` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `taskNumber` to the `task` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "task" ADD COLUMN     "reviewId" TEXT,
ADD COLUMN     "taskNumber" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "task_reviewId_idx" ON "task"("reviewId");

-- CreateIndex
CREATE UNIQUE INDEX "task_workspaceId_taskNumber_key" ON "task"("workspaceId", "taskNumber");

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "review"("id") ON DELETE SET NULL ON UPDATE CASCADE;

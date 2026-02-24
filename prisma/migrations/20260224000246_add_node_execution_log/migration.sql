-- CreateTable
CREATE TABLE "node_execution_log" (
    "id" TEXT NOT NULL,
    "executionId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "nodeType" TEXT NOT NULL,
    "nodeName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "durationMs" INTEGER,
    "outputSummary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "node_execution_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "node_execution_log_executionId_startedAt_idx" ON "node_execution_log"("executionId", "startedAt");

-- AddForeignKey
ALTER TABLE "node_execution_log" ADD CONSTRAINT "node_execution_log_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "execution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

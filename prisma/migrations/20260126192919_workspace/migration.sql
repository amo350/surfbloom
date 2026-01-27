/*
  Warnings:

  - You are about to drop the `Connection` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Execution` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Node` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Workflow` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Connection" DROP CONSTRAINT "Connection_fromNodeId_fkey";

-- DropForeignKey
ALTER TABLE "Connection" DROP CONSTRAINT "Connection_toNodeId_fkey";

-- DropForeignKey
ALTER TABLE "Connection" DROP CONSTRAINT "Connection_workflowId_fkey";

-- DropForeignKey
ALTER TABLE "Execution" DROP CONSTRAINT "Execution_workflowId_fkey";

-- DropForeignKey
ALTER TABLE "Node" DROP CONSTRAINT "Node_workflowId_fkey";

-- DropForeignKey
ALTER TABLE "Workflow" DROP CONSTRAINT "Workflow_userId_fkey";

-- DropTable
DROP TABLE "Connection";

-- DropTable
DROP TABLE "Execution";

-- DropTable
DROP TABLE "Node";

-- DropTable
DROP TABLE "Workflow";

-- CreateTable
CREATE TABLE "workspace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "workflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "node" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "NodeType" NOT NULL,
    "position" JSONB NOT NULL,
    "data" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "node_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "connection" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "fromNodeId" TEXT NOT NULL,
    "toNodeId" TEXT NOT NULL,
    "fromOutput" TEXT NOT NULL DEFAULT 'main',
    "toInput" TEXT NOT NULL DEFAULT 'main',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "connection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "execution" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "status" "ExecutionStatus" NOT NULL DEFAULT 'RUNNING',
    "error" TEXT,
    "errorStack" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completeAt" TIMESTAMP(3),
    "inngestEventId" TEXT NOT NULL,
    "output" JSONB,

    CONSTRAINT "execution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "workspace_userId_idx" ON "workspace"("userId");

-- CreateIndex
CREATE INDEX "workflow_workspaceId_idx" ON "workflow"("workspaceId");

-- CreateIndex
CREATE INDEX "workflow_createdById_idx" ON "workflow"("createdById");

-- CreateIndex
CREATE INDEX "node_workflowId_idx" ON "node"("workflowId");

-- CreateIndex
CREATE INDEX "connection_workflowId_idx" ON "connection"("workflowId");

-- CreateIndex
CREATE UNIQUE INDEX "connection_fromNodeId_toNodeId_fromOutput_toInput_key" ON "connection"("fromNodeId", "toNodeId", "fromOutput", "toInput");

-- CreateIndex
CREATE UNIQUE INDEX "execution_inngestEventId_key" ON "execution"("inngestEventId");

-- CreateIndex
CREATE INDEX "execution_workflowId_idx" ON "execution"("workflowId");

-- AddForeignKey
ALTER TABLE "workspace" ADD CONSTRAINT "workspace_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow" ADD CONSTRAINT "workflow_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow" ADD CONSTRAINT "workflow_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "node" ADD CONSTRAINT "node_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connection" ADD CONSTRAINT "connection_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connection" ADD CONSTRAINT "connection_fromNodeId_fkey" FOREIGN KEY ("fromNodeId") REFERENCES "node"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connection" ADD CONSTRAINT "connection_toNodeId_fkey" FOREIGN KEY ("toNodeId") REFERENCES "node"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "execution" ADD CONSTRAINT "execution_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

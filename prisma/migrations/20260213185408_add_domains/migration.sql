-- CreateTable
CREATE TABLE "domain" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "workspaceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "domain_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "domain_userId_idx" ON "domain"("userId");

-- CreateIndex
CREATE INDEX "domain_workspaceId_idx" ON "domain"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "domain_userId_name_key" ON "domain"("userId", "name");

-- AddForeignKey
ALTER TABLE "domain" ADD CONSTRAINT "domain_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "domain" ADD CONSTRAINT "domain_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;

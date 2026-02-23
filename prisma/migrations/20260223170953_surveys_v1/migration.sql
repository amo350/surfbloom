-- CreateTable
CREATE TABLE "survey" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "thankYouMessage" TEXT NOT NULL DEFAULT 'Thank you for your feedback!',
    "reviewThreshold" INTEGER NOT NULL DEFAULT 8,
    "taskThreshold" INTEGER NOT NULL DEFAULT 5,
    "reviewUrl" TEXT,
    "taskAssigneeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "survey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "survey_question" (
    "id" TEXT NOT NULL,
    "surveyId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "options" JSONB,

    CONSTRAINT "survey_question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "survey_enrollment" (
    "id" TEXT NOT NULL,
    "surveyId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "campaignId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "score" DOUBLE PRECISION,
    "npsCategory" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "survey_enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "survey_response" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answerText" TEXT,
    "answerNumber" DOUBLE PRECISION,
    "answerChoice" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "survey_response_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "survey_slug_key" ON "survey"("slug");

-- CreateIndex
CREATE INDEX "survey_organizationId_idx" ON "survey"("organizationId");

-- CreateIndex
CREATE INDEX "survey_question_surveyId_order_idx" ON "survey_question"("surveyId", "order");

-- CreateIndex
CREATE INDEX "survey_enrollment_surveyId_idx" ON "survey_enrollment"("surveyId");

-- CreateIndex
CREATE INDEX "survey_enrollment_contactId_idx" ON "survey_enrollment"("contactId");

-- CreateIndex
CREATE INDEX "survey_enrollment_workspaceId_idx" ON "survey_enrollment"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "survey_enrollment_surveyId_contactId_campaignId_key" ON "survey_enrollment"("surveyId", "contactId", "campaignId");

-- CreateIndex
CREATE INDEX "survey_response_enrollmentId_idx" ON "survey_response"("enrollmentId");

-- CreateIndex
CREATE UNIQUE INDEX "survey_response_enrollmentId_questionId_key" ON "survey_response"("enrollmentId", "questionId");

-- AddForeignKey
ALTER TABLE "survey_question" ADD CONSTRAINT "survey_question_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "survey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_enrollment" ADD CONSTRAINT "survey_enrollment_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "survey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_enrollment" ADD CONSTRAINT "survey_enrollment_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "chat_contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_enrollment" ADD CONSTRAINT "survey_enrollment_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_response" ADD CONSTRAINT "survey_response_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "survey_enrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_response" ADD CONSTRAINT "survey_response_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "survey_question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

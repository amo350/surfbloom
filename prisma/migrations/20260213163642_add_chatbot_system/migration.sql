-- CreateEnum
CREATE TYPE "ChatMessageRole" AS ENUM ('USER', 'ASSISTANT');

-- CreateTable
CREATE TABLE "chatbot" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "welcomeMessage" TEXT,
    "icon" TEXT,
    "background" TEXT DEFAULT '#FFFFFF',
    "textColor" TEXT DEFAULT '#000000',
    "helpdesk" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chatbot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "help_desk_item" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "help_desk_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "filter_question" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "filter_question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_contact" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_contact_response" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_contact_response_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_room" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "contactId" TEXT,
    "live" BOOLEAN NOT NULL DEFAULT false,
    "mailed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_message" (
    "id" TEXT NOT NULL,
    "chatRoomId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "role" "ChatMessageRole" NOT NULL,
    "seen" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "chatbot_workspaceId_key" ON "chatbot"("workspaceId");

-- CreateIndex
CREATE INDEX "chatbot_workspaceId_idx" ON "chatbot"("workspaceId");

-- CreateIndex
CREATE INDEX "help_desk_item_workspaceId_idx" ON "help_desk_item"("workspaceId");

-- CreateIndex
CREATE INDEX "filter_question_workspaceId_idx" ON "filter_question"("workspaceId");

-- CreateIndex
CREATE INDEX "chat_contact_workspaceId_idx" ON "chat_contact"("workspaceId");

-- CreateIndex
CREATE INDEX "chat_contact_workspaceId_email_idx" ON "chat_contact"("workspaceId", "email");

-- CreateIndex
CREATE INDEX "chat_contact_response_contactId_idx" ON "chat_contact_response"("contactId");

-- CreateIndex
CREATE INDEX "chat_contact_response_questionId_idx" ON "chat_contact_response"("questionId");

-- CreateIndex
CREATE INDEX "chat_room_workspaceId_idx" ON "chat_room"("workspaceId");

-- CreateIndex
CREATE INDEX "chat_room_contactId_idx" ON "chat_room"("contactId");

-- CreateIndex
CREATE INDEX "chat_room_workspaceId_createdAt_idx" ON "chat_room"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "chat_message_chatRoomId_idx" ON "chat_message"("chatRoomId");

-- CreateIndex
CREATE INDEX "chat_message_chatRoomId_createdAt_idx" ON "chat_message"("chatRoomId", "createdAt");

-- AddForeignKey
ALTER TABLE "chatbot" ADD CONSTRAINT "chatbot_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "help_desk_item" ADD CONSTRAINT "help_desk_item_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "filter_question" ADD CONSTRAINT "filter_question_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_contact" ADD CONSTRAINT "chat_contact_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_contact_response" ADD CONSTRAINT "chat_contact_response_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "chat_contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_contact_response" ADD CONSTRAINT "chat_contact_response_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "filter_question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_room" ADD CONSTRAINT "chat_room_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_room" ADD CONSTRAINT "chat_room_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "chat_contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_message" ADD CONSTRAINT "chat_message_chatRoomId_fkey" FOREIGN KEY ("chatRoomId") REFERENCES "chat_room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

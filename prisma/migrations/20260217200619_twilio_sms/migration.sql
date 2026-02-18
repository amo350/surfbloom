-- CreateEnum
CREATE TYPE "SmsStatus" AS ENUM ('QUEUED', 'SENT', 'DELIVERED', 'UNDELIVERED', 'FAILED');

-- AlterTable
ALTER TABLE "chat_room" ADD COLUMN     "channel" TEXT NOT NULL DEFAULT 'webchat';

-- CreateTable
CREATE TABLE "twilio_config" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountSid" TEXT NOT NULL,
    "authToken" TEXT NOT NULL,
    "isValid" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "twilio_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "twilio_phone_number" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "phoneSid" TEXT,
    "friendlyName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "twilio_phone_number_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sms_message" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "chatRoomId" TEXT,
    "direction" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "mediaUrl" TEXT,
    "twilioSid" TEXT,
    "status" "SmsStatus" NOT NULL DEFAULT 'QUEUED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sms_message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "twilio_config_userId_key" ON "twilio_config"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "twilio_phone_number_workspaceId_key" ON "twilio_phone_number"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "sms_message_twilioSid_key" ON "sms_message"("twilioSid");

-- CreateIndex
CREATE INDEX "sms_message_workspaceId_idx" ON "sms_message"("workspaceId");

-- CreateIndex
CREATE INDEX "sms_message_chatRoomId_idx" ON "sms_message"("chatRoomId");

-- CreateIndex
CREATE INDEX "sms_message_twilioSid_idx" ON "sms_message"("twilioSid");

-- CreateIndex
CREATE INDEX "sms_message_workspaceId_createdAt_idx" ON "sms_message"("workspaceId", "createdAt");

-- AddForeignKey
ALTER TABLE "twilio_config" ADD CONSTRAINT "twilio_config_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "twilio_phone_number" ADD CONSTRAINT "twilio_phone_number_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sms_message" ADD CONSTRAINT "sms_message_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sms_message" ADD CONSTRAINT "sms_message_chatRoomId_fkey" FOREIGN KEY ("chatRoomId") REFERENCES "chat_room"("id") ON DELETE SET NULL ON UPDATE CASCADE;

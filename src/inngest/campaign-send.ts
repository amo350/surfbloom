import { NonRetriableError } from "inngest";
import { updateCampaignStats } from "@/features/campaigns/server/update-campaign-stats";
import { prisma } from "@/lib/prisma";
import { inngest } from "./client";

const BATCH_SIZE = 50;
const THROTTLE_MS = 1100; // just over 1/sec for Twilio

function resolveTemplate(
  template: string,
  contact: {
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    email: string | null;
  },
  workspace: { name: string; twilioPhone: string },
): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    switch (key) {
      case "first_name":
        return contact.firstName || "";
      case "last_name":
        return contact.lastName || "";
      case "full_name":
        return [contact.firstName, contact.lastName].filter(Boolean).join(" ");
      case "phone":
        return contact.phone || "";
      case "email":
        return contact.email || "";
      case "location_name":
        return workspace.name;
      case "location_phone":
        return workspace.twilioPhone;
      default:
        return "";
    }
  });
}

export const sendCampaign = inngest.createFunction(
  {
    id: "send-campaign",
    retries: 2,
    onFailure: async ({ event }: { event: any }) => {
      const campaignId = event.data.event.data?.campaignId;
      if (campaignId) {
        await prisma.campaign.update({
          where: { id: campaignId },
          data: { status: "failed" },
        });
      }
    },
  },
  { event: "campaigns/send.campaign" },
  async ({ event, step }) => {
    const { campaignId } = event.data;

    if (!campaignId) {
      throw new NonRetriableError("campaignId is required");
    }

    // ─── Step 1: Load campaign + workspace ──────────────
    const campaign = await step.run("load-campaign", async () => {
      const c = await prisma.campaign.findUnique({
        where: { id: campaignId },
        select: {
          id: true,
          workspaceId: true,
          status: true,
          messageTemplate: true,
          audienceType: true,
          audienceStage: true,
          audienceCategoryId: true,
          audienceInactiveDays: true,
          frequencyCapDays: true,
          workspace: {
            select: {
              id: true,
              name: true,
              userId: true,
              twilioPhoneNumber: {
                select: { phoneNumber: true },
              },
            },
          },
        },
      });

      if (!c) throw new NonRetriableError("Campaign not found");
      if (!["sending"].includes(c.status)) {
        throw new NonRetriableError(
          `Campaign status is ${c.status}, not sending`,
        );
      }
      if (!c.workspace?.twilioPhoneNumber?.phoneNumber) {
        throw new NonRetriableError(
          "No Twilio number configured for this workspace",
        );
      }

      return {
        id: c.id,
        workspaceId: c.workspaceId,
        status: c.status,
        messageTemplate: c.messageTemplate,
        audienceType: c.audienceType,
        audienceStage: c.audienceStage,
        audienceCategoryId: c.audienceCategoryId,
        audienceInactiveDays: c.audienceInactiveDays,
        frequencyCapDays: c.frequencyCapDays,
        workspaceName: c.workspace.name,
        twilioPhone: c.workspace.twilioPhoneNumber.phoneNumber,
        workspaceUserId: c.workspace.userId,
      };
    });

    // ─── Step 2: Build audience + create recipients ─────
    const recipientCount = await step.run("create-recipients", async () => {
      // Build audience where clause
      const where: any = {
        workspaceId: campaign.workspaceId,
        isContact: true,
        optedOut: false,
        phone: { not: null },
      };

      switch (campaign.audienceType) {
        case "stage":
          if (campaign.audienceStage) where.stage = campaign.audienceStage;
          break;
        case "category":
          if (campaign.audienceCategoryId) {
            where.categories = {
              some: { categoryId: campaign.audienceCategoryId },
            };
          }
          break;
        case "inactive":
          if (campaign.audienceInactiveDays) {
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - campaign.audienceInactiveDays);
            where.OR = [
              { lastContactedAt: { lt: cutoff } },
              { lastContactedAt: null },
            ];
          }
          break;
      }

      // Frequency cap
      if (campaign.frequencyCapDays) {
        const capCutoff = new Date();
        capCutoff.setDate(capCutoff.getDate() - campaign.frequencyCapDays);

        const recentlyMessaged = await prisma.campaignRecipient.findMany({
          where: {
            sentAt: { gte: capCutoff },
            status: { in: ["sent", "delivered", "replied"] },
            contact: { workspaceId: campaign.workspaceId },
          },
          select: { contactId: true },
          distinct: ["contactId"],
        });

        const excludeIds = recentlyMessaged.map((r) => r.contactId);
        if (excludeIds.length > 0) {
          where.id = { ...(where.id || {}), notIn: excludeIds };
        }
      }

      // Also exclude contacts already in this campaign (resume case)
      const existingRecipientIds = await prisma.campaignRecipient.findMany({
        where: { campaignId: campaign.id },
        select: { contactId: true },
      });
      const existingIds = existingRecipientIds.map((r) => r.contactId);
      if (existingIds.length > 0) {
        const currentNotIn = where.id?.notIn || [];
        where.id = { notIn: [...currentNotIn, ...existingIds] };
      }

      const contacts = await prisma.chatContact.findMany({
        where,
        select: { id: true },
      });

      if (contacts.length === 0) {
        await prisma.campaign.update({
          where: { id: campaign.id },
          data: {
            status: "completed",
            completedAt: new Date(),
          },
        });
        return 0;
      }

      // Batch create recipients
      await prisma.campaignRecipient.createMany({
        data: contacts.map((c) => ({
          campaignId: campaign.id,
          contactId: c.id,
          status: "pending",
        })),
        skipDuplicates: true,
      });

      // Update total
      const totalRecipients = await prisma.campaignRecipient.count({
        where: { campaignId: campaign.id },
      });

      await prisma.campaign.update({
        where: { id: campaign.id },
        data: { totalRecipients },
      });

      return totalRecipients;
    });

    if (recipientCount === 0) {
      return { campaignId, status: "completed", sent: 0 };
    }

    // ─── Step 3: Send in batches ────────────────────────
    let totalSent = 0;
    let batchIndex = 0;

    while (true) {
      const batchResult = await step.run(
        `send-batch-${batchIndex}`,
        async () => {
          // Check if campaign was paused/cancelled
          const current = await prisma.campaign.findUnique({
            where: { id: campaign.id },
            select: { status: true },
          });

          if (!current || current.status !== "sending") {
            return {
              sent: 0,
              done: true,
              reason: current?.status || "not found",
            };
          }

          // Get next batch of pending recipients
          const recipients = await prisma.campaignRecipient.findMany({
            where: {
              campaignId: campaign.id,
              status: "pending",
            },
            take: BATCH_SIZE,
            include: {
              contact: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  phone: true,
                  email: true,
                },
              },
            },
          });

          if (recipients.length === 0) {
            return { sent: 0, done: true, reason: "complete" };
          }

          const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
          const isLocal = /localhost|127\.0\.0\.1/i.test(appUrl);
          const statusCallbackUrl = isLocal
            ? undefined
            : `${appUrl}/api/twilio/status`;

          const { sendSms } = await import("@/lib/twilio");
          let batchSent = 0;

          for (const recipient of recipients) {
            if (!recipient.contact?.phone) {
              await prisma.campaignRecipient.update({
                where: { id: recipient.id },
                data: {
                  status: "failed",
                  failedAt: new Date(),
                  errorMessage: "No phone number",
                },
              });
              continue;
            }

            try {
              const message = resolveTemplate(
                campaign.messageTemplate,
                recipient.contact,
                {
                  name: campaign.workspaceName,
                  twilioPhone: campaign.twilioPhone,
                },
              );

              const result = await sendSms({
                userId: campaign.workspaceUserId,
                from: campaign.twilioPhone,
                to: recipient.contact.phone,
                body: message,
                statusCallback: statusCallbackUrl,
              });

              // Create SmsMessage for inbox tracking
              const smsMessage = await prisma.smsMessage.create({
                data: {
                  workspaceId: campaign.workspaceId,
                  direction: "outbound",
                  from: campaign.twilioPhone,
                  to: recipient.contact.phone,
                  body: message,
                  twilioSid: result.sid,
                  status: "SENT",
                  // Link to existing SMS chat room if one exists
                  chatRoomId: await findOrCreateSmsRoom(
                    campaign.workspaceId,
                    recipient.contact.id,
                  ),
                },
              });

              await prisma.campaignRecipient.update({
                where: { id: recipient.id },
                data: {
                  status: "sent",
                  sentAt: new Date(),
                  smsMessageId: smsMessage.id,
                },
              });

              batchSent++;

              // Throttle between messages
              await new Promise((resolve) => setTimeout(resolve, THROTTLE_MS));
            } catch (err: any) {
              await prisma.campaignRecipient.update({
                where: { id: recipient.id },
                data: {
                  status: "failed",
                  failedAt: new Date(),
                  errorMessage: err?.message?.slice(0, 200) || "Send failed",
                },
              });
            }
          }

          await updateCampaignStats(campaign.id);

          return { sent: batchSent, done: false, reason: null };
        },
      );

      totalSent += batchResult.sent;

      if (batchResult.done) {
        break;
      }

      batchIndex++;

      // Safety: cap at 200 batches (10,000 messages)
      if (batchIndex >= 200) {
        break;
      }
    }

    // ─── Step 4: Finalize ───────────────────────────────
    await step.run("finalize", async () => {
      const current = await prisma.campaign.findUnique({
        where: { id: campaign.id },
        select: { status: true },
      });

      // Only mark completed if still sending (not paused/cancelled)
      if (current?.status === "sending") {
        await updateCampaignStats(campaign.id);
        await prisma.campaign.update({
          where: { id: campaign.id },
          data: { status: "completed", completedAt: new Date() },
        });
      }
    });

    return { campaignId, status: "completed", totalSent };
  },
);

// ─── Helper: find or create SMS room for inbox threading ──
async function findOrCreateSmsRoom(
  workspaceId: string,
  contactId: string,
): Promise<string | undefined> {
  // Find existing SMS room for this contact
  const existing = await prisma.chatRoom.findFirst({
    where: {
      workspaceId,
      contactId,
      channel: "sms",
    },
    select: { id: true },
  });

  if (existing) {
    // Touch updatedAt so it bubbles up in conversations
    await prisma.chatRoom.update({
      where: { id: existing.id },
      data: { updatedAt: new Date() },
    });
    return existing.id;
  }

  // Create new SMS room
  const room = await prisma.chatRoom.create({
    data: {
      workspaceId,
      contactId,
      channel: "sms",
    },
  });

  return room.id;
}

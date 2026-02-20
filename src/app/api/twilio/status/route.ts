import { NextRequest, NextResponse } from "next/server";
import type { SmsStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

const STATUS_MAP: Record<string, SmsStatus> = {
  queued: "QUEUED",
  sent: "SENT",
  delivered: "DELIVERED",
  undelivered: "UNDELIVERED",
  failed: "FAILED",
};

// Campaign recipient status mapping
const RECIPIENT_STATUS_MAP: Record<string, string> = {
  delivered: "delivered",
  undelivered: "failed",
  failed: "failed",
};

const RECIPIENT_PRIORITY: Record<string, number> = {
  pending: 0,
  sent: 1,
  delivered: 2,
  failed: 2,
  replied: 3,
  opted_out: 3,
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const messageSid = formData.get("MessageSid") as string;
    const status = formData.get("MessageStatus") as string;
    const errorCode = formData.get("ErrorCode") as string | null;
    const errorMessage = formData.get("ErrorMessage") as string | null;

    if (!messageSid || !status) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const mappedStatus = STATUS_MAP[status];

    // ─── Update SmsMessage (existing logic) ─────────────
    if (mappedStatus) {
      await prisma.smsMessage.updateMany({
        where: { twilioSid: messageSid },
        data: { status: mappedStatus },
      });
    }

    // ─── Update CampaignRecipient (new) ─────────────────
    const recipientStatus = RECIPIENT_STATUS_MAP[status];
    if (recipientStatus) {
      // Find the SmsMessage to get its ID
      const smsMessage = await prisma.smsMessage.findFirst({
        where: { twilioSid: messageSid },
        select: { id: true },
      });

      if (smsMessage) {
        const recipient = await prisma.campaignRecipient.findFirst({
          where: { smsMessageId: smsMessage.id },
          select: { id: true, status: true, campaignId: true },
        });

        if (recipient) {
          const currentP = RECIPIENT_PRIORITY[recipient.status] ?? 0;
          const newP = RECIPIENT_PRIORITY[recipientStatus] ?? 0;

          if (newP > currentP) {
            const updateData: any = { status: recipientStatus };

            if (recipientStatus === "delivered") {
              updateData.deliveredAt = new Date();
            } else if (recipientStatus === "failed") {
              updateData.failedAt = new Date();
              updateData.errorMessage = errorMessage
                ? `${errorCode || ""}: ${errorMessage}`.trim()
                : errorCode || "Delivery failed";
            }

            await prisma.campaignRecipient.update({
              where: { id: recipient.id },
              data: updateData,
            });

            if (recipientStatus === "delivered") {
              try {
                const recipientDetail =
                  await prisma.campaignRecipient.findUnique({
                    where: { id: recipient.id },
                    select: {
                      campaign: {
                        select: { name: true, workspaceId: true },
                      },
                      contactId: true,
                    },
                  });

                if (recipientDetail) {
                  await prisma.activity.create({
                    data: {
                      contactId: recipientDetail.contactId,
                      workspaceId: recipientDetail.campaign.workspaceId,
                      type: "campaign_delivered",
                      description: `Campaign "${recipientDetail.campaign.name}" delivered`,
                    },
                  });
                }
              } catch {
                // best-effort
              }
            }

            if (recipientStatus === "failed") {
              try {
                const recipientDetail =
                  await prisma.campaignRecipient.findUnique({
                    where: { id: recipient.id },
                    select: {
                      campaign: {
                        select: { name: true, workspaceId: true },
                      },
                      contactId: true,
                    },
                  });

                if (recipientDetail) {
                  await prisma.activity.create({
                    data: {
                      contactId: recipientDetail.contactId,
                      workspaceId: recipientDetail.campaign.workspaceId,
                      type: "campaign_failed",
                      description: `Campaign "${recipientDetail.campaign.name}" delivery failed`,
                    },
                  });
                }
              } catch {
                // best-effort
              }
            }

            // Update campaign aggregate stats
            await updateCampaignStats(recipient.campaignId);
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Twilio status webhook error:", error);
    // Return 200 to prevent Twilio retries on our errors
    return NextResponse.json({ success: true });
  }
}

async function updateCampaignStats(campaignId: string) {
  const stats = await prisma.campaignRecipient.groupBy({
    by: ["status"],
    where: { campaignId },
    _count: true,
  });

  const statMap: Record<string, number> = {};
  for (const s of stats) {
    statMap[s.status] = s._count;
  }

  await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      sentCount:
        (statMap["sent"] || 0) +
        (statMap["delivered"] || 0) +
        (statMap["replied"] || 0),
      deliveredCount: statMap["delivered"] || 0,
      failedCount: statMap["failed"] || 0,
      repliedCount: statMap["replied"] || 0,
    },
  });
}

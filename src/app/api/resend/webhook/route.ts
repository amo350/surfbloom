import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import {
  fireContactOptedOut,
  fireEmailBounced,
  fireEmailOpened,
} from "@/features/webhooks/server/webhook-events";
import { prisma } from "@/lib/prisma";

// Resend webhook event types we care about
type ResendEventType =
  | "email.sent"
  | "email.delivered"
  | "email.delivery_delayed"
  | "email.bounced"
  | "email.complained"
  | "email.opened"
  | "email.clicked";

interface ResendWebhookPayload {
  type: ResendEventType;
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    tags?: { name: string; value: string }[];
    click?: { link: string };
  };
}

const WEBHOOK_EVENT_TTL_MS = 5 * 60 * 1000;
const processedWebhookEvents = new Map<string, number>();

function isDuplicateWebhookEvent(key: string): boolean {
  const now = Date.now();

  for (const [eventKey, ts] of processedWebhookEvents.entries()) {
    if (now - ts > WEBHOOK_EVENT_TTL_MS) {
      processedWebhookEvents.delete(eventKey);
    }
  }

  if (processedWebhookEvents.has(key)) {
    return true;
  }

  processedWebhookEvents.set(key, now);
  return false;
}

function extractTag(
  tags: { name: string; value: string }[] | undefined,
  name: string,
): string | null {
  return tags?.find((t) => t.name === name)?.value || null;
}

export async function POST(req: NextRequest) {
  try {
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return NextResponse.json(
        { error: "RESEND_WEBHOOK_SECRET not configured" },
        { status: 500 },
      );
    }

    const rawBody = await req.text();
    const svixId = req.headers.get("svix-id");
    const svixTimestamp = req.headers.get("svix-timestamp");
    const svixSignature = req.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      return NextResponse.json(
        { error: "Missing signature headers" },
        { status: 401 },
      );
    }

    let payload: ResendWebhookPayload;
    try {
      const webhook = new Webhook(webhookSecret);
      payload = webhook.verify(rawBody, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as ResendWebhookPayload;
    } catch {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 },
      );
    }

    if (!payload.type || !payload.data?.email_id) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const dedupeKey = `${payload.type}:${payload.data.email_id}:${payload.created_at}`;
    if (isDuplicateWebhookEvent(dedupeKey)) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    const providerId = payload.data.email_id;
    const emailSendId = extractTag(payload.data.tags, "emailSendId");
    const campaignId = extractTag(payload.data.tags, "campaignId");
    const enrollmentId = extractTag(payload.data.tags, "enrollmentId");
    const stepId = extractTag(payload.data.tags, "stepId");

    // Find the EmailSend record
    let emailSend = emailSendId
      ? await prisma.emailSend.findUnique({
          where: { id: emailSendId },
          select: {
            id: true,
            status: true,
            campaignId: true,
            recipientId: true,
            contactId: true,
            workspaceId: true,
          },
        })
      : null;

    // Fallback: find by provider ID
    if (!emailSend) {
      emailSend = await prisma.emailSend.findFirst({
        where: { providerId },
        select: {
          id: true,
          status: true,
          campaignId: true,
          recipientId: true,
          contactId: true,
          workspaceId: true,
        },
      });
    }

    if (!emailSend) {
      // Unknown email — ignore gracefully
      return NextResponse.json({ received: true });
    }

    const now = new Date(payload.created_at || Date.now());

    switch (payload.type) {
      case "email.delivered": {
        await prisma.emailSend.update({
          where: { id: emailSend.id },
          data: {
            status: "delivered",
            deliveredAt: now,
          },
        });

        // Update campaign recipient
        if (emailSend.recipientId) {
          await prisma.campaignRecipient.update({
            where: { id: emailSend.recipientId },
            data: { status: "delivered", deliveredAt: now },
          });
        }

        // Update campaign stats
        if (emailSend.campaignId) {
          await prisma.campaign.update({
            where: { id: emailSend.campaignId },
            data: { deliveredCount: { increment: 1 } },
          });
        }

        if (enrollmentId && stepId) {
          await prisma.campaignSequenceStepLog
            .updateMany({
              where: {
                enrollmentId,
                stepId,
                status: "sent",
              },
              data: {
                status: "delivered",
                deliveredAt: now,
              },
            })
            .catch(() => {});
        }
        break;
      }

      case "email.opened": {
        await prisma.emailSend.update({
          where: { id: emailSend.id },
          data: {
            status: emailSend.status === "clicked" ? "clicked" : "opened",
            openCount: { increment: 1 },
            openedAt: emailSend.status === "opened" ? undefined : now,
          },
        });

        if (emailSend.contactId) {
          const openCampaign = emailSend.campaignId
            ? await prisma.campaign.findUnique({
                where: { id: emailSend.campaignId },
                select: { id: true, name: true },
              })
            : null;

          fireEmailOpened(emailSend.workspaceId, openCampaign, {
            id: emailSend.contactId,
            email: payload.data.to[0] || "",
          }).catch((err) => console.error("Webhook dispatch error:", err));
        }
        break;
      }

      case "email.clicked": {
        await prisma.emailSend.update({
          where: { id: emailSend.id },
          data: {
            status: "clicked",
            clickCount: { increment: 1 },
          },
        });
        break;
      }

      case "email.bounced": {
        await prisma.emailSend.update({
          where: { id: emailSend.id },
          data: {
            status: "bounced",
            bouncedAt: now,
          },
        });

        if (emailSend.recipientId) {
          await prisma.campaignRecipient.update({
            where: { id: emailSend.recipientId },
            data: {
              status: "failed",
              failedAt: now,
              errorMessage: "Email bounced",
            },
          });
        }

        if (emailSend.campaignId) {
          await prisma.campaign.update({
            where: { id: emailSend.campaignId },
            data: { failedCount: { increment: 1 } },
          });
        }

        if (enrollmentId && stepId) {
          await prisma.campaignSequenceStepLog
            .updateMany({
              where: {
                enrollmentId,
                stepId,
                status: "sent",
              },
              data: {
                status: "failed",
                failedAt: now,
                errorMessage: "Email bounced",
              },
            })
            .catch(() => {});
        }

        if (emailSend.contactId) {
          const bounceCampaign = emailSend.campaignId
            ? await prisma.campaign.findUnique({
                where: { id: emailSend.campaignId },
                select: { id: true, name: true },
              })
            : null;

          fireEmailBounced(emailSend.workspaceId, bounceCampaign, {
            id: emailSend.contactId,
            email: payload.data.to[0] || "",
          }).catch((err) => console.error("Webhook dispatch error:", err));
        }
        break;
      }

      case "email.complained": {
        await prisma.emailSend.update({
          where: { id: emailSend.id },
          data: { status: "complained" },
        });

        // Auto opt-out on spam complaint
        if (emailSend.contactId) {
          await prisma.chatContact.update({
            where: { id: emailSend.contactId },
            data: { optedOut: true },
          });

          await prisma.activity.create({
            data: {
              contactId: emailSend.contactId,
              workspaceId: emailSend.workspaceId,
              type: "contact_updated",
              description: "Opted out — marked email as spam",
            },
          });

          fireContactOptedOut(
            emailSend.workspaceId,
            { id: emailSend.contactId, email: payload.data.to[0] || null },
            "spam_complaint",
          ).catch((err) => console.error("Webhook dispatch error:", err));
        }

        if (enrollmentId) {
          await prisma.campaignSequenceEnrollment
            .updateMany({
              where: {
                id: enrollmentId,
                status: "active",
              },
              data: {
                status: "opted_out",
                stoppedAt: now,
                stoppedReason: "spam_complaint",
                nextStepAt: null,
              },
            })
            .catch(() => {});
        }
        break;
      }

      case "email.delivery_delayed": {
        // No status change — just log
        console.warn(`Email delivery delayed: ${emailSend.id} (${providerId})`);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Resend webhook error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

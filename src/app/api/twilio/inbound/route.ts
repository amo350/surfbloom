// src/app/api/twilio/inbound/route.ts
import { NextRequest, NextResponse } from "next/server";
import { handleCampaignAutoReply } from "@/features/campaigns/server/handle-auto-reply";
import { handleKeywordMatch } from "@/features/campaigns/server/handle-keyword";
import { updateCampaignStats } from "@/features/campaigns/server/update-campaign-stats";
import { logActivity } from "@/features/contacts/server/log-activity";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const from = formData.get("From") as string;
    const to = formData.get("To") as string;
    const body = formData.get("Body") as string;
    const messageSid = formData.get("MessageSid") as string;
    const numMedia = parseInt((formData.get("NumMedia") as string) || "0");

    // Get media URL if present
    let mediaUrl: string | null = null;
    if (numMedia > 0) {
      mediaUrl = formData.get("MediaUrl0") as string;
    }

    if (!from || !to || !messageSid) {
      return new NextResponse(
        "<Response><Message>Missing fields</Message></Response>",
        { headers: { "Content-Type": "text/xml" } },
      );
    }

    // Find the phone number record to determine workspace
    const phoneRecord = await prisma.twilioPhoneNumber.findFirst({
      where: { phoneNumber: to },
      select: {
        workspaceId: true,
        workspace: {
          select: {
            id: true,
            name: true,
            domains: {
              select: { id: true },
              take: 1,
            },
            members: {
              select: { userId: true },
              take: 1,
            },
          },
        },
      },
    });

    if (!phoneRecord) {
      console.error("[Inbound SMS] No workspace found for number:", to);
      return new NextResponse("<Response></Response>", {
        headers: { "Content-Type": "text/xml" },
      });
    }

    const workspaceId = phoneRecord.workspaceId;
    const workspaceDomainId = phoneRecord.workspace.domains[0]?.id ?? null;
    const workspace = phoneRecord.workspace;

    // ─── Text-to-join keyword check ─────────────────────
    // Must run before normal message processing — single-word keywords
    // shouldn't create chat rooms or trigger campaign reply logic
    const workspaceUserId = workspace.members?.[0]?.userId || "system";

    const wasKeyword = await handleKeywordMatch(
      workspace.id,
      from,
      body || "",
      workspaceUserId,
    );

    if (wasKeyword) {
      return NextResponse.json({ handled: true });
    }

    // ─── Normal message processing continues below ──────

    const roomId = await prisma.$transaction(async (tx) => {
      const contact = await tx.chatContact.upsert({
        where: {
          workspaceId_phone: { workspaceId, phone: from },
        } as any,
        update: {},
        create: {
          domainId: workspaceDomainId ?? undefined,
          workspaceId,
          phone: from,
        },
        select: { id: true, domainId: true },
      });

      let room = await tx.chatRoom.findFirst({
        where: {
          workspaceId,
          contactId: contact.id,
          channel: "sms",
        },
        select: { id: true },
      });

      if (!room) {
        room = await tx.chatRoom.create({
          data: {
            workspaceId,
            contactId: contact.id,
            domainId: contact.domainId ?? workspaceDomainId ?? undefined,
            channel: "sms",
          },
          select: { id: true },
        });
      }

      await tx.smsMessage.upsert({
        where: { twilioSid: messageSid },
        update: {
          workspaceId,
          chatRoomId: room.id,
          direction: "inbound",
          from,
          to,
          body: body || "",
          mediaUrl,
          status: "DELIVERED",
        },
        create: {
          workspaceId,
          chatRoomId: room.id,
          direction: "inbound",
          from,
          to,
          body: body || "",
          mediaUrl,
          twilioSid: messageSid,
          status: "DELIVERED",
        },
      });

      await tx.chatRoom.update({
        where: { id: room.id },
        data: { updatedAt: new Date() },
      });

      return { roomId: room.id, contactId: contact.id };
    });

    const { roomId: savedRoomId, contactId } = roomId;

    // ─── Opt-out / opt-in keyword detection ─────────────
    const OPT_OUT_KEYWORDS = ["stop", "unsubscribe", "cancel", "quit", "end"];
    const OPT_IN_KEYWORDS = ["start", "unstop", "subscribe", "yes"];
    const normalizedBody = (body || "").trim().toLowerCase();

    if (contactId) {
      if (OPT_OUT_KEYWORDS.includes(normalizedBody)) {
        await prisma.chatContact.update({
          where: { id: contactId },
          data: { optedOut: true },
        });

        await prisma.campaignRecipient.updateMany({
          where: {
            contactId,
            status: "pending",
          },
          data: {
            status: "opted_out",
            failedAt: new Date(),
            errorMessage: "Contact opted out",
          },
        });

        try {
          await logActivity({
            contactId,
            workspaceId,
            type: "contact_updated",
            description: "Opted out of messages (STOP)",
          });
        } catch {
          // best-effort
        }
      } else if (OPT_IN_KEYWORDS.includes(normalizedBody)) {
        await prisma.chatContact.update({
          where: { id: contactId },
          data: { optedOut: false },
        });

        try {
          await logActivity({
            contactId,
            workspaceId,
            type: "contact_updated",
            description: "Opted back in to messages (START)",
          });
        } catch {
          // best-effort
        }
      }
    }

    // ─── Campaign reply detection ───────────────────────
    try {
      if (contactId) {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const campaignRecipient = await prisma.campaignRecipient.findFirst({
          where: {
            contactId,
            status: { in: ["sent", "delivered"] },
            sentAt: { gte: sevenDaysAgo },
          },
          orderBy: { sentAt: "desc" },
          select: {
            id: true,
            campaignId: true,
            contactId: true,
            contact: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        });

        if (campaignRecipient) {
          await prisma.campaignRecipient.update({
            where: { id: campaignRecipient.id },
            data: {
              status: "replied",
              repliedAt: new Date(),
            },
          });

          // Log reply on contact timeline
          try {
            const campaignDetail = await prisma.campaign.findUnique({
              where: { id: campaignRecipient.campaignId },
              select: { name: true, workspaceId: true },
            });

            if (campaignDetail) {
              await prisma.activity.create({
                data: {
                  contactId,
                  workspaceId: campaignDetail.workspaceId,
                  type: "campaign_replied",
                  description: `Replied to campaign "${campaignDetail.name}"`,
                },
              });
            }
          } catch {
            // best-effort
          }

          await updateCampaignStats(campaignRecipient.campaignId);

          // ─── AI Auto-Reply ──────────────────────────────────
          const contactName = [
            campaignRecipient.contact.firstName,
            campaignRecipient.contact.lastName,
          ]
            .filter(Boolean)
            .join(" ");

          const aiHandled = await handleCampaignAutoReply(
            campaignRecipient.campaignId,
            campaignRecipient.id,
            campaignRecipient.contactId,
            from,
            contactName,
            body || "",
            workspaceUserId,
            workspace.name,
          );

          // If AI handled it and max not reached, skip creating a chat room
          // notification — the AI is managing this conversation
          if (aiHandled) {
            return NextResponse.json({ handled: true, aiReplied: true });
          }

          // If AI didn't handle (disabled, max reached, error),
          // fall through to normal chat room processing
        }
      }
    } catch {
      // Best-effort — don't break inbound SMS processing
    }

    // Log activity
    if (contactId && workspaceId) {
      await logActivity({
        contactId,
        workspaceId,
        type: "sms_received",
        description: `SMS received: "${(body || "").slice(0, 60)}${(body || "").length > 60 ? "..." : ""}"`,
        metadata: { from, direction: "inbound" },
      });
    }

    console.log("[Inbound SMS] Stored message in room:", savedRoomId);

    // Return empty TwiML — no auto-reply for now
    // TODO: Could auto-reply with AI or canned response
    return new NextResponse("<Response></Response>", {
      headers: { "Content-Type": "text/xml" },
    });
  } catch (error) {
    console.error("[Inbound SMS] Error:", error);
    return new NextResponse("<Response></Response>", {
      headers: { "Content-Type": "text/xml" },
    });
  }
}

// src/app/api/twilio/inbound/route.ts
import { NextRequest, NextResponse } from "next/server";
import { handleCampaignAutoReply } from "@/features/campaigns/server/handle-auto-reply";
import { handleKeywordMatch } from "@/features/campaigns/server/handle-keyword";
import { updateCampaignStats } from "@/features/campaigns/server/update-campaign-stats";
import { logActivity } from "@/features/contacts/server/log-activity";
import { fireWorkflowTrigger } from "@/features/nodes/lib/trigger-dispatcher";
import { handleSurveyResponse } from "@/features/surveys/server/sms-survey-handler";
import {
  fireContactOptedOut,
  fireContactReplied,
} from "@/features/webhooks/server/webhook-events";
import { prisma } from "@/lib/prisma";
import { sendSms } from "@/lib/twilio";

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
    const workspaceUserId = workspace.members?.[0]?.userId || "system";
    const normalizedBody = (body || "").trim().toUpperCase();
    const OPT_OUT = ["STOP", "UNSUBSCRIBE", "CANCEL", "QUIT", "END"];
    const OPT_IN = ["START", "UNSTOP", "SUBSCRIBE", "YES"];

    // ─── Opt-out / Opt-in detection (MUST run first) ────
    const existingContact = await prisma.chatContact.findFirst({
      where: {
        workspaceId,
        phone: from,
      },
      select: { id: true, firstName: true, phone: true, email: true },
    });

    if (OPT_OUT.includes(normalizedBody)) {
      if (existingContact?.id) {
        await prisma.chatContact.update({
          where: { id: existingContact.id },
          data: { optedOut: true },
        });

        await prisma.campaignRecipient.updateMany({
          where: {
            contactId: existingContact.id,
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
            contactId: existingContact.id,
            workspaceId,
            type: "contact_updated",
            description: "Opted out of messages (STOP)",
          });
        } catch {
          // best-effort
        }

        fireContactOptedOut(
          workspace.id,
          {
            id: existingContact.id,
            firstName: existingContact.firstName,
            phone: existingContact.phone,
            email: existingContact.email,
          },
          "sms_stop",
        ).catch((err) => console.error("Webhook dispatch error:", err));
      }
      return NextResponse.json({ handled: true, optedOut: true });
    }

    if (OPT_IN.includes(normalizedBody)) {
      if (existingContact?.id) {
        await prisma.chatContact.update({
          where: { id: existingContact.id },
          data: { optedOut: false },
        });

        try {
          await logActivity({
            contactId: existingContact.id,
            workspaceId,
            type: "contact_updated",
            description: "Opted back in to messages (START)",
          });
        } catch {
          // best-effort
        }
      }
      return NextResponse.json({ handled: true, optedIn: true });
    }

    // ─── Text-to-join keyword check (after opt-out) ─────

    const wasKeyword = await handleKeywordMatch(
      workspace.id,
      from,
      body || "",
      workspaceUserId,
    );

    if (wasKeyword) {
      return NextResponse.json({ handled: true });
    }

    // ─── Active SMS survey check (after opt-out + keyword) ───
    const surveyContact =
      existingContact ??
      (await prisma.chatContact.upsert({
        where: {
          workspaceId_phone: { workspaceId, phone: from },
        } as any,
        update: {},
        create: {
          domainId: workspaceDomainId ?? undefined,
          workspaceId,
          phone: from,
        },
        select: { id: true },
      }));

    const surveyResult = await handleSurveyResponse(
      workspaceId,
      surveyContact.id,
      body || "",
    );
    if (surveyResult.handled) {
      const surveyRoomId = await findOrCreateSmsRoom(
        workspaceId,
        surveyContact.id,
        workspaceDomainId ?? undefined,
      );

      await prisma.smsMessage
        .upsert({
          where: { twilioSid: messageSid },
          update: {
            workspaceId,
            chatRoomId: surveyRoomId,
            direction: "inbound",
            from,
            to,
            body: body || "",
            mediaUrl,
            status: "DELIVERED",
          },
          create: {
            workspaceId,
            chatRoomId: surveyRoomId,
            direction: "inbound",
            from,
            to,
            body: body || "",
            mediaUrl,
            twilioSid: messageSid,
            status: "DELIVERED",
          },
        })
        .catch((error) => {
          console.error(
            "[Inbound SMS] Failed to upsert inbound survey smsMessage",
            {
              messageSid,
              workspaceId,
              surveyRoomId,
              error,
            },
          );
        });

      if (surveyResult.replyMessage) {
        const surveyReply = await sendSms({
          userId: workspaceUserId,
          to: from,
          from: to,
          body: surveyResult.replyMessage,
        }).catch((err) => {
          console.error("[Inbound SMS] Survey reply send failed:", err);
          return null;
        });

        if (surveyReply?.sid) {
          await prisma.smsMessage
            .create({
              data: {
                workspaceId,
                chatRoomId: surveyRoomId,
                direction: "outbound",
                from: to,
                to: from,
                body: surveyResult.replyMessage,
                twilioSid: surveyReply.sid,
                status: "SENT",
              },
            })
            .catch((error) => {
              console.error(
                "[Inbound SMS] Failed to store outbound survey reply",
                {
                  messageSid: surveyReply.sid,
                  workspaceId,
                  surveyRoomId,
                  error,
                },
              );
            });
        }
      }

      await prisma.chatRoom
        .update({
          where: { id: surveyRoomId },
          data: { updatedAt: new Date() },
        })
        .catch((error) => {
          console.error("[Inbound SMS] Failed to touch survey chat room", {
            workspaceId,
            surveyRoomId,
            error,
          });
        });

      return NextResponse.json({ success: true, handled: true, survey: true });
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

    // ─── Mark sequence logs replied for condition evaluation ───
    if (contactId) {
      const activeEnrollments =
        await prisma.campaignSequenceEnrollment.findMany({
          where: {
            contactId,
            status: "active",
          },
          select: { id: true },
        });

      if (activeEnrollments.length > 0) {
        await (prisma.campaignSequenceStepLog as any)
          .updateMany({
            where: {
              enrollmentId: { in: activeEnrollments.map((e) => e.id) },
              status: { in: ["sent", "delivered"] },
              channel: "sms",
              repliedAt: null,
            },
            data: {
              repliedAt: new Date(),
            },
          })
          .catch((error: unknown) => {
            console.error("[Inbound SMS] Failed to mark step logs replied", {
              workspaceId,
              contactId,
              messageSid,
              error,
            });
          });
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
            campaign: { select: { name: true } },
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

          fireContactReplied(
            workspace.id,
            {
              id: campaignRecipient.campaignId,
              name: campaignRecipient.campaign?.name || "",
            },
            {
              id: campaignRecipient.contactId,
              firstName: campaignRecipient.contact?.firstName,
              phone: from,
            },
            body || "",
          ).catch((err) => console.error("Webhook dispatch error:", err));

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

      fireWorkflowTrigger({
        triggerType: "SMS_RECEIVED",
        payload: {
          workspaceId,
          contactId,
          messageBody: body,
          fromPhone: from,
        },
      }).catch(() => {});
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

async function findOrCreateSmsRoom(
  workspaceId: string,
  contactId: string,
  domainId?: string,
): Promise<string> {
  const room = await prisma.chatRoom.upsert({
    where: {
      workspaceId_contactId_channel: {
        workspaceId,
        contactId,
        channel: "sms",
      },
    },
    update: {
      domainId: domainId ?? undefined,
    },
    create: {
      workspaceId,
      contactId,
      domainId,
      channel: "sms",
    },
    select: { id: true },
  });

  return room.id;
}

// src/app/api/twilio/inbound/route.ts
import { NextRequest, NextResponse } from "next/server";
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
            domains: {
              select: { id: true },
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

      return room.id;
    });

    // Handle STOP/START opt-out (Twilio handles this automatically,
    // but we track it locally too)
    const upperBody = (body || "").trim().toUpperCase();
    if (["STOP", "UNSUBSCRIBE", "CANCEL", "END", "QUIT"].includes(upperBody)) {
      // Mark contact as opted out — we'll add an optedOut field later
      console.log("[Inbound SMS] Opt-out received from:", from);
    }

    if (["START", "YES", "UNSTOP"].includes(upperBody)) {
      console.log("[Inbound SMS] Opt-in received from:", from);
    }

    console.log("[Inbound SMS] Stored message in room:", roomId);

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

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
              select: { id: true, userId: true },
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
    const domain = phoneRecord.workspace.domains[0];

    // Find or create a contact by phone number
    let contact = await prisma.chatContact.findFirst({
      where: {
        domainId: domain?.id,
        email: from, // Using email field to store phone for SMS contacts
      },
      include: {
        chatRooms: {
          where: { channel: "sms" },
          select: { id: true },
          take: 1,
        },
      },
    });

    // Create contact + room if new
    if (!contact && domain) {
      contact = await prisma.$transaction(async (tx) => {
        const c = await tx.chatContact.create({
          data: {
            domainId: domain.id,
            workspaceId,
            email: from, // phone number stored here for now
          },
        });

        await tx.chatRoom.create({
          data: {
            domainId: domain.id,
            workspaceId,
            contactId: c.id,
            channel: "sms",
          },
        });

        // Re-fetch with rooms
        return tx.chatContact.findUnique({
          where: { id: c.id },
          include: {
            chatRooms: {
              where: { channel: "sms" },
              select: { id: true },
              take: 1,
            },
          },
        });
      });
    }

    const roomId = contact?.chatRooms[0]?.id;

    // Store in SMS message log
    await prisma.smsMessage.create({
      data: {
        workspaceId,
        chatRoomId: roomId,
        direction: "inbound",
        from,
        to,
        body: body || "",
        mediaUrl,
        twilioSid: messageSid,
        status: "DELIVERED",
      },
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

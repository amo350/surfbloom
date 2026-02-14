// src/app/api/chatbot/message/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function extractEmailsFromString(text: string): string[] | null {
  const matches = text.match(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
  );
  return matches && matches.length > 0 ? matches : null;
}

export async function POST(req: NextRequest) {
  try {
    const { domainId, message, chatHistory } = await req.json();

    if (!domainId || !message) {
      return NextResponse.json(
        { error: "Missing domainId or message" },
        { status: 400 }
      );
    }

    const domain = await prisma.domain.findUnique({
      where: { id: domainId },
      select: {
        id: true,
        name: true,
        workspaceId: true,
        helpDeskItems: {
          select: { id: true, question: true, answer: true },
        },
        filterQuestions: {
          select: { id: true, question: true },
        },
      },
    });

    if (!domain) {
      return NextResponse.json(
        { error: "Domain not found" },
        { status: 404 }
      );
    }

    // Check for email in message
    const extractedEmail = extractEmailsFromString(message);

    if (extractedEmail) {
      const customerEmail = extractedEmail[0];

      const existingContact = await prisma.chatContact.findFirst({
        where: {
          domainId: domain.id,
          email: { startsWith: customerEmail },
        },
        include: {
          chatRooms: {
            select: { id: true, live: true, mailed: true },
            take: 1,
          },
        },
      });

      // New customer
      if (!existingContact) {
        const contact = await prisma.$transaction(async (tx) => {
          const c = await tx.chatContact.create({
            data: {
              domainId: domain.id,
              workspaceId: domain.workspaceId,
              email: customerEmail,
            },
          });
          await tx.chatRoom.create({
            data: {
              domainId: domain.id,
              workspaceId: domain.workspaceId,
              contactId: c.id,
            },
          });
          return c;
        });

        const username = customerEmail.split("@")[0];
        return NextResponse.json({
          response: {
            role: "assistant",
            content: `Welcome aboard ${username}! I'm glad to connect with you. Is there anything you need help with?`,
          },
        });
      }

      // Existing customer — room is live
      const room = existingContact.chatRooms[0];
      if (room?.live) {
        await prisma.chatMessage.create({
          data: {
            chatRoomId: room.id,
            message,
            role: "USER",
          },
        });
        // TODO: Phase 7 — Inngest Realtime trigger
        return NextResponse.json({ live: true, chatRoom: room.id });
      }

      // Existing customer — room not live, store + respond
      if (room) {
        await prisma.chatMessage.create({
          data: {
            chatRoomId: room.id,
            message,
            role: "USER",
          },
        });
      }
    }

    // No email yet — check helpdesk match
    const lowerMessage = message.toLowerCase();
    const helpdeskMatch = domain.helpDeskItems.find(
      (item) =>
        lowerMessage.includes(item.question.toLowerCase()) ||
        item.question.toLowerCase().includes(lowerMessage)
    );

    if (helpdeskMatch) {
      return NextResponse.json({
        response: {
          role: "assistant",
          content: helpdeskMatch.answer,
        },
      });
    }

    // TODO: Phase 6 — OpenAI integration
    return NextResponse.json({
      response: {
        role: "assistant",
        content:
          "I'd love to help you out! Could you share your email address so I can better assist you?",
      },
    });
  } catch (error) {
    console.error("Chatbot message error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

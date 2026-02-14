import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ─── Helpers ──────────────────────────────────────────────

function extractEmailsFromString(text: string): string[] | null {
  const matches = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
  return matches && matches.length > 0 ? matches : null;
}

function extractURLfromString(text: string): string[] | null {
  const matches = text.match(/https?:\/\/[^\s)]+/g);
  return matches && matches.length > 0 ? matches : null;
}

// Module-level email tracker (per request — stateless across requests,
// but Corinna uses the same pattern within the server action scope)
let customerEmail: string | null = null;

// ─── Store a single message ───────────────────────────────

async function storeMessage(
  chatRoomId: string,
  message: string,
  role: "USER" | "ASSISTANT",
) {
  return prisma.chatMessage.create({
    data: {
      chatRoomId,
      message,
      role,
    },
  });
}

// ─── POST /api/chatbot/message ────────────────────────────
// Body: { domainId, message, chatHistory }
// Mirrors Corinna's onAiChatBotAssistant:
//   1. Load domain + filter questions
//   2. Extract email from message
//   3. If email → find/create customer + room
//   4. If room is live → store + return { live: true, chatRoom }
//   5. If room exists → store + AI response
//   6. No email yet → AI to get email

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { domainId, message, chatHistory = [] } = body;

    if (!domainId || !message) {
      return NextResponse.json(
        { error: "Missing domainId or message" },
        { status: 400 },
      );
    }

    // Reset email tracker per request
    customerEmail = null;

    // ─── 1. Load domain + filter questions ────────────────
    const domain = await prisma.domain.findUnique({
      where: { id: domainId },
      select: {
        id: true,
        name: true,
        workspaceId: true,
        userId: true,
        filterQuestions: {
          select: { id: true, question: true },
          orderBy: { createdAt: "asc" },
        },
        helpDeskItems: {
          select: { id: true, question: true, answer: true },
        },
      },
    });

    if (!domain) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 });
    }

    // ─── 2. Extract email ─────────────────────────────────
    const extractedEmail = extractEmailsFromString(message);
    if (extractedEmail) {
      customerEmail = extractedEmail[0];
    }

    // ─── 3. If we have an email — customer flow ───────────
    if (customerEmail) {
      // Find existing customer by email on this domain
      const existingContact = await prisma.chatContact.findFirst({
        where: {
          domainId: domain.id,
          email: { startsWith: customerEmail },
        },
        include: {
          chatRooms: {
            select: { id: true, live: true, mailed: true },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
          responses: {
            where: { answer: null },
            select: { id: true },
            orderBy: { createdAt: "asc" },
          },
        },
      });

      // ─── 3a. New customer — create contact + room ───────
      if (!existingContact) {
        const newContact = await prisma.$transaction(async (tx) => {
          const contact = await tx.chatContact.create({
            data: {
              domainId: domain.id,
              workspaceId: domain.workspaceId,
              email: customerEmail!,
              responses: {
                create: domain.filterQuestions.map((q) => ({
                  questionId: q.id,
                })),
              },
            },
          });

          await tx.chatRoom.create({
            data: {
              domainId: domain.id,
              workspaceId: domain.workspaceId,
              contactId: contact.id,
            },
          });

          return contact;
        });

        const username = customerEmail!.split("@")[0];
        const response = {
          role: "assistant" as const,
          content: `Welcome aboard ${username}! I'm glad to connect with you. Is there anything you need help with?`,
        };

        return NextResponse.json({ response });
      }

      // ─── 3b. Existing customer — get their room ─────────
      const room = existingContact.chatRooms[0];
      if (!room) {
        // Edge case: contact exists but no room
        const newRoom = await prisma.chatRoom.create({
          data: {
            domainId: domain.id,
            workspaceId: domain.workspaceId,
            contactId: existingContact.id,
          },
        });
        // Continue with this room
        return handleMessageWithRoom(
          newRoom.id,
          domain,
          message,
          chatHistory,
          existingContact,
        );
      }

      // ─── 3c. Room is live — real-time mode ──────────────
      if (room.live) {
        await storeMessage(room.id, message, "USER");

        // TODO: Phase 7 — Inngest Realtime trigger here
        // await triggerRealTime(room.id, message, "user");

        // TODO: Email notification if not mailed
        // if (!room.mailed) { ... }

        return NextResponse.json({
          live: true,
          chatRoom: room.id,
        });
      }

      // ─── 3d. Room exists, not live — store + AI ─────────
      return handleMessageWithRoom(
        room.id,
        domain,
        message,
        chatHistory,
        existingContact,
      );
    }

    // ─── 4. No email yet — try helpdesk or AI to get email ─
    // Try helpdesk match first
    const lowerMessage = message.toLowerCase();
    const helpdeskMatch = domain.helpDeskItems.find(
      (item) =>
        lowerMessage.includes(item.question.toLowerCase()) ||
        item.question.toLowerCase().includes(lowerMessage),
    );

    if (helpdeskMatch) {
      return NextResponse.json({
        response: {
          role: "assistant",
          content: helpdeskMatch.answer,
        },
      });
    }

    // TODO: Phase 6 — OpenAI call to get email
    // For now: friendly nudge to get email
    const response = {
      role: "assistant" as const,
      content:
        "I'd love to help you out! Could you share your email address so I can better assist you and keep track of our conversation?",
    };

    return NextResponse.json({ response });
  } catch (error) {
    console.error("[SurfBloom] Chat message error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// ─── Handle message when room exists ──────────────────────

async function handleMessageWithRoom(
  roomId: string,
  domain: {
    id: string;
    name: string;
    filterQuestions: { id: string; question: string }[];
    helpDeskItems: { id: string; question: string; answer: string }[];
  },
  message: string,
  chatHistory: { role: string; content: string }[],
  contact: {
    id: string;
    responses: { id: string }[];
  },
) {
  // Store user message
  await storeMessage(roomId, message, "USER");

  // Try helpdesk match
  const lowerMessage = message.toLowerCase();
  const helpdeskMatch = domain.helpDeskItems.find(
    (item) =>
      lowerMessage.includes(item.question.toLowerCase()) ||
      item.question.toLowerCase().includes(lowerMessage),
  );

  if (helpdeskMatch) {
    await storeMessage(roomId, helpdeskMatch.answer, "ASSISTANT");
    return NextResponse.json({
      response: {
        role: "assistant",
        content: helpdeskMatch.answer,
      },
    });
  }

  // TODO: Phase 6 — OpenAI with filter questions, (complete)/(realtime) keywords
  // System prompt should include:
  //   - domain.filterQuestions array
  //   - instruction to add (complete) when asking filter questions
  //   - instruction to add (realtime) for human handoff
  //   - chatHistory for context
  //
  // After response:
  //   - If contains (realtime): set room.live = true, strip keyword, store, return response
  //   - If last user message had (complete): find first unanswered response, set answer
  //   - If contains URL: extract and return as link
  //   - Otherwise: store and return response

  // For now: fallback
  const fallbackResponse =
    "Thanks for your message! One of our team members will get back to you shortly.";

  await storeMessage(roomId, fallbackResponse, "ASSISTANT");

  return NextResponse.json({
    response: {
      role: "assistant",
      content: fallbackResponse,
    },
  });
}

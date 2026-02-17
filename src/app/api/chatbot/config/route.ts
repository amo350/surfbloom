// src/app/api/chatbot/config/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const domainId = req.nextUrl.searchParams.get("domainId");
  if (!domainId) {
    return NextResponse.json({ error: "Missing domainId" }, { status: 400 });
  }

  const domain = await prisma.domain.findUnique({
    where: { id: domainId },
    include: {
      chatBot: true,
      helpDeskItems: {
        select: { id: true, question: true, answer: true },
        orderBy: { createdAt: "asc" },
      },
      filterQuestions: {
        select: { id: true, question: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!domain) {
    return NextResponse.json({ error: "Domain not found" }, { status: 404 });
  }

  // Get workspaces through user's memberships for all locations they have access to
  const workspaces = await prisma.workspace.findMany({
    where: {
      members: {
        some: { userId: domain.userId },
      },
    },
    select: {
      id: true,
      name: true,
      imageUrl: true,
      description: true,
      paymentLink: true,
      phone: true,
    },
  });

  return NextResponse.json({
    domainId: domain.id,
    domainName: domain.name,
    chatBot: domain.chatBot,
    helpDeskItems: domain.helpDeskItems,
    filterQuestions: domain.filterQuestions,
    locations: workspaces,
  });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;

  const link = await prisma.campaignLink.findUnique({
    where: { shortCode: code },
    select: { id: true, originalUrl: true, campaignId: true },
  });

  if (!link) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
  const userAgent = req.headers.get("user-agent") || null;

  // Fire and forget — don't block the redirect
  recordClick(link.id, link.campaignId, ip, userAgent).catch((err) => {
    console.error("Link click recording failed:", err);
  });

  return NextResponse.redirect(link.originalUrl);
}

async function recordClick(
  linkId: string,
  campaignId: string,
  ip: string | null,
  userAgent: string | null,
) {
  // Try to match a recipient — look for recent recipients from this campaign
  // who were sent a message. Use IP as a weak signal for now.
  // Best-effort match: most recent sent/delivered recipient without a click yet
  let recipientId: string | null = null;

  if (ip) {
    // Check if this IP already clicked this link — find the recipient from that
    const existingClick = await prisma.campaignLinkClick.findFirst({
      where: { linkId, ip },
      select: { recipientId: true },
      orderBy: { createdAt: "desc" },
    });

    if (existingClick?.recipientId) {
      recipientId = existingClick.recipientId;
    }
  }

  await prisma.campaignLinkClick.create({
    data: {
      linkId,
      recipientId,
      ip,
      userAgent: userAgent?.slice(0, 500),
    },
  });

  await prisma.campaignLink.update({
    where: { id: linkId },
    data: { clickCount: { increment: 1 } },
  });
}

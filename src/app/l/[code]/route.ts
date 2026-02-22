import { NextRequest, NextResponse } from "next/server";
import { fireContactClicked } from "@/features/webhooks/server/webhook-events";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;

  const link = await prisma.campaignLink.findUnique({
    where: { shortCode: code },
    select: { id: true, originalUrl: true },
  });

  if (!link) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
  const userAgent = req.headers.get("user-agent") || null;

  // Record click async — don't block redirect
  recordClick(link.id, ip, userAgent).catch((err) => {
    console.error("Link click recording failed:", err);
  });

  return NextResponse.redirect(link.originalUrl);
}

async function recordClick(
  linkId: string,
  ip: string | null,
  userAgent: string | null,
) {
  await prisma.$transaction([
    prisma.campaignLinkClick.create({
      data: {
        linkId,
        ip,
        userAgent: userAgent?.slice(0, 500),
      },
    }),
    prisma.campaignLink.update({
      where: { id: linkId },
      data: { clickCount: { increment: 1 } },
    }),
  ]);

  const link = await prisma.campaignLink.findUnique({
    where: { id: linkId },
    select: {
      originalUrl: true,
      campaign: {
        select: {
          id: true,
          name: true,
          workspaceId: true,
        },
      },
    },
  });

  if (link?.campaign) {
    fireContactClicked(
      link.campaign.workspaceId,
      { id: link.campaign.id, name: link.campaign.name },
      null,
      link.originalUrl,
    ).catch((err) => console.error("Webhook dispatch error:", err));
  }
}

import { NextRequest, NextResponse } from "next/server";
import { fireContactOptedOut } from "@/features/webhooks/server/webhook-events";
import { prisma } from "@/lib/prisma";
import { verifyUnsubscribeToken } from "@/features/campaigns/lib/unsubscribe";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const contactId = verifyUnsubscribeToken(token);
    if (!contactId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    const contact = await prisma.chatContact.findUnique({
      where: { id: contactId },
      select: { id: true, optedOut: true, workspaceId: true },
    });

    if (!contact) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (!contact.optedOut) {
      await prisma.$transaction([
        prisma.chatContact.update({
          where: { id: contactId },
          data: { optedOut: true },
        }),
        // Cancel any pending campaign sends
        prisma.campaignRecipient.updateMany({
          where: {
            contactId,
            status: "pending",
          },
          data: {
            status: "opted_out",
            failedAt: new Date(),
            errorMessage: "Unsubscribed via link",
          },
        }),
        // Log activity
        prisma.activity.create({
          data: {
            contactId,
            workspaceId: contact.workspaceId,
            type: "contact_updated",
            description: "Opted out of messages (unsubscribe link)",
          },
        }),
      ]);

      fireContactOptedOut(
        contact.workspaceId,
        { id: contactId, phone: null, email: null },
        "unsubscribe_link",
      ).catch((err) => console.error("Webhook dispatch error:", err));
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Unsubscribe error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

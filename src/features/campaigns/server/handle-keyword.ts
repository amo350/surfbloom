import { prisma } from "@/lib/prisma";
import { sendSms } from "@/lib/twilio";

/**
 * Check if an inbound message matches a text-to-join keyword.
 * Returns true if handled (caller should skip normal processing).
 */
export async function handleKeywordMatch(
  workspaceId: string,
  fromPhone: string,
  body: string,
  twilioUserId: string,
): Promise<boolean> {
  const keyword = body.trim().toUpperCase();

  // Quick bail — keywords are 2-20 chars, alphanumeric only
  if (keyword.length < 2 || keyword.length > 20) return false;
  if (!/^[A-Z0-9]+$/.test(keyword)) return false;

  const match = await prisma.textToJoinKeyword.findUnique({
    where: {
      workspaceId_keyword: {
        workspaceId,
        keyword,
      },
    },
    select: {
      id: true,
      active: true,
      autoReply: true,
      stage: true,
      categoryId: true,
      source: true,
      workspace: {
        select: {
          id: true,
          name: true,
          twilioPhoneNumber: { select: { phoneNumber: true } },
        },
      },
    },
  });

  if (!match || !match.active) return false;

  const twilioPhone = match.workspace.twilioPhoneNumber?.phoneNumber;
  if (!twilioPhone) return false;

  const contact = await prisma.chatContact.upsert({
    where: {
      workspaceId_phone: {
        workspaceId,
        phone: fromPhone,
      },
    } as any,
    update: {
      optedOut: false,
      stage: match.stage,
      source: match.source,
    },
    create: {
      workspaceId,
      phone: fromPhone,
      stage: match.stage,
      source: match.source,
      optedOut: false,
    },
    select: { id: true, optedOut: true },
  });

  if (match.categoryId) {
    await prisma.contactCategory.upsert({
      where: {
        contactId_categoryId: {
          contactId: contact.id,
          categoryId: match.categoryId,
        },
      },
      update: {},
      create: {
        contactId: contact.id,
        categoryId: match.categoryId,
      },
    });
  }

  // Log activity
  await prisma.activity.create({
    data: {
      contactId: contact.id,
      workspaceId,
      type: "contact_created",
      description: `Joined via text-to-join keyword "${keyword}"`,
    },
  });

  // Send auto-reply
  try {
    await sendSms({
      from: twilioPhone,
      to: fromPhone,
      body: match.autoReply,
      userId: twilioUserId,
    });
  } catch (err) {
    console.error("Text-to-join auto-reply failed:", err);
    // Don't fail the whole flow — contact was still created
  }

  // Increment counter (fire and forget)
  prisma.textToJoinKeyword
    .update({
      where: { id: match.id },
      data: { contactCount: { increment: 1 } },
    })
    .catch((err) => {
      console.error("Keyword counter increment failed:", err);
    });

  return true;
}

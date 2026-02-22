import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/features/contacts/server/log-activity";
import { autoEnrollOnContactCreated } from "@/features/sequences/server/auto-enroll";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; secret: string }> },
) {
  const { workspaceId, secret } = await params;

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { id: true, inviteCode: true, webhookSecret: true },
  });

  if (!workspace) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Check dedicated secret first, fall back to invite code
  const validSecret = workspace.webhookSecret || workspace.inviteCode;
  if (secret !== validSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Accept single contact or array
  const contacts: any[] = Array.isArray(body) ? body : [body];

  if (contacts.length === 0) {
    return NextResponse.json(
      { error: "No contacts provided" },
      { status: 400 },
    );
  }

  if (contacts.length > 500) {
    return NextResponse.json(
      { error: "Max 500 contacts per request" },
      { status: 400 },
    );
  }

  const results = {
    created: 0,
    updated: 0,
    errors: [] as string[],
  };
  const createdContacts: { id: string }[] = [];

  for (const contact of contacts) {
    try {
      if (!contact.firstName?.trim()) {
        results.errors.push("Missing firstName");
        continue;
      }

      const phone = contact.phone?.trim() || null;
      const email = contact.email?.trim() || null;

      // Dedup on phone within workspace
      if (phone) {
        const existing = await prisma.chatContact.findFirst({
          where: { workspaceId, phone },
        });

        if (existing) {
          // Update existing
          await prisma.chatContact.update({
            where: { id: existing.id },
            data: {
              firstName: contact.firstName.trim(),
              lastName: contact.lastName?.trim() || existing.lastName,
              email: email || existing.email,
              notes: contact.notes?.trim() || existing.notes,
              stage: contact.stage || existing.stage,
              isContact: true,
            },
          });

          try {
            await logActivity({
              contactId: existing.id,
              workspaceId,
              type: "contact_updated",
              description: "Updated via webhook",
              metadata: { source: "webhook" },
            });
          } catch {
            // best-effort, don't fail the import
          }

          results.updated++;
          continue;
        }
      }

      // Dedup on email if no phone match
      if (email) {
        const existing = await prisma.chatContact.findFirst({
          where: { workspaceId, email },
        });

        if (existing) {
          await prisma.chatContact.update({
            where: { id: existing.id },
            data: {
              firstName: contact.firstName.trim(),
              lastName: contact.lastName?.trim() || existing.lastName,
              phone: phone || existing.phone,
              notes: contact.notes?.trim() || existing.notes,
              stage: contact.stage || existing.stage,
              isContact: true,
            },
          });

          try {
            await logActivity({
              contactId: existing.id,
              workspaceId,
              type: "contact_updated",
              description: "Updated via webhook",
              metadata: { source: "webhook" },
            });
          } catch {
            // best-effort, don't fail the import
          }

          results.updated++;
          continue;
        }
      }

      // Create new
      const newContact = await prisma.chatContact.create({
        data: {
          workspaceId,
          firstName: contact.firstName.trim(),
          lastName: contact.lastName?.trim() || null,
          email,
          phone,
          stage: contact.stage || "new_lead",
          source: "webhook",
          notes: contact.notes?.trim() || null,
          isContact: true,
        },
      });

      try {
        await logActivity({
          contactId: newContact.id,
          workspaceId,
          type: "contact_created",
          description: "Created via webhook",
          metadata: { source: "webhook" },
        });
      } catch {
        // best-effort, don't fail the import
      }

      results.created++;
      createdContacts.push({ id: newContact.id });
    } catch (err: any) {
      results.errors.push(err.message || "Unknown error");
    }
  }

  for (const contact of createdContacts) {
    autoEnrollOnContactCreated(workspaceId, contact.id).catch((err) =>
      console.error("Sequence auto-enroll error:", err),
    );
  }

  return NextResponse.json({
    success: true,
    ...results,
    total: contacts.length,
  });
}

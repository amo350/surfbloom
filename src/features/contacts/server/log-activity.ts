// src/features/contacts/server/log-activity.ts
import { prisma } from "@/lib/prisma";

export async function logActivity({
  contactId,
  workspaceId,
  type,
  description,
  metadata,
}: {
  contactId: string;
  workspaceId: string;
  type: string;
  description: string;
  metadata?: Record<string, any>;
}) {
  return prisma.activity.create({
    data: {
      contactId,
      workspaceId,
      type,
      description,
      metadata,
    },
  });
}

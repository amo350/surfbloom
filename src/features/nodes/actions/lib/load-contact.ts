import type { WorkflowContext } from "@/features/nodes/types";
import { prisma } from "@/lib/prisma";

export interface WorkflowContact {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  stage: string;
  source: string;
  optedOut: boolean;
  workspaceId: string;
  assignedToId: string | null;
}

/**
 * Load the contact for the current workflow execution.
 * Reads contactId from context (set by trigger), fetches full record.
 * Returns null if no contactId in context.
 */
export async function loadContact(
  context: WorkflowContext,
): Promise<WorkflowContact | null> {
  const contactId =
    (context.contactId as string) || ((context.contact as any)?.id as string);

  if (!contactId) return null;

  const contact = await prisma.chatContact.findUnique({
    where: { id: contactId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      stage: true,
      source: true,
      optedOut: true,
      workspaceId: true,
      assignedToId: true,
    },
  });

  return contact;
}

/**
 * Load workspace for template resolution and config.
 */
export async function loadWorkspace(workspaceId: string) {
  return prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: {
      id: true,
      userId: true,
      name: true,
      phone: true,
      feedbackSlug: true,
      googleReviewUrl: true,
      brandTone: true,
      brandIndustry: true,
      brandServices: true,
      brandUsps: true,
      brandInstructions: true,
      twilioPhoneNumber: {
        select: { phoneNumber: true },
      },
      fromEmail: true,
      fromEmailName: true,
    },
  });
}

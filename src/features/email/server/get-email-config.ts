import { prisma } from "@/lib/prisma";
import { TRPCError } from "@trpc/server";

export interface EmailConfig {
  fromEmail: string;
  fromName: string;
  workspaceId: string;
  workspaceName: string;
}

export async function getEmailConfig(
  workspaceId: string,
): Promise<EmailConfig> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: {
      id: true,
      name: true,
      fromEmail: true,
      fromEmailName: true,
    },
  });

  if (!workspace) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Workspace not found" });
  }

  if (!workspace.fromEmail) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message:
        "No sender email configured for this location. Set one in workspace settings.",
    });
  }

  return {
    fromEmail: workspace.fromEmail,
    fromName: workspace.fromEmailName || workspace.name,
    workspaceId: workspace.id,
    workspaceName: workspace.name,
  };
}

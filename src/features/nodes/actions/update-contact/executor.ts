import { logActivity } from "@/features/contacts/server/log-activity";
import { fireWorkflowTrigger } from "@/features/nodes/lib/trigger-dispatcher";
import type { NodeExecutor } from "@/features/nodes/types";
import { NodeType } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { loadContact } from "../lib/load-contact";
import { resolveTemplate } from "../lib/resolve-template";
import { updateContactChannel } from "./channel";
import type { UpdateContactNodeData } from "./types";

export const updateContactExecutor: NodeExecutor<UpdateContactNodeData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(updateContactChannel().status({ nodeId, status: "loading" }));

  try {
    const result = await step.run("update-contact", async () => {
      const contact = await loadContact(context);
      if (!contact) throw new Error("No contact in workflow context");

      const workspaceId = context.workspaceId as string | undefined;
      if (!workspaceId) throw new Error("No workspaceId in context");

      const triggerMeta = context._trigger as { depth?: number } | undefined;
      const depth = triggerMeta?.depth || 0;

      switch (data.action) {
        case "update_stage": {
          const newStage = data.stage?.trim();
          if (!newStage) throw new Error("No target stage configured");

          const previousStage = contact.stage;

          await prisma.chatContact.update({
            where: { id: contact.id },
            data: { stage: newStage },
          });

          await logActivity({
            contactId: contact.id,
            workspaceId,
            type: "stage_changed",
            description: `Stage changed from ${previousStage} to ${newStage} (workflow)`,
          });

          fireWorkflowTrigger({
            triggerType: NodeType.STAGE_CHANGED,
            payload: {
              workspaceId,
              contactId: contact.id,
              previousStage,
              newStage,
            },
            triggerDepth: depth,
          });

          return { ...context, _lastStage: newStage };
        }

        case "add_category": {
          const categoryName = data.categoryName?.trim();
          if (!categoryName) throw new Error("No category name configured");

          const category = await prisma.category.upsert({
            where: { workspaceId_name: { workspaceId, name: categoryName } },
            update: {},
            create: { workspaceId, name: categoryName },
          });

          await prisma.contactCategory.upsert({
            where: {
              contactId_categoryId: {
                contactId: contact.id,
                categoryId: category.id,
              },
            },
            update: {},
            create: { contactId: contact.id, categoryId: category.id },
          });

          fireWorkflowTrigger({
            triggerType: NodeType.CATEGORY_ADDED,
            payload: {
              workspaceId,
              contactId: contact.id,
              categoryId: category.id,
              categoryName: category.name,
            },
            triggerDepth: depth,
          });

          return { ...context, _lastCategory: categoryName };
        }

        case "remove_category": {
          const categoryName = data.categoryName?.trim();
          if (!categoryName) throw new Error("No category name configured");

          const category = await prisma.category.findUnique({
            where: { workspaceId_name: { workspaceId, name: categoryName } },
          });

          if (category) {
            await prisma.contactCategory.deleteMany({
              where: {
                contactId: contact.id,
                categoryId: category.id,
              },
            });
          }

          return { ...context, _lastCategory: categoryName };
        }

        case "log_note": {
          const note = resolveTemplate(
            data.noteTemplate || "Workflow note",
            context as Record<string, unknown>,
          );

          await logActivity({
            contactId: contact.id,
            workspaceId,
            type: "note_added",
            description: note,
            metadata: { source: "workflow", nodeId },
          });

          return context;
        }

        case "assign_contact": {
          const assigneeId = data.assigneeId?.trim();
          if (!assigneeId) throw new Error("No assignee configured");

          await prisma.chatContact.update({
            where: { id: contact.id },
            data: { assignedToId: assigneeId },
          });

          await logActivity({
            contactId: contact.id,
            workspaceId,
            type: "contact_updated",
            description: "Contact assigned to team member (workflow)",
          });

          return { ...context, _lastAssignee: assigneeId };
        }

        default:
          throw new Error(`Unknown contact action: ${String(data.action)}`);
      }
    });

    await publish(updateContactChannel().status({ nodeId, status: "success" }));
    return result;
  } catch (error) {
    await publish(updateContactChannel().status({ nodeId, status: "error" }));
    throw error;
  }
};

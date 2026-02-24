import type { NodeExecutor } from "@/features/nodes/types";
import { prisma } from "@/lib/prisma";
import { resolveTemplate } from "../lib/resolve-template";
import { createTaskChannel } from "./channel";

interface CreateTaskData {
  titleTemplate?: string;
  descriptionTemplate?: string;
  assigneeId?: string; // specific member ID, or empty for unassigned
  priority?: string; // "low" | "medium" | "high" | "urgent"
  dueDateOffset?: number; // hours from now
  columnId?: string; // specific column, or empty for first column
}

export const createTaskExecutor: NodeExecutor<CreateTaskData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(createTaskChannel().status({ nodeId, status: "loading" }));

  try {
    const result = await step.run("create-task", async () => {
      const workspaceId = context.workspaceId as string;
      if (!workspaceId) throw new Error("No workspaceId in context");

      const templateContext = { ...context };

      const title = resolveTemplate(
        data.titleTemplate || "Workflow Task",
        templateContext,
      );
      const description = data.descriptionTemplate
        ? resolveTemplate(data.descriptionTemplate, templateContext)
        : undefined;

      // Get target column (first column if not specified)
      let columnId = data.columnId;
      if (!columnId) {
        const firstColumn = await prisma.taskColumn.findFirst({
          where: { workspaceId },
          orderBy: { position: "asc" },
          select: { id: true },
        });
        if (!firstColumn) throw new Error("No task columns in workspace");
        columnId = firstColumn.id;
      }

      // Get next task number
      const lastTask = await prisma.task.findFirst({
        where: { workspaceId },
        orderBy: { taskNumber: "desc" },
        select: { taskNumber: true },
      });
      const taskNumber = (lastTask?.taskNumber || 0) + 1;

      // Compute due date
      let dueDate: Date | undefined;
      if (data.dueDateOffset) {
        dueDate = new Date(Date.now() + data.dueDateOffset * 3600 * 1000);
      }

      const contactId =
        (context.contactId as string) ||
        ((context.contact as any)?.id as string) ||
        undefined;

      const task = await prisma.task.create({
        data: {
          workspaceId,
          columnId,
          name: title,
          description,
          taskNumber,
          assigneeId: data.assigneeId || undefined,
          contactId: contactId || undefined,
          dueDate,
          category: data.priority || undefined,
          position: 0, // top of column
        },
      });

      return {
        ...context,
        _lastTaskName: title,
        _lastTaskId: task.id,
      };
    });

    await publish(createTaskChannel().status({ nodeId, status: "success" }));
    return result;
  } catch (error) {
    await publish(createTaskChannel().status({ nodeId, status: "error" }));
    throw error;
  }
};

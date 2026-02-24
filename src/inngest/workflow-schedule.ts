import { NodeType } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { inngest } from "./client";
import { sendWorkflowExecution } from "./utils";

export const checkScheduledWorkflows = inngest.createFunction(
  {
    id: "check-scheduled-workflows",
    name: "Check Scheduled Workflows",
    concurrency: [{ limit: 1 }],
  },
  { cron: "* * * * *" },
  async ({ step }) => {
    const now = new Date();
    const currentHour = now.getUTCHours();
    const currentMinute = now.getUTCMinutes();
    const currentDay = now.getUTCDay();

    const scheduleNodes = await step.run("find-scheduled", async () => {
      return prisma.node.findMany({
        where: {
          type: NodeType.SCHEDULE,
          workflow: {
            active: true,
          },
        },
        select: {
          workflowId: true,
          data: true,
          workflow: {
            select: {
              workspaceId: true,
            },
          },
        },
      });
    });

    let fired = 0;

    for (const node of scheduleNodes) {
      const data = (node.data || {}) as {
        frequency?: string;
        hour?: number;
        minute?: number;
        dayOfWeek?: number;
        dayOfMonth?: number;
      };

      if (
        !shouldFireSchedule(data, currentHour, currentMinute, currentDay, now)
      ) {
        continue;
      }

      await sendWorkflowExecution({
        workflowId: node.workflowId,
        initialData: {
          workspaceId: node.workflow.workspaceId,
          _trigger: {
            type: "SCHEDULE",
            depth: 0,
            firedAt: now.toISOString(),
          },
          timestamp: now.toISOString(),
        },
      }).catch((err) => {
        console.error(
          `[workflow-schedule] Failed to fire ${node.workflowId}:`,
          err,
        );
      });

      fired++;
    }

    return { checked: scheduleNodes.length, fired };
  },
);

function shouldFireSchedule(
  data: {
    frequency?: string;
    hour?: number;
    minute?: number;
    dayOfWeek?: number;
    dayOfMonth?: number;
  },
  currentHour: number,
  currentMinute: number,
  currentDay: number,
  now: Date,
): boolean {
  if (data.hour != null && data.hour !== currentHour) return false;
  if (data.minute != null && data.minute !== currentMinute) return false;

  switch (data.frequency) {
    case "daily":
      return true;
    case "weekly":
      return data.dayOfWeek === currentDay;
    case "monthly":
      return data.dayOfMonth === now.getUTCDate();
    default:
      return false;
  }
}

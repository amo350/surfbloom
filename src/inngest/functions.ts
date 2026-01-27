import { generateText } from "ai";
import { NonRetriableError } from "inngest";
import { getExecutor } from "@/features/nodes/lib/executor-registry";
import { ExecutionStatus, NodeType } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { geminiChannel } from "@/features/nodes/channels/gemini";
import { googleFormTriggerChannel } from "@/features/nodes/channels/google-form-trigger";
import { httpRequestChannel } from "@/features/nodes/channels/http-request";
import { manualTriggerChannel } from "@/features/nodes/channels/manual-trigger";
import { openAiChannel } from "@/features/nodes/channels/openAi";
import { stripeTriggerChannel } from "@/features/nodes/channels/stripe-trigger";
import { xAiChannel } from "@/features/nodes/channels/xAi";
import { inngest } from "./client";
import { topologicalSort } from "./utils";
import { slackChannel } from "@/features/nodes/channels/slack";

export const executeWorkflow = inngest.createFunction(
  { id: "execute-workflow" },
  {
    event: "workflows/execute.workflow",
    retries: 3,
    onFailure: async ({ event, step }: { event: any; step: any }) => {
      return prisma.execution.update({
        where: { inngestEventId: event.data.event.id },
        data: {
          status: ExecutionStatus.FAILED,
          error: event.data.error.message,
          errorStack: event.data.error.stack,
        },
      });
    },
    channels: [
      httpRequestChannel(),
      manualTriggerChannel(),
      googleFormTriggerChannel(),
      stripeTriggerChannel(),
      geminiChannel(),
      openAiChannel(),
      xAiChannel(),
      slackChannel(),
    ],
  },
  async ({ event, step, publish }) => {
    const inngestEventId = event.id;
    const workflowId = event.data.workflowId;
    if (!workflowId || !inngestEventId) {
      throw new NonRetriableError("Event ID or workflow ID is missing");
    }

    await step.run("create-execution", async () => {
      return prisma.execution.create({
        data: {
          workflowId,
          inngestEventId,
        },
      });
    });

    try {
      const sortedNodes = await step.run("prepare workflow", async () => {
        const workflow = await prisma.workflow.findUniqueOrThrow({
          where: { id: workflowId },
          include: {
            nodes: true,
            connections: true,
          },
        });
        return topologicalSort(workflow.nodes, workflow.connections);
      });

      //Initialize the context with any ititial data from the trigger
      let context = event.data.initialData || {};

      //execute nodes
      for (const node of sortedNodes) {
        const executor = getExecutor(node.type as NodeType);
        context = await executor({
          data: (node.data || {}) as Record<string, unknown>,
          nodeId: node.id,
          context,
          step,
          publish,
        });
      }

      await step.run("update-execution", async () => {
        return prisma.execution.update({
          where: { inngestEventId },
          data: {
            status: ExecutionStatus.SUCCESS,
            completeAt: new Date(),
            output: context,
          },
        });
      });

      return {
        workflowId,
        result: context,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const stack = err instanceof Error ? err.stack : undefined;

      // Mirror the success update shape, but for failures.
      await step.run("fail-execution", async () => {
        return prisma.execution.update({
          where: { inngestEventId },
          data: {
            status: ExecutionStatus.FAILED,
            completeAt: new Date(),
            error: message,
            errorStack: stack,
          },
        });
      });

      throw err;
    }
  },
);

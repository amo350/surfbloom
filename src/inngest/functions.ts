import { generateText } from "ai";
import { NonRetriableError } from "inngest";
import { getExecutor } from "@/features/executions/lib/executor-registry";
import { NodeType } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { googleFormTriggerChannel } from "./channels/google-form-trigger";
import { httpRequestChannel } from "./channels/http-request";
import { manualTriggerChannel } from "./channels/manual-trigger";
import { stripeTriggerChannel } from "./channels/stripe-trigger";
import { inngest } from "./client";
import { topologicalSort } from "./utils";

export const executeWorkflow = inngest.createFunction(
  { id: "execute-workflow" },
  {
    event: "workflows/execute.workflow",
    retries: 3,
    channels: [
      httpRequestChannel(),
      manualTriggerChannel(),
      googleFormTriggerChannel(),
      stripeTriggerChannel(),
    ],
  },
  async ({ event, step, publish }) => {
    const workflowId = event.data.workflowId;
    if (!workflowId) {
      throw new NonRetriableError("Workflow Id is missing");
    }

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

    return {
      workflowId,
      result: context,
    };
  },
);

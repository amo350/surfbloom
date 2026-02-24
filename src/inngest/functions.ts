import { NonRetriableError } from "inngest";
import { geminiChannel } from "@/features/nodes/channels/gemini";
import { googleFormTriggerChannel } from "@/features/nodes/channels/google-form-trigger";
import { httpRequestChannel } from "@/features/nodes/channels/http-request";
import { manualTriggerChannel } from "@/features/nodes/channels/manual-trigger";
import { openAiChannel } from "@/features/nodes/channels/openAi";
import { slackChannel } from "@/features/nodes/channels/slack";
import { stripeTriggerChannel } from "@/features/nodes/channels/stripe-trigger";
import { xAiChannel } from "@/features/nodes/channels/xAi";
import { getExecutor } from "@/features/nodes/lib/executor-registry";
import { ifElseChannel } from "@/features/nodes/logic/if-else/channel";
import { waitChannel } from "@/features/nodes/logic/wait/channel";
import { categoryAddedChannel } from "@/features/nodes/triggers/category-added/channel";
import { contactCreatedChannel } from "@/features/nodes/triggers/contact-created/channel";
import { reviewReceivedChannel } from "@/features/nodes/triggers/review-received/channel";
import { scheduleChannel } from "@/features/nodes/triggers/schedule/channel";
import type { WorkflowContext } from "@/features/nodes/types";
import { ExecutionStatus, NodeType } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { inngest } from "./client";
import {
  buildAdjacencyMap,
  buildNodeMap,
  deserializeAdjacency,
  findEntryNode,
  getNextNodeIds,
  serializeAdjacency,
  serializeSortedOrder,
  topologicalSort,
} from "./execution-graph";

const MAX_NODES_PER_EXECUTION = 50;

export const executeWorkflow = inngest.createFunction(
  {
    id: "execute-workflow",
    name: "Execute Workflow",
    concurrency: [{ limit: 10, key: "event.data.workflowId" }],
  },
  {
    event: "workflows/execute.workflow",
    retries: 3,
    onFailure: async ({ event }: { event: any; step: any }) => {
      const failedEventId = event.data?.event?.id;
      if (!failedEventId) return;

      return prisma.execution.updateMany({
        where: { inngestEventId: failedEventId },
        data: {
          status: ExecutionStatus.FAILED,
          error: event.data?.error?.message ?? "Workflow execution failed",
          errorStack: event.data?.error?.stack,
          completeAt: new Date(),
          currentNodeId: null,
          waitingAtNodeId: null,
          nextStepAt: null,
        },
      });
    },
    channels: [
      httpRequestChannel(),
      manualTriggerChannel(),
      googleFormTriggerChannel(),
      stripeTriggerChannel(),
      contactCreatedChannel(),
      reviewReceivedChannel(),
      categoryAddedChannel(),
      scheduleChannel(),
      geminiChannel(),
      openAiChannel(),
      xAiChannel(),
      slackChannel(),
      ifElseChannel(),
      waitChannel(),
    ],
  },
  async ({ event, step, publish }) => {
    const workflowId = event.data?.workflowId as string | undefined;
    const inngestEventId = event.id as string | undefined;
    const initialData = (event.data?.initialData || {}) as WorkflowContext;

    if (!workflowId || !inngestEventId) {
      throw new NonRetriableError("Event ID or workflow ID is missing");
    }

    const execution = await step.run("create-execution", async () => {
      const triggerMeta = (initialData as Record<string, unknown>)._trigger as
        | { type?: string; depth?: number }
        | undefined;

      return prisma.execution.create({
        data: {
          workflowId,
          inngestEventId,
          status: ExecutionStatus.RUNNING,
          triggerType: triggerMeta?.type || "MANUAL_TRIGGER",
          triggerDepth: triggerMeta?.depth ?? 0,
        },
      });
    });

    try {
      const prepared = await step.run("prepare-workflow", async () => {
        const workflow = await prisma.workflow.findUniqueOrThrow({
          where: { id: workflowId },
          include: {
            nodes: true,
            connections: true,
          },
        });

        const adjacency = buildAdjacencyMap(workflow.connections);
        const entryNode = findEntryNode(workflow.nodes, workflow.connections);

        if (!entryNode) {
          throw new Error("Workflow has no entry node");
        }

        const sorted = topologicalSort(workflow.nodes, workflow.connections);

        return {
          adjacency: serializeAdjacency(adjacency),
          nodeMap: Object.fromEntries(buildNodeMap(workflow.nodes)),
          sortedOrder: serializeSortedOrder(sorted),
          entryNodeId: entryNode.id,
        };
      });

      const adjacency = deserializeAdjacency(prepared.adjacency);
      const nodeLookup = prepared.nodeMap as Record<
        string,
        { id: string; type: NodeType; name?: string; data: unknown }
      >;

      let context = initialData;
      const active = new Set<string>([prepared.entryNodeId]);
      const visited = new Set<string>();
      let nodesExecuted = 0;

      for (const currentId of prepared.sortedOrder) {
        if (!active.has(currentId)) continue;

        if (visited.has(currentId)) continue;
        visited.add(currentId);

        nodesExecuted++;
        if (nodesExecuted > MAX_NODES_PER_EXECUTION) {
          throw new Error(
            `Execution exceeded max nodes (${MAX_NODES_PER_EXECUTION}). Possible cycle or overly complex workflow.`,
          );
        }

        const node = nodeLookup[currentId];
        if (!node) continue;

        await step.run(`track-node-${currentId}`, async () => {
          await prisma.execution.update({
            where: { id: execution.id },
            data: { currentNodeId: currentId },
          });
        });

        const nodeStartedAt = new Date();
        let nodeCompletedAt = nodeStartedAt;
        let branch: string | undefined;

        try {
          const executor = getExecutor(node.type as NodeType);
          context = await executor({
            data: (node.data || {}) as Record<string, unknown>,
            nodeId: currentId,
            context,
            step,
            publish,
          });
          nodeCompletedAt = new Date();

          branch = getBranch(context);
          if (branch) {
            delete (context as Record<string, unknown>)._branch;
          }

          const waitConfig = getWaitConfig(context);
          if (waitConfig) {
            delete (context as Record<string, unknown>)._wait;

            await step.run(`wait-status-${currentId}`, async () => {
              await prisma.execution.update({
                where: { id: execution.id },
                data: {
                  status: ExecutionStatus.WAITING,
                  waitingAtNodeId: currentId,
                  nextStepAt: new Date(Date.now() + waitConfig.seconds * 1000),
                },
              });
            });

            await step.sleep(`wait-${currentId}`, `${waitConfig.seconds}s`);

            await step.run(`resume-after-wait-${currentId}`, async () => {
              await prisma.execution.update({
                where: { id: execution.id },
                data: {
                  status: ExecutionStatus.RUNNING,
                  waitingAtNodeId: null,
                  nextStepAt: null,
                },
              });
            });
          }

          const waitUntilConfig = getWaitUntilConfig(context);
          if (waitUntilConfig) {
            delete (context as Record<string, unknown>)._waitUntil;

            await step.run(`wait-until-status-${currentId}`, async () => {
              await prisma.execution.update({
                where: { id: execution.id },
                data: {
                  status: ExecutionStatus.WAITING,
                  waitingAtNodeId: currentId,
                  nextStepAt: waitUntilConfig.timestamp,
                },
              });
            });

            await step.sleepUntil(
              `wait-until-${currentId}`,
              waitUntilConfig.timestamp,
            );

            await step.run(`resume-after-wait-until-${currentId}`, async () => {
              await prisma.execution.update({
                where: { id: execution.id },
                data: {
                  status: ExecutionStatus.RUNNING,
                  waitingAtNodeId: null,
                  nextStepAt: null,
                },
              });
            });
          }

          await step.run(`log-node-success-${currentId}`, async () => {
            await prisma.nodeExecutionLog.create({
              data: {
                executionId: execution.id,
                nodeId: currentId,
                nodeType: String(node.type),
                nodeName: node.name || String(node.type),
                status: "success",
                startedAt: nodeStartedAt,
                completedAt: new Date(),
                durationMs: nodeCompletedAt.getTime() - nodeStartedAt.getTime(),
                outputSummary: buildOutputSummary(
                  String(node.type),
                  context,
                  currentId,
                ),
              },
            });
          });
        } catch (nodeErr) {
          const message =
            nodeErr instanceof Error ? nodeErr.message : String(nodeErr);

          await step.run(`log-node-failed-${currentId}`, async () => {
            await prisma.nodeExecutionLog.create({
              data: {
                executionId: execution.id,
                nodeId: currentId,
                nodeType: String(node.type),
                nodeName: node.name || String(node.type),
                status: "failed",
                error: message,
                startedAt: nodeStartedAt,
                completedAt: new Date(),
                durationMs: Date.now() - nodeStartedAt.getTime(),
              },
            });
          });

          throw nodeErr;
        }

        const nextIds = getNextNodeIds(adjacency, currentId, branch);
        for (const nextId of nextIds) {
          active.add(nextId);
        }
      }

      await step.run("complete-execution", async () => {
        return prisma.execution.update({
          where: { id: execution.id },
          data: {
            status: ExecutionStatus.SUCCESS,
            completeAt: new Date(),
            output: context as any,
            currentNodeId: null,
            waitingAtNodeId: null,
            nextStepAt: null,
          },
        });
      });

      return {
        executionId: execution.id,
        workflowId,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const stack = err instanceof Error ? err.stack : undefined;

      await step.run("fail-execution", async () => {
        return prisma.execution.update({
          where: { id: execution.id },
          data: {
            status: ExecutionStatus.FAILED,
            completeAt: new Date(),
            error: message,
            errorStack: stack,
            currentNodeId: null,
            waitingAtNodeId: null,
            nextStepAt: null,
          },
        });
      });

      throw err;
    }
  },
);

function getBranch(context: WorkflowContext): string | undefined {
  const value = (context as Record<string, unknown>)._branch;
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function getWaitConfig(
  context: WorkflowContext,
): { seconds: number; label?: string } | undefined {
  const value = (context as Record<string, unknown>)._wait;
  if (!value || typeof value !== "object") return undefined;

  const seconds = (value as { seconds?: unknown }).seconds;
  if (
    typeof seconds !== "number" ||
    !Number.isFinite(seconds) ||
    seconds <= 0
  ) {
    return undefined;
  }

  const label = (value as { label?: unknown }).label;
  return {
    seconds: Math.floor(seconds),
    ...(typeof label === "string" ? { label } : {}),
  };
}

function getWaitUntilConfig(
  context: WorkflowContext,
): { timestamp: Date; label?: string } | undefined {
  const value = (context as Record<string, unknown>)._waitUntil;
  if (!value || typeof value !== "object") return undefined;

  const rawTimestamp = (value as { timestamp?: unknown }).timestamp;
  if (typeof rawTimestamp !== "string") return undefined;

  const timestamp = new Date(rawTimestamp);
  if (Number.isNaN(timestamp.getTime())) return undefined;

  const label = (value as { label?: unknown }).label;
  return {
    timestamp,
    ...(typeof label === "string" ? { label } : {}),
  };
}

function buildOutputSummary(
  nodeType: string,
  context: WorkflowContext,
  nodeId: string,
): string | null {
  const ctx = context as Record<string, unknown>;

  try {
    switch (nodeType) {
      case "SEND_SMS":
        return `SMS sent to ${readString(ctx._lastSmsTo) || "contact"}`;
      case "SEND_EMAIL":
        return `Email sent to ${readString(ctx._lastEmailTo) || "contact"}`;
      case "CREATE_TASK":
        return `Task created: ${readString(ctx._lastTaskName) || ""}`.trim();
      case "IF_ELSE":
      case "SWITCH":
        return `Branch: ${readString(ctx._lastBranch) || "unknown"}`;
      case "WAIT":
        return `Wait node executed (${nodeId})`;
      case "WAIT_UNTIL":
        return `Wait until node executed (${nodeId})`;
      case "UPDATE_STAGE":
        return `Stage -> ${readString(ctx._lastStage) || ""}`.trim();
      case "ADD_CATEGORY":
        return `Added category: ${readString(ctx._lastCategory) || ""}`.trim();
      case "REMOVE_CATEGORY":
        return `Removed category: ${readString(ctx._lastCategory) || ""}`.trim();
      case "AI_NODE": {
        const aiOutput = readString(ctx.aiOutput);
        return aiOutput
          ? `AI: ${aiOutput.slice(0, 100)}`
          : "AI generated output";
      }
      case "POST_SLACK":
        return "Posted to Slack";
      case "LOG_NOTE":
        return "Note logged";
      default:
        return null;
    }
  } catch {
    return null;
  }
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

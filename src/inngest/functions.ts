import { NonRetriableError } from "inngest";
import { createTaskChannel } from "@/features/nodes/actions/create-task/channel";
import { sendEmailChannel } from "@/features/nodes/actions/send-email/channel";
import { sendSmsChannel } from "@/features/nodes/actions/send-sms/channel";
import { updateContactChannel } from "@/features/nodes/actions/update-contact/channel";
import { aiNodeChannel } from "@/features/nodes/ai/ai-node/channel";
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
  type AdjacencyMap,
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
      aiNodeChannel(),
      geminiChannel(),
      openAiChannel(),
      xAiChannel(),
      slackChannel(),
      sendSmsChannel(),
      sendEmailChannel(),
      createTaskChannel(),
      updateContactChannel(),
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
          workspaceId: workflow.workspaceId,
          adjacency: serializeAdjacency(adjacency),
          nodeMap: Object.fromEntries(buildNodeMap(workflow.nodes)),
          sortedOrder: serializeSortedOrder(sorted),
          entryNodeId: entryNode.id,
        };
      });

      const workspace = await step.run("load-workspace-context", async () => {
        return prisma.workspace.findUniqueOrThrow({
          where: { id: prepared.workspaceId },
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
      });

      const adjacency = deserializeAdjacency(prepared.adjacency);
      const nodeLookup = prepared.nodeMap as Record<
        string,
        { id: string; type: NodeType; name?: string; data: unknown }
      >;

      let context: WorkflowContext = {
        ...initialData,
        workspaceId: workspace.id,
        workspace,
        location_name: workspace.name,
        location_phone: workspace.phone,
      };
      const batchContactIds = Array.isArray(context.contactIds)
        ? context.contactIds.filter(
            (value): value is string =>
              typeof value === "string" && value.length > 0,
          )
        : [];
      const isBatch = Boolean(context.isBatch) && batchContactIds.length > 0;

      if (isBatch) {
        const results: {
          contactId: string;
          status: "success" | "failed";
          error?: string;
        }[] = [];

        for (const [index, contactId] of batchContactIds.entries()) {
          const contactData = await step.run(
            `load-batch-contact-${index + 1}`,
            async () => {
              return prisma.chatContact.findUnique({
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
            },
          );

          if (!contactData) {
            results.push({
              contactId,
              status: "failed",
              error: "Contact not found",
            });
            if (index < batchContactIds.length - 1) {
              await step.sleep(`batch-throttle-${index + 1}`, "1s");
            }
            continue;
          }

          if (contactData.workspaceId !== workspace.id) {
            results.push({
              contactId,
              status: "failed",
              error: "Contact does not belong to this workspace",
            });
            if (index < batchContactIds.length - 1) {
              await step.sleep(`batch-throttle-${index + 1}`, "1s");
            }
            continue;
          }

          let contactContext = clearBatchFields({
            ...context,
            contactId: contactData.id,
            contact: contactData,
          });

          try {
            contactContext = await executeNodeWalk({
              context: contactContext,
              adjacency,
              nodeLookup,
              sortedOrder: prepared.sortedOrder,
              entryNodeId: prepared.entryNodeId,
              executionId: execution.id,
              step,
              publish,
              runKey: `batch-${index + 1}`,
            });
            results.push({ contactId, status: "success" });
            context = contactContext;
          } catch (nodeErr) {
            const errorMsg =
              nodeErr instanceof Error ? nodeErr.message : String(nodeErr);
            results.push({ contactId, status: "failed", error: errorMsg });

            await step.run(`log-contact-error-${index + 1}`, async () => {
              await prisma.nodeExecutionLog.create({
                data: {
                  executionId: execution.id,
                  nodeId: "batch-loop",
                  nodeType: "BATCH",
                  nodeName: `Contact ${contactData.firstName || contactId}`,
                  status: "failed",
                  error: errorMsg,
                  startedAt: new Date(),
                  completedAt: new Date(),
                  durationMs: 0,
                },
              });
            });
          }

          if (index < batchContactIds.length - 1) {
            await step.sleep(`batch-throttle-${index + 1}`, "1s");
          }
        }

        const totalFailed = results.filter((result) => result.status === "failed")
          .length;
        const totalSuccess = results.filter((result) => result.status === "success")
          .length;
        const majorityFailed = totalFailed > totalSuccess;

        await step.run("complete-batch-execution", async () => {
          await prisma.execution.update({
            where: { id: execution.id },
            data: {
              status: majorityFailed
                ? ExecutionStatus.FAILED
                : ExecutionStatus.SUCCESS,
              output: {
                results,
                totalContacts: batchContactIds.length,
                totalSuccess,
                totalFailed,
              } as any,
              completeAt: new Date(),
              currentNodeId: null,
              waitingAtNodeId: null,
              nextStepAt: null,
              error: majorityFailed
                ? `Batch failed: ${totalFailed}/${batchContactIds.length} contacts failed`
                : null,
            },
          });
        });

        return {
          executionId: execution.id,
          workflowId,
          batch: true,
          totalSuccess,
          totalFailed,
        };
      }

      const hydratedContact = await step.run("load-contact-context", async () => {
        const contactId =
          (context.contactId as string | undefined) ||
          ((context.contact as { id?: string } | undefined)?.id as
            | string
            | undefined);

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

        if (!contact) return null;
        if (contact.workspaceId !== workspace.id) return null;
        return contact;
      });

      if (hydratedContact) {
        context = {
          ...context,
          contactId: hydratedContact.id,
          contact: hydratedContact,
        };
      } else if (
        (initialData as Record<string, unknown>).contactId ||
        (initialData as Record<string, unknown>).contact
      ) {
        // Prevent unverified/stale contact payload from crossing workspace boundaries.
        delete (context as Record<string, unknown>).contactId;
        delete (context as Record<string, unknown>).contact;
      }
      context = await executeNodeWalk({
        context,
        adjacency,
        nodeLookup,
        sortedOrder: prepared.sortedOrder,
        entryNodeId: prepared.entryNodeId,
        executionId: execution.id,
        step,
        publish,
        runKey: "single",
      });

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

async function executeNodeWalk(params: {
  context: WorkflowContext;
  adjacency: AdjacencyMap;
  nodeLookup: Record<string, { id: string; type: NodeType; name?: string; data: unknown }>;
  sortedOrder: string[];
  entryNodeId: string;
  executionId: string;
  step: any;
  publish: any;
  runKey: string;
}): Promise<WorkflowContext> {
  let { context } = params;
  const active = new Set<string>([params.entryNodeId]);
  const visited = new Set<string>();
  let nodesExecuted = 0;

  for (const currentId of params.sortedOrder) {
    if (!active.has(currentId)) continue;
    if (visited.has(currentId)) continue;
    visited.add(currentId);

    nodesExecuted++;
    if (nodesExecuted > MAX_NODES_PER_EXECUTION) {
      throw new Error(
        `Execution exceeded max nodes (${MAX_NODES_PER_EXECUTION}). Possible cycle or overly complex workflow.`,
      );
    }

    const node = params.nodeLookup[currentId];
    if (!node) continue;

    await params.step.run(
      `track-node-${params.runKey}-${currentId}`,
      async () => {
        await prisma.execution.update({
          where: { id: params.executionId },
          data: { currentNodeId: currentId },
        });
      },
    );

    const nodeStartedAt = new Date();
    let nodeCompletedAt = nodeStartedAt;
    let branch: string | undefined;

    try {
      const executor = getExecutor(node.type as NodeType);
      context = await executor({
        data: (node.data || {}) as Record<string, unknown>,
        nodeId: currentId,
        context,
        step: params.step,
        publish: params.publish,
      });
      nodeCompletedAt = new Date();

      branch = getBranch(context);
      if (branch) {
        delete (context as Record<string, unknown>)._branch;
      }

      const waitConfig = getWaitConfig(context);
      if (waitConfig) {
        delete (context as Record<string, unknown>)._wait;

        await params.step.run(
          `wait-status-${params.runKey}-${currentId}`,
          async () => {
            await prisma.execution.update({
              where: { id: params.executionId },
              data: {
                status: ExecutionStatus.WAITING,
                waitingAtNodeId: currentId,
                nextStepAt: new Date(Date.now() + waitConfig.seconds * 1000),
              },
            });
          },
        );

        await params.step.sleep(
          `wait-${params.runKey}-${currentId}`,
          `${waitConfig.seconds}s`,
        );

        await params.step.run(
          `resume-after-wait-${params.runKey}-${currentId}`,
          async () => {
            await prisma.execution.update({
              where: { id: params.executionId },
              data: {
                status: ExecutionStatus.RUNNING,
                waitingAtNodeId: null,
                nextStepAt: null,
              },
            });
          },
        );
      }

      const waitUntilConfig = getWaitUntilConfig(context);
      if (waitUntilConfig) {
        delete (context as Record<string, unknown>)._waitUntil;

        await params.step.run(
          `wait-until-status-${params.runKey}-${currentId}`,
          async () => {
            await prisma.execution.update({
              where: { id: params.executionId },
              data: {
                status: ExecutionStatus.WAITING,
                waitingAtNodeId: currentId,
                nextStepAt: waitUntilConfig.timestamp,
              },
            });
          },
        );

        await params.step.sleepUntil(
          `wait-until-${params.runKey}-${currentId}`,
          waitUntilConfig.timestamp,
        );

        await params.step.run(
          `resume-after-wait-until-${params.runKey}-${currentId}`,
          async () => {
            await prisma.execution.update({
              where: { id: params.executionId },
              data: {
                status: ExecutionStatus.RUNNING,
                waitingAtNodeId: null,
                nextStepAt: null,
              },
            });
          },
        );
      }

      await params.step.run(
        `log-node-success-${params.runKey}-${currentId}`,
        async () => {
          await prisma.nodeExecutionLog.create({
            data: {
              executionId: params.executionId,
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
                (node.data || {}) as Record<string, unknown>,
              ),
            },
          });
        },
      );
    } catch (nodeErr) {
      const message = nodeErr instanceof Error ? nodeErr.message : String(nodeErr);

      await params.step.run(
        `log-node-failed-${params.runKey}-${currentId}`,
        async () => {
          await prisma.nodeExecutionLog.create({
            data: {
              executionId: params.executionId,
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
        },
      );

      throw nodeErr;
    }

    const nextIds = getNextNodeIds(params.adjacency, currentId, branch);
    for (const nextId of nextIds) {
      active.add(nextId);
    }
  }

  return context;
}

function clearBatchFields(context: WorkflowContext): WorkflowContext {
  const nextContext = { ...context } as Record<string, unknown>;
  delete nextContext.isBatch;
  delete nextContext.contactIds;
  return nextContext;
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
  data: Record<string, unknown>,
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
      case "UPDATE_CONTACT": {
        const stage = readString(ctx._lastStage);
        if (stage) return `Stage -> ${stage}`;
        const category = readString(ctx._lastCategory);
        if (category) return `Category: ${category}`;
        if (readString(ctx._lastAssignee)) return "Assigned to member";
        return "Contact updated";
      }
      case "AI_NODE": {
        const variableName = readString(data.variableName);
        // biome-ignore format: keep this compact inline fallback expression.
        const output = ctx.aiOutput || (variableName ? ctx[variableName] : null);
        return `AI: ${String(output || "").slice(0, 100)}`;
      }
      case "POST_SLACK":
        return "Posted to Slack";
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

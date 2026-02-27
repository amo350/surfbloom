import type { NodeType } from "@/generated/prisma/enums";
import {
  sendWorkflowBatchTrigger,
  sendWorkflowExecution,
} from "@/inngest/utils";
import { prisma } from "@/lib/prisma";

interface TriggerPayload {
  contactId?: string;
  workspaceId: string;
  [key: string]: unknown;
}

interface TriggerOptions {
  /** Which trigger node type to match */
  triggerType: NodeType;

  /** Data passed into the workflow as initialData / context */
  payload: TriggerPayload;

  /**
   * If this trigger was fired from inside another workflow execution,
   * pass the current depth. fireWorkflowTrigger will skip if >= 3.
   */
  triggerDepth?: number;
}

const BATCHABLE_TRIGGERS = new Set<NodeType>([
  "CONTACT_CREATED",
  "KEYWORD_JOINED",
]);

/**
 * Central event bus for workflow triggers.
 *
 * 1. Finds workflows in the workspace that have a node of `triggerType`
 * 2. For each match, routes to debounced batch trigger or immediate execution
 * 3. Fire-and-forget — catches and logs errors, never throws
 *
 * Call this from any handler that should potentially start a workflow.
 */
export async function fireWorkflowTrigger({
  triggerType,
  payload,
  triggerDepth = 0,
}: TriggerOptions): Promise<void> {
  // Cycle prevention: max depth 3
  if (triggerDepth >= 3) {
    console.warn(
      `[trigger-dispatcher] Skipping ${triggerType} — triggerDepth ${triggerDepth} >= 3`,
    );
    return;
  }

  try {
    // First, try active workflows only.
    // If none are active, fall back to all workflows in workspace so trigger
    // wiring still works in environments where "active" toggling isn't wired.
    const activeTriggerNodes = await prisma.node.findMany({
      where: {
        type: triggerType,
        workflow: {
          workspaceId: payload.workspaceId,
          active: true,
        },
      },
      select: {
        workflowId: true,
        data: true, // trigger config (e.g. category filter, rating filter)
      },
    });

    const triggerNodes =
      activeTriggerNodes.length > 0
        ? activeTriggerNodes
        : await prisma.node.findMany({
            where: {
              type: triggerType,
              workflow: {
                workspaceId: payload.workspaceId,
              },
            },
            select: {
              workflowId: true,
              data: true, // trigger config (e.g. category filter, rating filter)
            },
          });

    if (activeTriggerNodes.length === 0 && triggerNodes.length > 0) {
      console.warn(
        `[trigger-dispatcher] No active workflows matched ${triggerType} in workspace ${payload.workspaceId}; falling back to all workflows`,
      );
    }

    if (triggerNodes.length === 0) return;

    // Deduplicate by workflowId (a workflow should only have one trigger node,
    // but guard against duplicates)
    const seen = new Set<string>();

    const sends: Promise<unknown>[] = [];
    for (const node of triggerNodes) {
      if (seen.has(node.workflowId)) continue;
      seen.add(node.workflowId);

      // Check trigger-level filters (stored in node.data)
      const nodeData = (node.data || {}) as Record<string, unknown>;
      if (!matchesTriggerFilter(triggerType, nodeData, payload)) continue;

      if (
        BATCHABLE_TRIGGERS.has(triggerType) &&
        typeof payload.contactId === "string" &&
        payload.contactId.length > 0
      ) {
        sends.push(
          sendWorkflowBatchTrigger({
            workflowId: node.workflowId,
            workspaceId: payload.workspaceId,
            contactId: payload.contactId,
            triggerType,
            triggerDepth: triggerDepth + 1,
            ...(payload.keyword !== undefined
              ? { keyword: String(payload.keyword) }
              : {}),
            triggerPayload: payload,
          }).catch((err) => {
            console.error(
              `[trigger-dispatcher] Failed to enqueue batch trigger for workflow ${node.workflowId}:`,
              err,
            );
          }),
        );
      } else {
        sends.push(
          sendWorkflowExecution({
            workflowId: node.workflowId,
            initialData: {
              ...payload,
              _trigger: {
                type: triggerType,
                depth: triggerDepth + 1,
                firedAt: new Date().toISOString(),
              },
            },
          }).catch((err) => {
            console.error(
              `[trigger-dispatcher] Failed to fire workflow ${node.workflowId} for ${triggerType}:`,
              err,
            );
          }),
        );
      }
    }

    await Promise.allSettled(sends);
  } catch (err) {
    // Never throw — the calling handler should not fail because of workflow triggers
    console.error(
      `[trigger-dispatcher] Error finding workflows for ${triggerType}:`,
      err,
    );
  }
}

/**
 * Check if the trigger node's config filters match the incoming payload.
 * Returns true if the payload should fire this workflow.
 *
 * Each trigger type can have optional filters in node.data:
 * - CATEGORY_ADDED: { categoryName: "no-show" } → only fire for that category
 * - REVIEW_RECEIVED: { minRating: 1, maxRating: 3 } → only fire for rating range
 * - CONTACT_CREATED: { source: "keyword" } → only fire for that source
 * - No filter = fire for all
 */
function matchesTriggerFilter(
  triggerType: NodeType,
  nodeData: Record<string, unknown>,
  payload: TriggerPayload,
): boolean {
  switch (triggerType) {
    case "CATEGORY_ADDED": {
      const filterName = nodeData.categoryName as string | undefined;
      if (filterName && payload.categoryName !== filterName) return false;
      return true;
    }

    case "REVIEW_RECEIVED": {
      const minRating = nodeData.minRating as number | undefined;
      const maxRating = nodeData.maxRating as number | undefined;
      const rating = payload.rating as number | undefined;
      if ((minRating != null || maxRating != null) && rating == null) {
        return false;
      }
      if (rating != null && minRating != null && rating < minRating)
        return false;
      if (rating != null && maxRating != null && rating > maxRating)
        return false;
      return true;
    }

    case "CONTACT_CREATED": {
      const filterSource = nodeData.source as string | undefined;
      if (filterSource && payload.source !== filterSource) return false;
      return true;
    }

    case "STAGE_CHANGED": {
      const filterStage = nodeData.stage as string | undefined;
      if (filterStage && payload.newStage !== filterStage) return false;
      return true;
    }

    case "KEYWORD_JOINED": {
      const filterKeyword = nodeData.keyword as string | undefined;
      if (filterKeyword && payload.keyword !== filterKeyword) return false;
      return true;
    }

    case "SURVEY_COMPLETED": {
      const filterSurveyId = nodeData.surveyId as string | undefined;
      if (filterSurveyId && payload.surveyId !== filterSurveyId) return false;
      return true;
    }

    case "TASK_COMPLETED": {
      // Optional: filter by task category or linked entity type
      return true;
    }

    case "FEEDBACK_SUBMITTED":
    case "SMS_RECEIVED":
    case "SCHEDULE":
    case "MANUAL_TRIGGER":
    default:
      // No filter — always fire
      return true;
  }
}

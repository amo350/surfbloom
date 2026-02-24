import type { NodeType } from "@/generated/prisma/enums";
import { sendWorkflowExecution } from "@/inngest/utils";
import { prisma } from "@/lib/prisma";

interface TriggerPayload {
  contactId?: string;
  workspaceId: string;
  [key: string]: unknown;
}

interface TriggerOptions {
  /** Which trigger node type to match */
  triggerType: string;

  /** Data passed into the workflow as initialData / context */
  payload: TriggerPayload;

  /**
   * If this trigger was fired from inside another workflow execution,
   * pass the current depth. fireWorkflowTrigger will skip if >= 3.
   */
  triggerDepth?: number;
}

/**
 * Central event bus for workflow triggers.
 *
 * 1. Finds active workflows in the workspace that have a node of `triggerType`
 * 2. For each match, fires sendWorkflowExecution with the payload
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
    // Find active workflows in this workspace that contain a trigger node
    // of the matching type. We query Node to find workflows, not Workflow
    // directly, because the trigger type lives on the node.
    const triggerNodes = await prisma.node.findMany({
      where: {
        type: triggerType as NodeType,
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

    if (triggerNodes.length === 0) return;

    // Deduplicate by workflowId (a workflow should only have one trigger node,
    // but guard against duplicates)
    const seen = new Set<string>();

    for (const node of triggerNodes) {
      if (seen.has(node.workflowId)) continue;
      seen.add(node.workflowId);

      // Check trigger-level filters (stored in node.data)
      const nodeData = (node.data || {}) as Record<string, unknown>;
      if (!matchesTriggerFilter(triggerType, nodeData, payload)) continue;

      // Fire the workflow — non-blocking
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
      });
    }
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
  triggerType: string,
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

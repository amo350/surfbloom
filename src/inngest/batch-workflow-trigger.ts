import { inngest } from "./client";

export const batchWorkflowTrigger = inngest.createFunction(
  {
    id: "batch-workflow-trigger",
    name: "Batch Workflow Trigger",
    debounce: {
      period: "10s",
      key: "event.data.workflowId + '-' + event.data.workspaceId",
    },
  },
  { event: "workflows/batch.trigger" },
  async ({ event, events, step }) => {
    const allEvents = events || [event];

    const contactIds = [
      ...new Set(
        allEvents
          .map((currentEvent) => currentEvent.data.contactId as string)
          .filter(Boolean),
      ),
    ];

    const workflowId = event.data.workflowId as string;
    const workspaceId = event.data.workspaceId as string;
    const triggerType = event.data.triggerType as string;
    const triggerDepth = (event.data.triggerDepth as number) || 0;

    if (!workflowId || !workspaceId || contactIds.length === 0) {
      return { skipped: true };
    }

    await step.sendEvent("fire-batch-execution", {
      name: "workflows/execute.workflow",
      data: {
        workflowId,
        initialData: {
          workspaceId,
          contactIds,
          batchSize: contactIds.length,
          isBatch: true,
          _trigger: {
            type: triggerType,
            depth: triggerDepth,
            firedAt: new Date().toISOString(),
            batchedFrom: allEvents.length,
          },
        },
      },
    });

    return {
      batchSize: contactIds.length,
      eventsCollected: allEvents.length,
    };
  },
);

# Inngest flow & routing (Surfbloom)

This doc describes how Inngest is wired so new features follow the same pattern and stay consistent with the codebase.

---

## 1. Overview

- **Single client** in `src/inngest/client.ts` (app id `surfbloom`).
- **All functions** are registered in **one API route**: `src/app/api/inngest/route.ts`.
- **Triggering** is done from tRPC routers (or API routes) by sending events. Prefer **send helpers** in `src/inngest/utils.ts` so event names and payloads stay consistent.

Event naming: **`domain/action.resource`** (e.g. `workflows/execute.workflow`, `reports/generate.report`, `workspace/sync.reviews`).

---

## 2. File map

| Purpose | File |
|--------|------|
| Inngest client | `src/inngest/client.ts` |
| Register functions | `src/app/api/inngest/route.ts` |
| Send helpers (event names + payloads) | `src/inngest/utils.ts` |
| Function definitions | `src/inngest/functions.ts`, `src/inngest/report.ts`, `src/inngest/sync-reviews.ts` |
| Trigger from backend | Feature’s `server/routers.ts` (or API route) → import from `@/inngest/utils` or `@/inngest/client` |

---

## 3. Client (do not duplicate)

```ts
// src/inngest/client.ts
import { realtimeMiddleware } from "@inngest/realtime/middleware";
import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "surfbloom",
  middleware: [realtimeMiddleware()],
});
```

Use this single `inngest` instance everywhere (utils, functions, or routers when not using a send helper).

---

## 4. Register every function in the API route

Every Inngest function must be passed to `serve()` in the Inngest API route:

```ts
// src/app/api/inngest/route.ts
import { serve } from "inngest/next";
import { executeWorkflow } from "@/inngest/functions";
import { generateReport } from "@/inngest/report";
import { syncReviews } from "@/inngest/sync-reviews";
import { inngest } from "@/inngest/client";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [executeWorkflow, generateReport, syncReviews],
});
```

When you add a new feature:

1. Create the function (e.g. in `src/inngest/my-feature.ts`).
2. Import it here and add it to the `functions` array.

---

## 5. Send helpers (utils)

Centralize event name and payload shape in `src/inngest/utils.ts`:

```ts
// src/inngest/utils.ts
import { createId } from "@paralleldrive/cuid2";
import { inngest } from "./client";

// Example: workflow execution
export const sendWorkflowExecution = async (data: {
  workflowId: string;
  [key: string]: any;
}) => {
  return inngest.send({
    name: "workflows/execute.workflow",
    data,
    id: createId(),
  });
};

// Example: report generation
export const sendReportGeneration = async (data: {
  reportId: string;
  workspaceId: string;
  query: string;
  smartRetry?: boolean;
  forceRefresh?: boolean;
}) => {
  return inngest.send({
    name: "reports/generate.report",
    data,
    id: createId(),
  });
};

// Example: review sync
export const sendReviewSync = async (data: {
  workspaceId: string;
  forceRefresh?: boolean;
}) => {
  return inngest.send({
    name: "workspace/sync.reviews",
    data,
    id: createId(),
  });
};
```

Rules:

- Event **name**: `domain/action.resource` (e.g. `workflows/execute.workflow`).
- **data**: typed object; include all payload the function needs.
- **id**: use `createId()` for idempotency when the run is unique per “job” (e.g. one execution, one report). Omit or use a stable id if you want deduplication.

---

## 6. Triggering from a tRPC router

Do auth and validation in the router, then call the send helper (or `inngest.send`). Do **not** put Inngest logic inside the router; keep it to “send this event”.

```ts
// Example: src/features/workflows/server/routers.ts
import { sendWorkflowExecution } from "@/inngest/utils";

execute: protectedProcedure
  .input(z.object({ id: z.string(), workspaceId: z.string() }))
  .mutation(async ({ input, ctx }) => {
    const membership = await prisma.member.findUnique({
      where: {
        userId_workspaceId: {
          userId: ctx.auth.user.id,
          workspaceId: input.workspaceId,
        },
      },
    });
    if (!membership) throw new TRPCError({ code: "FORBIDDEN", message: "..." });

    const workflow = await prisma.workflow.findUniqueOrThrow({
      where: { id: input.id, workspaceId: input.workspaceId },
    });

    await sendWorkflowExecution({ workflowId: input.id });

    return workflow;
  }),
```

```ts
// Example: src/features/seo-reports/server/routers.ts
import { sendReportGeneration } from "@/inngest/utils";

// After creating the report row:
await sendReportGeneration({
  reportId: report.id,
  workspaceId: input.workspaceId,
  query: input.query,
  forceRefresh: input.forceRefresh,
});
```

```ts
// Example: src/features/reviews/server/routers.ts
import { sendReviewSync } from "@/inngest/utils";

await sendReviewSync({ workspaceId, forceRefresh });
```

---

## 7. Defining an Inngest function

Two patterns used in this codebase:

- **Event-only** (reports, sync): `createFunction` with `event: "domain/action.resource"`.
- **Event + channels** (workflows): same plus `channels` for realtime; event name in options.

Use **steps** (`step.run`) for durable, retryable work and to persist state.

### 7a. Simple event-driven function (e.g. report, sync)

```ts
// src/inngest/report.ts (simplified)
import { NonRetriableError } from "inngest";
import { inngest } from "./client";

export const generateReport = inngest.createFunction(
  {
    id: "generate-report",
    retries: 2,
    onFailure: async ({ event }: { event: any }) => {
      const reportId = event.data.event.data?.reportId;
      if (reportId) {
        await prisma.report.update({
          where: { id: reportId },
          data: { status: ReportStatus.FAILED, error: "...", completedAt: new Date() },
        });
      }
    },
  },
  { event: "reports/generate.report" },
  async ({ event, step }) => {
    const { reportId, workspaceId, query } = event.data;
    if (!reportId || !workspaceId) {
      throw new NonRetriableError("reportId and workspaceId are required");
    }

    // Each step is retryable and memoized
    const data = await step.run("fetch-data", async () => { ... });
    const verified = await step.run("verify", async () => { ... });
    // ...
    return { reportId, status: "completed" };
  },
);
```

- **id**: unique function id (e.g. `"generate-report"`).
- **event**: must match the name used in `inngest.send()` (e.g. `reports/generate.report`).
- **onFailure**: optional; use to update DB (e.g. report status) on final failure.
- Use **step.run** for each logical phase so Inngest can retry and memoize.

### 7b. Workflow execution (event + channels)

```ts
// src/inngest/functions.ts (simplified)
import { inngest } from "./client";

export const executeWorkflow = inngest.createFunction(
  { id: "execute-workflow" },
  {
    event: "workflows/execute.workflow",
    retries: 3,
    onFailure: async ({ event }) => {
      await prisma.execution.update({
        where: { inngestEventId: event.data.event.id },
        data: { status: ExecutionStatus.FAILED, error: event.data.error.message, ... },
      });
    },
    channels: [httpRequestChannel(), manualTriggerChannel(), ...],
  },
  async ({ event, step, publish }) => {
    const { workflowId } = event.data;
    await step.run("create-execution", async () => prisma.execution.create({ ... }));
    // ... run nodes with step + publish
    await step.run("update-execution", async () => prisma.execution.update({ ... }));
    return { workflowId, result: context };
  },
);
```

- **channels**: only needed when the function uses realtime (e.g. workflow node status).
- **publish**: use inside steps to send realtime events to the client.

---

## 8. Adding a new Inngest-backed feature (checklist)

1. **Event name**  
   Choose: `domain/action.resource` (e.g. `campaigns/send.campaign`).

2. **Send helper** in `src/inngest/utils.ts`:
   ```ts
   export const sendCampaignSend = async (data: { campaignId: string }) => {
     return inngest.send({
       name: "campaigns/send.campaign",
       data,
       id: createId(),
     });
   };
   ```

3. **Function file** (e.g. `src/inngest/campaign-send.ts`):
   - `inngest.createFunction({ id: "...", retries, onFailure }, { event: "campaigns/send.campaign" }, async ({ event, step }) => { ... })`.
   - Use `step.run` for each logical step.
   - In `onFailure`, update any DB state (e.g. campaign status) if needed.

4. **Register** in `src/app/api/inngest/route.ts`:
   ```ts
   import { sendCampaign } from "@/inngest/campaign-send";
   // ...
   functions: [executeWorkflow, generateReport, syncReviews, sendCampaign],
   ```

5. **Trigger** from your feature router (or API route):
   - Import `sendCampaignSend` from `@/inngest/utils` (or `inngest` from `@/inngest/client` and call `inngest.send` with the same event name).
   - After auth and validation, call the helper with the payload.

---

## 9. Summary table

| Feature      | Event name                   | Send helper                 | Function file        |
|-------------|------------------------------|-----------------------------|----------------------|
| Workflows   | `workflows/execute.workflow` | `sendWorkflowExecution`     | `functions.ts`       |
| SEO reports | `reports/generate.report`    | `sendReportGeneration`     | `report.ts`          |
| Review sync | `workspace/sync.reviews`     | `sendReviewSync`            | `sync-reviews.ts`    |

Campaigns currently use `campaign/send` and `inngest.send` from the campaigns router; for consistency, add a send helper in `utils.ts`, a function that listens for that event (or the namespaced `campaigns/send.campaign`), and register it in `route.ts`.

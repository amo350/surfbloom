import { executionsRouter } from "@/features/executions/server/routers";
import { workspacesRouter } from "@/features/workspaces/server/routers";
import { workflowsRouter } from "@/features/workflows/server/routers";
import { createTRPCRouter } from "../init";

export const appRouter = createTRPCRouter({
  executions: executionsRouter,
  workspaces: workspacesRouter,
  workflows: workflowsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;

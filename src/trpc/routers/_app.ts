import { executionsRouter } from "@/features/executions/server/routers";
import { createTRPCRouter } from "../init";
import { workflowsRouter } from "@/features/workflows/server/routers";

export const appRouter = createTRPCRouter({
  executions: executionsRouter,
  workflows: workflowsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;

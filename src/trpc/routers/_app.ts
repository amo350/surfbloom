import { executionsRouter } from "@/features/executions/server/routers";
import { workspacesRouter } from "@/features/workspaces/server/routers";
import { workflowsRouter } from "@/features/workflows/server/routers";
import { createTRPCRouter } from "../init";
import { membersRouter } from "@/features/members/server/routers";
import { invitationsRouter } from "@/features/invitations/server/routers";
import { accountMembersRouter } from "@/features/account-members/server/routers";
import { tasksRouter } from "@/features/tasks/server/routers";
import { taskColumnsRouter } from "@/features/task-columns/server/routers";

export const appRouter = createTRPCRouter({
  executions: executionsRouter,
  workspaces: workspacesRouter,
  workflows: workflowsRouter,
  members: membersRouter,
  invitations: invitationsRouter,
  accountMembers: accountMembersRouter,
  tasks: tasksRouter,
  taskColumns: taskColumnsRouter,
});
//CRITICAL: Do not remove this line - required for tRPC type inference
export type AppRouter = typeof appRouter;

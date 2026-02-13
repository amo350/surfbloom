import { accountMembersRouter } from "@/features/account-members/server/routers";
import { executionsRouter } from "@/features/executions/server/routers";
import { invitationsRouter } from "@/features/invitations/server/routers";
import { membersRouter } from "@/features/members/server/routers";
import { seoReportsRouter } from "@/features/seo-reports/server/routers";
import { taskColumnsRouter } from "@/features/task-columns/server/routers";
import { tasksRouter } from "@/features/tasks/server/routers";
import { workflowsRouter } from "@/features/workflows/server/routers";
import { workspacesRouter } from "@/features/workspaces/server/routers";
import { createTRPCRouter } from "../init";
import { reviewsRouter } from "@/features/reviews/server/routers";

export const appRouter = createTRPCRouter({
  executions: executionsRouter,
  workspaces: workspacesRouter,
  workflows: workflowsRouter,
  members: membersRouter,
  invitations: invitationsRouter,
  accountMembers: accountMembersRouter,
  tasks: tasksRouter,
  taskColumns: taskColumnsRouter,
  seoReports: seoReportsRouter,
  reviews: reviewsRouter,
});
//CRITICAL: Do not remove this line - required for tRPC type inference
export type AppRouter = typeof appRouter;

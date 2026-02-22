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
import { chatbotRouter } from "@/features/chatbot/server/routers";
import { integrationsRouter } from "@/features/integrations/server/routers";
import { contactsRouter } from "@/features/contacts/server/routers";
import { campaignsRouter } from "@/features/campaigns/server/routers";
import { templateRouter } from "@/features/campaigns/server/template-router";
import { segmentRouter } from "@/features/campaigns/server/segment-router";
import { aiRouter } from "@/features/campaigns/server/ai-router";
import { linkRouter } from "@/features/campaigns/server/link-router";
import { keywordRouter } from "@/features/campaigns/server/keyword-router";
import { emailTemplateRouter } from "@/features/email/server/email-template-router";
import { emailStatsRouter } from "@/features/email/server/email-stats-router";
import { webhookRouter } from "@/features/webhooks/server/webhook-router";
import { sequenceRouter } from "@/features/sequences/server/sequence-router";

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
  chatbot: chatbotRouter,
  integrations: integrationsRouter,
  contacts: contactsRouter,
  campaigns: campaignsRouter,
  templates: templateRouter,
  segments: segmentRouter,
  campaignAi: aiRouter,
  campaignLinks: linkRouter,
  keywords: keywordRouter,
  emailTemplates: emailTemplateRouter,
  emailStats: emailStatsRouter,
  webhooks: webhookRouter,
  sequences: sequenceRouter,
});
//CRITICAL: Do not remove this line - required for tRPC type inference
export type AppRouter = typeof appRouter;

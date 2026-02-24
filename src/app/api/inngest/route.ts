import { serve } from "inngest/next";
import { checkRecurringCampaigns } from "@/inngest/campaign-recurring";
import { sendCampaign } from "@/inngest/campaign-send";
import { inngest } from "@/inngest/client";
import { executeWorkflow } from "@/inngest/functions";
import { generateReport } from "@/inngest/report";
import { processSequenceSteps } from "@/inngest/sequence-engine";
import { surveyTimeoutCheck } from "@/inngest/survey-timeout";
import { syncReviews } from "@/inngest/sync-reviews";
import { checkScheduledWorkflows } from "@/inngest/workflow-schedule";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    executeWorkflow,
    generateReport,
    syncReviews,
    sendCampaign,
    checkRecurringCampaigns,
    processSequenceSteps,
    surveyTimeoutCheck,
    checkScheduledWorkflows,
  ],
});

import { serve } from "inngest/next";
import { checkRecurringCampaigns } from "@/inngest/campaign-recurring";
import { sendCampaign } from "@/inngest/campaign-send";
import { inngest } from "@/inngest/client";
import { executeWorkflow } from "@/inngest/functions";
import { generateReport } from "@/inngest/report";
import { syncReviews } from "@/inngest/sync-reviews";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    executeWorkflow,
    generateReport,
    syncReviews,
    sendCampaign,
    checkRecurringCampaigns,
  ],
});

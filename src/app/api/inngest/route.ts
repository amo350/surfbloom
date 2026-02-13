import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { executeWorkflow } from "@/inngest/functions";
import { generateReport } from "@/inngest/report";
import { syncReviews } from "@/inngest/sync-reviews";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [executeWorkflow, generateReport, syncReviews],
});

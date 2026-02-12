import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { executeWorkflow } from "@/inngest/functions";
import { generateReport } from "@/inngest/report";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [executeWorkflow, generateReport],
});

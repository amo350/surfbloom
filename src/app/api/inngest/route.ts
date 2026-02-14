import { serve } from "inngest/next";
import { executeWorkflow } from "@/inngest/functions";
import { generateReport } from "@/inngest/report";
import { inngest } from "@/inngest/client";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [executeWorkflow, generateReport],
});

import { NonRetriableError } from "inngest";
import { analyzeInsights } from "@/features/seo-reports/steps/analyze-insights";
import { analyzeReputation } from "@/features/seo-reports/steps/analyze-reputation";
import { analyzeVisibility } from "@/features/seo-reports/steps/analyze-visibility";
import { completeReport } from "@/features/seo-reports/steps/complete-report";
import { fetchData } from "@/features/seo-reports/steps/fetch-data";
import type { ReportContext } from "@/features/seo-reports/steps/types";
import { verifyBusiness } from "@/features/seo-reports/steps/verify-business";
import { ReportStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { inngest } from "./client";

export const generateReport = inngest.createFunction(
  {
    id: "generate-report",
    retries: 2,
    onFailure: async ({ event }: { event: any }) => {
      const reportId = event.data.event.data?.reportId;
      if (reportId) {
        await prisma.report.updateMany({
          where: { id: reportId },
          data: {
            status: ReportStatus.FAILED,
            error:
              event.data.error?.message ||
              "Report generation failed after retries",
            completedAt: new Date(),
          },
        });
      }
    },
  },
  { event: "reports/generate.report" },
  async ({ event, step }) => {
    const { reportId, workspaceId, query, smartRetry, forceRefresh } =
      event.data;

    if (!reportId || !workspaceId) {
      throw new NonRetriableError("reportId and workspaceId are required");
    }

    let ctx: ReportContext = {
      reportId,
      workspaceId,
      query,
      smartRetry,
      forceRefresh,
    };

    ctx = await fetchData(ctx, step);
    ctx = await verifyBusiness(ctx, step);
    ctx = await analyzeVisibility(ctx, step);
    ctx = await analyzeReputation(ctx, step);
    ctx = await analyzeInsights(ctx, step);
    ctx = await completeReport(ctx, step);

    return { reportId, status: "completed" };
  },
);

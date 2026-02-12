import { NonRetriableError } from "inngest";
import { ReportStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { getWorkspaceData, stripReviewsFromPlace } from "@/lib/workspace-data";
import type { ReportContext, ReportStepFn } from "./types";

export const fetchData: ReportStepFn = async (ctx, step) => {
  const workspaceData = await step.run("fetch-data", async () => {
    if (ctx.smartRetry) {
      const existing = await prisma.report.findUniqueOrThrow({
        where: { id: ctx.reportId },
      });

      if (!existing.rawData) {
        throw new NonRetriableError(
          "Smart retry requested but no rawData found",
        );
      }

      const workspace = await prisma.workspace.findUniqueOrThrow({
        where: { id: ctx.workspaceId },
        select: { scrapedCompetitors: true },
      });

      return {
        place: existing.rawData as any,
        competitors: (workspace.scrapedCompetitors as any[]) ?? [],
        fromCache: true,
      };
    }

    await prisma.report.update({
      where: { id: ctx.reportId },
      data: { status: ReportStatus.FETCHING },
    });

    const data = await getWorkspaceData(ctx.workspaceId, {
      query: ctx.query,
      reviewsLimit: 200,
      forceRefresh: ctx.forceRefresh,
    });

    const strippedPlace = stripReviewsFromPlace(data.place);

    await prisma.report.update({
      where: { id: ctx.reportId },
      data: { rawData: strippedPlace as any },
    });

    console.log(
      `[fetch-data] ${data.fromCache ? "Cache hit" : "Fresh fetch"} for workspace ${ctx.workspaceId}`,
    );

    return {
      place: strippedPlace,
      competitors: data.competitors,
      fromCache: data.fromCache,
    };
  });

  return {
    ...ctx,
    place: workspaceData.place,
    competitors: workspaceData.competitors,
    fromCache: workspaceData.fromCache,
  };
};

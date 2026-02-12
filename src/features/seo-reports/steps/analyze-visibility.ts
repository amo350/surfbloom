import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { NonRetriableError } from "inngest";
import { ReportStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import {
  type AnalysisReview,
  buildAnalysisPrompt,
  REPORT_SYSTEM_PROMPT,
} from "../lib/prompts";
import { visibilityBreakdownSchema } from "../lib/report-schema";
import type { ReportContext, ReportStepFn } from "./types";

export const analyzeVisibility: ReportStepFn = async (ctx, step) => {
  if (!ctx.place) {
    throw new NonRetriableError("analyze-visibility requires place data");
  }

  await step.run("update-status-analyzing", async () => {
    await prisma.report.update({
      where: { id: ctx.reportId },
      data: { status: ReportStatus.ANALYZING },
    });
  });

  const { visibilityResult, reviews } = await step.run(
    "analyze-visibility",
    async () => {
      const dbReviews = await prisma.review.findMany({
        where: { workspaceId: ctx.workspaceId, source: "google" },
        orderBy: { publishedAt: "desc" },
        take: 200,
        select: {
          rating: true,
          text: true,
          publishedAt: true,
          ownerResponse: true,
        },
      });

      const reviews: AnalysisReview[] = dbReviews.map((r) => ({
        rating: r.rating,
        text: r.text,
        publishedAt: r.publishedAt ? new Date(r.publishedAt) : null,
        ownerResponse: r.ownerResponse,
      }));

      const analysisPrompt = buildAnalysisPrompt(
        ctx.place,
        ctx.competitors ?? null,
        reviews,
      );

      const { object } = await generateObject({
        model: openai("gpt-4o"),
        system: REPORT_SYSTEM_PROMPT,
        prompt: `Analyze the following business data and generate a VISIBILITY score breakdown.\n\n${analysisPrompt}`,
        schema: visibilityBreakdownSchema,
      });

      return { visibilityResult: object, reviews };
    },
  );

  return { ...ctx, visibilityResult, reviews };
};

import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { NonRetriableError } from "inngest";
import {
  type AnalysisReview,
  buildAnalysisPrompt,
  REPORT_SYSTEM_PROMPT,
} from "../lib/prompts";
import { reputationBreakdownSchema } from "../lib/report-schema";
import type { ReportContext, ReportStepFn } from "./types";

export const analyzeReputation: ReportStepFn = async (ctx, step) => {
  if (!ctx.place) {
    throw new NonRetriableError("analyze-reputation requires place data");
  }

  const reviews = (ctx.reviews ?? []) as AnalysisReview[];

  const reputationResult = await step.run("analyze-reputation", async () => {
    const analysisPrompt = buildAnalysisPrompt(
      ctx.place,
      ctx.competitors ?? null,
      reviews,
    );

    const { object } = await generateObject({
      model: openai("gpt-4o"),
      system: REPORT_SYSTEM_PROMPT,
      prompt: `Analyze the following business data and generate a REPUTATION score breakdown.\n\n${analysisPrompt}`,
      schema: reputationBreakdownSchema,
    });

    return object;
  });

  return { ...ctx, reputationResult };
};

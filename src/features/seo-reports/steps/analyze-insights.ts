import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { NonRetriableError } from "inngest";
import {
  type AnalysisReview,
  buildAnalysisPrompt,
  REPORT_SYSTEM_PROMPT,
} from "../lib/prompts";
import {
  recommendationsSchema,
  strengthsSchema,
  weaknessesSchema,
} from "../lib/report-schema";
import type { ReportContext, ReportStepFn } from "./types";

export const analyzeInsights: ReportStepFn = async (ctx, step) => {
  if (!ctx.place || !ctx.visibilityResult || !ctx.reputationResult) {
    throw new NonRetriableError(
      "analyze-insights requires place, visibilityResult, and reputationResult",
    );
  }

  const reviews = (ctx.reviews ?? []) as AnalysisReview[];

  const insightsResult = await step.run("analyze-insights", async () => {
    const analysisPrompt = buildAnalysisPrompt(
      ctx.place,
      ctx.competitors ?? null,
      reviews,
    );

    const insightsPrompt = `Based on the following business data and scores, generate strengths, weaknesses, and actionable recommendations.

BUSINESS DATA:
${analysisPrompt}

VISIBILITY SCORES:
${JSON.stringify(ctx.visibilityResult, null, 2)}

REPUTATION SCORES:
${JSON.stringify(ctx.reputationResult, null, 2)}`;

    const strengthsRes = await generateObject({
      model: openai("gpt-4o"),
      system: REPORT_SYSTEM_PROMPT,
      prompt: `${insightsPrompt}

Generate 2-3 strengths.
Rules:
- Each strength must reference at least one exact data point (metric or field value).
- Only describe confirmed positives.
- Do not include generic statements.`,
      schema: strengthsSchema,
    });

    const weaknessTargetCount = strengthsRes.object.items.length;

    const [weaknessesRes, recommendationsRes] = await Promise.all([
      generateObject({
        model: openai("gpt-4o"),
        system: REPORT_SYSTEM_PROMPT,
        prompt: `${insightsPrompt}

STRENGTHS ALREADY IDENTIFIED (do NOT repeat or contradict these):
${JSON.stringify(strengthsRes.object.items, null, 2)}

Generate exactly ${weaknessTargetCount} weaknesses.
Rules:
- One weakness per item (single issue only).
- Each weakness must reference at least one exact data point.
- Do NOT repeat, restate, or contradict any of the strengths above.
- Weaknesses must describe something negative or underperforming - never a positive observation.
- If DETERMINISTIC_FACTS says website/address/phone exists, do not claim they are missing.
- If a field is absent in data capture, use "not detected in available data".`,
        schema: weaknessesSchema,
      }),
      generateObject({
        model: openai("gpt-4o"),
        system: REPORT_SYSTEM_PROMPT,
        prompt: `${insightsPrompt}

Generate exactly 2 high-impact recommendations.
Rules:
- Recommendations must be ACTIONS, not observations.
- Do not restate strengths or praise current performance.
- Each recommendation title should start with a strong action verb.
- Each recommendation must target a weakness supported by data.
- Provide 2-3 concrete, execution-ready steps.`,
        schema: recommendationsSchema,
      }),
    ]);

    return {
      strengths: strengthsRes.object.items,
      weaknesses: weaknessesRes.object.items,
      recommendations: recommendationsRes.object.items,
    };
  });

  return { ...ctx, insightsResult };
};

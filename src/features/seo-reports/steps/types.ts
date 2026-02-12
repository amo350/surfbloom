import type { GetStepTools, Inngest } from "inngest";
import type { AnalysisReview } from "../lib/prompts";

export type StepTools = GetStepTools<Inngest.Any>;

export interface ReportContext {
  reportId: string;
  workspaceId: string;
  query: string;
  smartRetry?: boolean;
  forceRefresh?: boolean;

  place?: any;
  competitors?: any[];
  fromCache?: boolean;
  // Set by analyze-visibility (reused by reputation + insights)
  reviews?: AnalysisReview[];

  verification?: any;

  visibilityResult?: any;
  reputationResult?: any;
  insightsResult?: {
    strengths: any[];
    weaknesses: any[];
    recommendations: any[];
  };
}

export type ReportStepFn = (
  ctx: ReportContext,
  step: StepTools,
) => Promise<ReportContext>;

import { NonRetriableError } from "inngest";
import { ReportStatus } from "@/generated/prisma/enums";
import { type OutscraperPlace } from "@/lib/outscraper";
import { prisma } from "@/lib/prisma";
import {
  buildCompetitorJson,
  buildFallbackWeaknesses,
  dedupeInsights,
  deriveBusinessFacts,
  filterFalseClaims,
  isStrengthLeakingIntoWeakness,
  normalizeRecommendations,
  recentReviewCount,
  toSingleIssueDetail,
} from "../lib/helpers";
import type { ReportContext, ReportStepFn } from "./types";

export const completeReport: ReportStepFn = async (ctx, step) => {
  if (
    !ctx.place ||
    !ctx.visibilityResult ||
    !ctx.reputationResult ||
    !ctx.insightsResult
  ) {
    throw new NonRetriableError(
      "complete-report requires place, visibilityResult, reputationResult, and insightsResult",
    );
  }

  const insightsResult = ctx.insightsResult;
  const visibilityResult = ctx.visibilityResult;
  const reputationResult = ctx.reputationResult;

  await step.run("complete-report", async () => {
    const place = ctx.place as OutscraperPlace;
    const facts = deriveBusinessFacts(place);
    const competitorData =
      ctx.competitors && ctx.competitors.length > 0
        ? buildCompetitorJson(place, ctx.competitors)
        : null;

    const realRating = place.rating ?? null;
    const realReviewCount =
      place.reviews ??
      competitorData?.results?.find((c: any) => c.isSelf)?.reviewCount ??
      null;
    const realRecentCount = recentReviewCount(place, ctx.reviews);

    const correctedVisibility = {
      ...visibilityResult,
      website: {
        ...visibilityResult.website,
        score: facts.hasWebsite
          ? Math.max(visibilityResult.website.score, 5)
          : visibilityResult.website.score,
      },
      citations: {
        ...visibilityResult.citations,
        score: facts.hasAddress
          ? Math.max(visibilityResult.citations.score, 2)
          : visibilityResult.citations.score,
      },
    };

    const visibilityScore =
      correctedVisibility.gbp.score +
      correctedVisibility.reviews.score +
      correctedVisibility.website.score +
      correctedVisibility.behavioral.score +
      correctedVisibility.links.score +
      correctedVisibility.citations.score +
      correctedVisibility.personalization.score +
      correctedVisibility.social.score;

    const correctedReputation = {
      ...reputationResult,
      googleReviews: {
        ...reputationResult.googleReviews,
        rating: realRating,
        reviewCount: realReviewCount,
        recentReviewCount: realRecentCount,
      },
    };

    const reputationScore =
      correctedReputation.googleReviews.score +
      correctedReputation.otherReviews.score;

    const filteredStrengths = dedupeInsights(
      filterFalseClaims(insightsResult.strengths, facts),
    );

    const filteredWeaknesses = dedupeInsights(
      filterFalseClaims(insightsResult.weaknesses, facts),
    )
      .map((item) => ({
        ...item,
        detail: toSingleIssueDetail(item.detail),
      }))
      .filter(
        (item) =>
          !isStrengthLeakingIntoWeakness(
            item,
            filteredStrengths as Array<{ title: string; detail: string }>,
          ),
      );

    const targetWeaknessCount = filteredStrengths.length;
    const normalizedWeaknesses = [...filteredWeaknesses];
    const fallbackWeaknesses = buildFallbackWeaknesses(
      correctedVisibility,
      correctedReputation,
      facts,
    );

    for (const weakness of fallbackWeaknesses) {
      if (normalizedWeaknesses.length >= targetWeaknessCount) break;
      const alreadyExists = normalizedWeaknesses.some(
        (w) =>
          w.title.trim().toLowerCase() === weakness.title.trim().toLowerCase(),
      );
      if (!alreadyExists) {
        normalizedWeaknesses.push(weakness);
      }
    }

    const filteredRecommendations = normalizeRecommendations(
      dedupeInsights(filterFalseClaims(insightsResult.recommendations, facts)),
      normalizedWeaknesses,
      correctedVisibility,
      facts,
    );

    await prisma.report.update({
      where: { id: ctx.reportId },
      data: {
        status: ReportStatus.COMPLETED,
        visibilityScore,
        reputationScore,
        visibilityBreakdown: correctedVisibility as any,
        reputationBreakdown: correctedReputation as any,
        strengths: filteredStrengths as any,
        weaknesses: normalizedWeaknesses as any,
        recommendations: filteredRecommendations as any,
        competitors: competitorData as any,
        completedAt: new Date(),
        error: null,
      },
    });
  });

  return ctx;
};

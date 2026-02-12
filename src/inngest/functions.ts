import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { NonRetriableError } from "inngest";
import { geminiChannel } from "@/features/nodes/channels/gemini";
import { googleFormTriggerChannel } from "@/features/nodes/channels/google-form-trigger";
import { httpRequestChannel } from "@/features/nodes/channels/http-request";
import { manualTriggerChannel } from "@/features/nodes/channels/manual-trigger";
import { openAiChannel } from "@/features/nodes/channels/openAi";
import { slackChannel } from "@/features/nodes/channels/slack";
import { stripeTriggerChannel } from "@/features/nodes/channels/stripe-trigger";
import { xAiChannel } from "@/features/nodes/channels/xAi";
import { getExecutor } from "@/features/nodes/lib/executor-registry";
import {
  recommendationsSchema,
  reputationBreakdownSchema,
  strengthsSchema,
  type Verification,
  visibilityBreakdownSchema,
  weaknessesSchema,
} from "@/features/seo-reports/lib/report-schema";
import {
  ExecutionStatus,
  NodeType,
  ReportStatus,
} from "@/generated/prisma/enums";
import {
  type OutscraperPlace,
  type OutscraperReview,
  searchPlace,
  searchPlaceWithReviews,
} from "@/lib/outscraper";
import { prisma } from "@/lib/prisma";
import { inngest } from "./client";
import { topologicalSort } from "./utils";

// =============================================
// Existing: Workflow Execution
// =============================================

export const executeWorkflow = inngest.createFunction(
  { id: "execute-workflow" },
  {
    event: "workflows/execute.workflow",
    retries: 3,
    onFailure: async ({ event, step }: { event: any; step: any }) => {
      return prisma.execution.update({
        where: { inngestEventId: event.data.event.id },
        data: {
          status: ExecutionStatus.FAILED,
          error: event.data.error.message,
          errorStack: event.data.error.stack,
        },
      });
    },
    channels: [
      httpRequestChannel(),
      manualTriggerChannel(),
      googleFormTriggerChannel(),
      stripeTriggerChannel(),
      geminiChannel(),
      openAiChannel(),
      xAiChannel(),
      slackChannel(),
    ],
  },
  async ({ event, step, publish }) => {
    const inngestEventId = event.id;
    const workflowId = event.data.workflowId;
    if (!workflowId || !inngestEventId) {
      throw new NonRetriableError("Event ID or workflow ID is missing");
    }

    await step.run("create-execution", async () => {
      return prisma.execution.create({
        data: {
          workflowId,
          inngestEventId,
        },
      });
    });

    try {
      const sortedNodes = await step.run("prepare workflow", async () => {
        const workflow = await prisma.workflow.findUniqueOrThrow({
          where: { id: workflowId },
          include: {
            nodes: true,
            connections: true,
          },
        });
        return topologicalSort(workflow.nodes, workflow.connections);
      });

      //Initialize the context with any ititial data from the trigger
      let context = event.data.initialData || {};

      //execute nodes
      for (const node of sortedNodes) {
        const executor = getExecutor(node.type as NodeType);
        context = await executor({
          data: (node.data || {}) as Record<string, unknown>,
          nodeId: node.id,
          context,
          step,
          publish,
        });
      }

      await step.run("update-execution", async () => {
        return prisma.execution.update({
          where: { inngestEventId },
          data: {
            status: ExecutionStatus.SUCCESS,
            completeAt: new Date(),
            output: context,
          },
        });
      });

      return {
        workflowId,
        result: context,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const stack = err instanceof Error ? err.stack : undefined;

      // Mirror the success update shape, but for failures.
      await step.run("fail-execution", async () => {
        return prisma.execution.update({
          where: { inngestEventId },
          data: {
            status: ExecutionStatus.FAILED,
            completeAt: new Date(),
            error: message,
            errorStack: stack,
          },
        });
      });

      throw err;
    }
  },
);

// =============================================
// New: SEO Report Generation
// =============================================

const REPORT_SYSTEM_PROMPT = `You are a senior local SEO analyst.

MISSION:
Produce accurate local SEO scoring and insights from provided data only.

NON-NEGOTIABLE DECISION ORDER:
1) DETERMINISTIC_FACTS are ground truth for binary existence fields.
2) If DETERMINISTIC_FACTS says true, it is true. If it says false, it is false.
3) Never contradict DETERMINISTIC_FACTS in scores, notes, strengths, weaknesses, or recommendations.
4) Only infer quality/severity from evidence; never infer existence.

ACCURACY RULES:
- Use ONLY fields present in the payload.
- If a field has a value (URL, phone, address), treat it as present.
- Give zero only when data explicitly indicates empty/not listed/not available.
- Use the exact Google rating value provided; do not round.
- Use total Google review count for volume scoring.
- Use sample reviews only for qualitative signals (sentiment, text richness, response pattern estimates).
- If data was not captured, phrase as "not detected in available data".

INSIGHT QUALITY RULES:
- Every strength and weakness must reference at least one concrete data point.
- Weaknesses must be single-issue items (no multi-issue lists or chained alternatives).
- Recommendations must be concrete and actionable with 2-3 steps.
- Recommendations must not restate strengths; they must propose improvement actions.
- If operating hours are "not detected in available data", treat this as unknown data capture and do not claim hours are missing.

SCORING MODEL — VISIBILITY (100):
- GBP 32, Reviews 20, Website 15, Behavioral 9, Links 8, Citations/NAP 6, Personalization 6, Social 4.
- Behavioral and Personalization are unmeasured => measured=false and score=0.
- If website exists, website score should not be zero.

SCORING MODEL — REPUTATION (100):
- Google Reviews 90, Other Reviews 10.

REVIEW RATING SCALE:
- 4.7-5.0 => 6/6
- 4.5-4.69 => 5/6
- 4.2-4.49 => 3/6
- below 4.2 => 0-2/6`;

export const generateReport = inngest.createFunction(
  {
    id: "generate-report",
    retries: 2,
    onFailure: async ({ event }: { event: any }) => {
      const reportId = event.data.event.data?.reportId;
      if (reportId) {
        await prisma.report.update({
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
    const { reportId, workspaceId, query, smartRetry } = event.data;

    if (!reportId || !workspaceId) {
      throw new NonRetriableError("reportId and workspaceId are required");
    }

    // ---- Step 1: Fetch data from Outscraper (skip if smart retry) ----

    const rawData = await step.run("fetch-data", async () => {
      if (smartRetry) {
        const existing = await prisma.report.findUniqueOrThrow({
          where: { id: reportId },
        });

        if (!existing.rawData) {
          throw new NonRetriableError(
            "Smart retry requested but no rawData found",
          );
        }

        return existing.rawData;
      }

      await prisma.report.update({
        where: { id: reportId },
        data: { status: ReportStatus.FETCHING },
      });

      const place = await searchPlaceWithReviews(query, {
        reviewsLimit: 200,
      });

      if (!place) {
        throw new NonRetriableError(
          `No business found for "${query}". Try a more specific name and location.`,
        );
      }

      // Update Workspace — always refresh GBP metadata, only backfill empty address fields
      const workspace = await prisma.workspace.findUniqueOrThrow({
        where: { id: workspaceId },
      });

      const facts = deriveBusinessFacts(place);

      await prisma.workspace.update({
        where: { id: workspaceId },
        data: {
          // Always update GBP metadata (these come from Google, not user input)
          googlePlaceId: place.place_id || undefined,
          primaryCategory: place.category || undefined,
          secondaryCategories: place.subtypes
            ? place.subtypes.split(", ").filter(Boolean)
            : [],
          googleRating: place.rating || undefined,
          googleReviewCount: place.reviews || undefined,
          // Only backfill location/contact fields if workspace doesn't have them yet
          ...(!workspace.address && { address: facts.address || undefined }),
          ...(!workspace.city && { city: place.city || undefined }),
          ...(!workspace.state && { state: place.state || undefined }),
          ...(!workspace.zipCode && {
            zipCode: place.postal_code || undefined,
          }),
          ...(!workspace.country && { country: place.country_code || "US" }),
          ...(!workspace.phone && { phone: facts.phone || undefined }),
          ...(!workspace.website && { website: facts.website || undefined }),
          ...(!workspace.latitude && { latitude: place.latitude || undefined }),
          ...(!workspace.longitude && {
            longitude: place.longitude || undefined,
          }),
          ...(!workspace.timezone && {
            timezone: place.time_zone || undefined,
          }),
        },
      });

      await prisma.report.update({
        where: { id: reportId },
        data: { rawData: place as any },
      });

      return place as any;
    });

    // ---- Step 1b: Verify business match against workspace address ----

    const verification = await step.run("verify-business", async () => {
      const workspace = await prisma.workspace.findUniqueOrThrow({
        where: { id: workspaceId },
        select: {
          name: true,
          address: true,
          city: true,
          state: true,
          zipCode: true,
        },
      });

      const place = rawData as any;
      const mismatches: {
        field: string;
        workspace: string | null;
        outscraper: string | null;
      }[] = [];

      // Only check fields the workspace actually has filled in
      if (workspace.address && place.full_address) {
        const wsAddr = normalize(workspace.address);
        const osAddr = normalize(place.full_address);
        if (!osAddr.includes(wsAddr) && !wsAddr.includes(osAddr)) {
          mismatches.push({
            field: "address",
            workspace: workspace.address,
            outscraper: place.full_address,
          });
        }
      }

      if (workspace.city && place.city) {
        if (normalize(workspace.city) !== normalize(place.city)) {
          mismatches.push({
            field: "city",
            workspace: workspace.city,
            outscraper: place.city,
          });
        }
      }

      if (workspace.state && place.state) {
        if (normalize(workspace.state) !== normalize(place.state)) {
          mismatches.push({
            field: "state",
            workspace: workspace.state,
            outscraper: place.state,
          });
        }
      }

      if (workspace.name && place.name) {
        const wsName = normalize(workspace.name);
        const osName = normalize(place.name);
        if (!osName.includes(wsName) && !wsName.includes(osName)) {
          mismatches.push({
            field: "name",
            workspace: workspace.name,
            outscraper: place.name,
          });
        }
      }

      // Determine confidence
      const hasWorkspaceAddress = !!(workspace.address || workspace.city);
      let confidence: "high" | "medium" | "low";
      let matched: boolean;

      if (!hasWorkspaceAddress) {
        // No workspace address to compare — can't verify
        confidence = "low";
        matched = true; // Assume match, but flag for review
      } else if (mismatches.length === 0) {
        confidence = "high";
        matched = true;
      } else if (
        mismatches.some((m) => m.field === "city" || m.field === "state")
      ) {
        // Wrong city/state is a strong signal of wrong business
        confidence = "low";
        matched = false;
      } else {
        // Minor differences (address formatting, name variations)
        confidence = "medium";
        matched = true;
      }

      const needsReview =
        !hasWorkspaceAddress ||
        !matched ||
        confidence === "low" ||
        (confidence === "medium" && mismatches.length > 0);

      const result: Verification = {
        matched,
        confidence,
        workspaceData: {
          name: workspace.name,
          address: workspace.address,
          city: workspace.city,
          state: workspace.state,
          zipCode: workspace.zipCode,
        },
        outscraperData: {
          name: place.name || null,
          address: place.full_address || null,
          placeId: place.place_id || null,
          latitude: place.latitude || null,
          longitude: place.longitude || null,
        },
        mismatches,
        needsReview,
      };

      // Save verification immediately
      await prisma.report.update({
        where: { id: reportId },
        data: { verification: result as any },
      });

      return result;
    });

    // ---- Step 1c: Fetch map pack competitors ----

    const competitors = await step.run("fetch-competitors", async () => {
      const place = rawData as OutscraperPlace;
      const category = place.category || place.type || null;
      const city = place.city || null;
      const state = place.state || null;

      if (!category || !city) {
        // Can't search competitors without knowing category + location
        await prisma.report.update({
          where: { id: reportId },
          data: { competitors: null as any },
        });
        return null;
      }

      const searchQuery = `${category} ${city}${state ? ` ${state}` : ""}`;

      const results = (await searchPlace(searchQuery, {
        limit: 10,
      })) as OutscraperPlace[];

      // Calculate peer stats (excluding self)
      const selfPlaceId = place.place_id;
      const peers = results.filter((r) => r.place_id !== selfPlaceId);

      const peerRatings = peers
        .map((r) => r.rating)
        .filter((r): r is number => r !== null);

      const peerReviewCounts = peers
        .map((r) => r.reviews)
        .filter((r): r is number => r !== null);

      const sortedCounts = [...peerReviewCounts].sort((a, b) => a - b);
      const median =
        sortedCounts.length > 0
          ? sortedCounts.length % 2 === 0
            ? (sortedCounts[sortedCounts.length / 2 - 1] +
                sortedCounts[sortedCounts.length / 2]) /
              2
            : sortedCounts[Math.floor(sortedCounts.length / 2)]
          : null;

      const selfRank =
        results.findIndex((r) => r.place_id === selfPlaceId) + 1 || null;

      const competitorData = {
        query: searchQuery,
        fetchedAt: new Date().toISOString(),
        results: results.map((r, i) => ({
          name: r.name,
          placeId: r.place_id || null,
          address: r.full_address || null,
          rating: r.rating ?? null,
          reviewCount: r.reviews ?? null,
          category: r.category || null,
          rank: i + 1,
          isSelf: r.place_id === selfPlaceId,
        })),
        selfRank,
        peerAverageRating:
          peerRatings.length > 0
            ? Math.round(
                (peerRatings.reduce((a, b) => a + b, 0) / peerRatings.length) *
                  100,
              ) / 100
            : null,
        peerAverageReviewCount:
          peerReviewCounts.length > 0
            ? Math.round(
                peerReviewCounts.reduce((a, b) => a + b, 0) /
                  peerReviewCounts.length,
              )
            : null,
        peerMedianReviewCount: median,
      };

      await prisma.report.update({
        where: { id: reportId },
        data: { competitors: competitorData as any },
      });

      return competitorData;
    });

    // ---- Step 2: AI Analysis — Visibility Score ----

    await step.run("update-status-analyzing", async () => {
      await prisma.report.update({
        where: { id: reportId },
        data: { status: ReportStatus.ANALYZING },
      });
    });

    const analysisPrompt = buildAnalysisPrompt(rawData, competitors);

    const visibilityResult = await step.run("analyze-visibility", async () => {
      const { object } = await generateObject({
        model: openai("gpt-4o"),
        system: REPORT_SYSTEM_PROMPT,
        prompt: `Analyze the following business data and generate a VISIBILITY score breakdown.\n\n${analysisPrompt}`,
        schema: visibilityBreakdownSchema,
      });
      return object;
    });

    // ---- Step 3: AI Analysis — Reputation Score ----

    const reputationResult = await step.run("analyze-reputation", async () => {
      const { object } = await generateObject({
        model: openai("gpt-4o"),
        system: REPORT_SYSTEM_PROMPT,
        prompt: `Analyze the following business data and generate a REPUTATION score breakdown.\n\n${analysisPrompt}`,
        schema: reputationBreakdownSchema,
      });
      return object;
    });

    // ---- Step 4: AI Analysis — Strengths, Weaknesses, Recommendations ----

    const insightsResult = await step.run("analyze-insights", async () => {
      const insightsPrompt = `Based on the following business data and scores, generate strengths, weaknesses, and actionable recommendations.

BUSINESS DATA:
${analysisPrompt}

VISIBILITY SCORES:
${JSON.stringify(visibilityResult, null, 2)}

REPUTATION SCORES:
${JSON.stringify(reputationResult, null, 2)}`;

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
- Weaknesses must describe something negative or underperforming — never a positive observation.
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

    // ---- Step 5: Calculate totals and save ----

    await step.run("complete-report", async () => {
      const place = rawData as OutscraperPlace;
      const facts = deriveBusinessFacts(place);

      // Pre-compute real facts — never trust AI for these
      const realRating = place.rating ?? null;
      const realReviewCount =
        place.reviews ??
        competitors?.results?.find((c: any) => c.isSelf)?.reviewCount ??
        null;
      const realRecentCount = typedReviewsCount(rawData);

      // Deterministic correction for binary facts
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

      // Overwrite AI-generated factual fields with real data
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

      const filterFalseClaims = <
        T extends { title: string; detail?: string; description?: string },
      >(
        items: T[],
      ): T[] => {
        return items.filter((item) => {
          const text = `${item.title} ${item.detail || ""} ${item.description || ""}`;

          if (facts.hasWebsite && hasFalseMissingClaim(text, "website")) {
            return false;
          }
          if (facts.hasAddress && hasFalseMissingClaim(text, "address")) {
            return false;
          }
          if (facts.hasPhone && hasFalseMissingClaim(text, "phone")) {
            return false;
          }
          if (facts.hasOperatingHours && hasFalseMissingClaim(text, "hours")) {
            return false;
          }
          if (
            facts.hoursStatus === "not_detected" &&
            isOperatingHoursAbsenceClaim(text)
          ) {
            return false;
          }

          return true;
        });
      };

      const filteredStrengths = dedupeInsights(
        filterFalseClaims(insightsResult.strengths),
      );

      const filteredWeaknesses = dedupeInsights(
        filterFalseClaims(insightsResult.weaknesses),
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

      // Keep weakness count aligned with strengths after post-filtering.
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
            w.title.trim().toLowerCase() ===
            weakness.title.trim().toLowerCase(),
        );
        if (!alreadyExists) {
          normalizedWeaknesses.push(weakness);
        }
      }

      const filteredRecommendations = normalizeRecommendations(
        dedupeInsights(filterFalseClaims(insightsResult.recommendations)),
        normalizedWeaknesses,
        correctedVisibility,
        correctedReputation,
        facts,
      );

      await prisma.report.update({
        where: { id: reportId },
        data: {
          status: ReportStatus.COMPLETED,
          visibilityScore,
          reputationScore,
          visibilityBreakdown: correctedVisibility as any,
          reputationBreakdown: correctedReputation as any,
          strengths: filteredStrengths as any,
          weaknesses: normalizedWeaknesses as any,
          recommendations: filteredRecommendations as any,
          completedAt: new Date(),
          error: null,
        },
      });
    });

    return { reportId, status: "completed" };
  },
);

// =============================================
// Review count helper (computed from raw data)
// =============================================

function typedReviewsCount(rawData: any): number | null {
  const reviews = rawData?.reviews_data;
  if (!Array.isArray(reviews)) return null;
  const ninetyDaysAgo = Math.floor(Date.now() / 1000) - 90 * 24 * 60 * 60;
  return reviews.filter(
    (r: any) => r.review_timestamp && r.review_timestamp > ninetyDaysAgo,
  ).length;
}

// =============================================
// Prompt Builder
// =============================================

function buildAnalysisPrompt(rawData: any, competitors: any | null): string {
  const place = rawData;
  const reviews = place.reviews_data || [];
  const typedReviews = reviews as OutscraperReview[];
  const totalGoogleReviews = place.reviews ?? 0;
  const sampleSize = typedReviews.length;

  const reviewsWithText = typedReviews.filter(
    (r) => r.review_text && r.review_text.trim().length > 0,
  ).length;

  const ownerResponses = typedReviews.filter(
    (r) => r.owner_answer && r.owner_answer.trim().length > 0,
  ).length;

  const sampleResponseRate =
    sampleSize > 0 ? Math.round((ownerResponses / sampleSize) * 100) : null;

  const ninetyDaysAgo = Math.floor(Date.now() / 1000) - 90 * 24 * 60 * 60;
  const recentReviews = typedReviews.filter(
    (r) => r.review_timestamp && r.review_timestamp > ninetyDaysAgo,
  ).length;

  const ratingDist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  typedReviews.forEach((r) => {
    const rating = r.review_rating;
    if (rating != null && rating >= 1 && rating <= 5) {
      ratingDist[Math.round(rating)]++;
    }
  });

  const sampleReviews = typedReviews.slice(0, 30).map((r) => ({
    rating: r.review_rating,
    text: r.review_text?.slice(0, 300) || null,
    date: r.review_datetime_utc,
    hasOwnerResponse: !!r.owner_answer,
    ownerResponse: r.owner_answer?.slice(0, 150) || null,
  }));

  const facts = deriveBusinessFacts(place);
  const hasDescription = !!(place.description && place.description.trim());
  const isVerified = place.verified === true;

  const deterministicFacts = {
    hasWebsite: facts.hasWebsite,
    website: facts.website,
    hasAddress: facts.hasAddress,
    address: facts.address,
    hasPhone: facts.hasPhone,
    phone: facts.phone,
    hasOperatingHours: facts.hasOperatingHours,
    hoursStatus: facts.hoursStatus,
  };

  let prompt = `DETERMINISTIC_FACTS (SOURCE OF TRUTH):
${JSON.stringify(deterministicFacts, null, 2)}

BINARY POLICY:
- If a DETERMINISTIC_FACTS boolean is true, it is true.
- If a DETERMINISTIC_FACTS boolean is false, it is false.
- Never contradict DETERMINISTIC_FACTS for website/address/phone.

QUICK FACTS:
- Has website: ${facts.hasWebsite ? "YES — " + facts.website : "NO"}
- Has address: ${facts.hasAddress ? "YES — " + facts.address : "NO"}
- Has phone: ${facts.hasPhone ? "YES — " + facts.phone : "NO"}
- Has operating hours: ${
    facts.hasOperatingHours ? "YES" : "NO / Not detected in source response"
  }
- Has description: ${hasDescription ? "YES" : "NO / Not available in data"}
- Is verified: ${isVerified ? "YES" : "Unknown"}
- Exact Google rating: ${place.rating ?? "No rating"} (use this EXACT value, do not round)
- Total Google reviews: ${totalGoogleReviews}
- Reviews with text (sample): ${reviewsWithText}/${sampleSize}
- Owner responses (sample): ${ownerResponses}/${sampleSize}
- Estimated owner response rate (sample): ${sampleResponseRate === null ? "N/A" : `${sampleResponseRate}%`}

DO NOT claim any DETERMINISTIC_FACTS=YES field is missing.
If a field is unavailable in capture, say "not detected in available data".
If operating hours status is "not_detected", treat it as unknown capture, not proof that hours are missing.

BUSINESS PROFILE:
- Name: ${place.name || "Unknown"}
- Address: ${facts.address || "Not available"}
- Phone: ${facts.phone || "Not listed"}
- Website: ${facts.website || "Not listed"}
- Primary Category: ${place.category || "Not set"}
- All Categories: ${place.subtypes || "Not available"}
- Description: ${place.description || "Not available"}
- Google Rating: ${place.rating ?? "No rating"}
- Total Google Reviews: ${totalGoogleReviews}
- Verified: ${place.verified ?? "Unknown"}
- Photos Count: ${place.photos_count ?? 0}
- Posts Count: ${place.posts_count ?? 0}
- Operating Hours: ${place.working_hours ? JSON.stringify(place.working_hours) : "Not available"}
- Price Range: ${place.price_range || "Not listed"}
- Plus Code: ${place.plus_code || "Not available"}
- Business Status: ${place.business_status || "Not available"}

REVIEW STATISTICS:
- Total reviews on Google: ${totalGoogleReviews}
- Exact Google rating: ${place.rating ?? "No rating"} (do NOT round this value)
- Sample fetched for analysis: ${sampleSize} reviews
- Reviews in last 90 days (from sample): ${recentReviews}
- Rating distribution (from sample): 5★=${ratingDist[5]}, 4★=${ratingDist[4]}, 3★=${ratingDist[3]}, 2★=${ratingDist[2]}, 1★=${ratingDist[1]}

NOTE: The sample is a subset of ${totalGoogleReviews} total reviews. Use total count for volume scoring. Use sample for qualitative estimates only.
NOTE: Owner response rate cannot be reliably measured from the sample. Do NOT penalize for low response rates. Score response rate as 1/2 (baseline) unless you can clearly see a pattern in the sample reviews.

SAMPLE REVIEWS (${sampleReviews.length} of ${totalGoogleReviews} total):
${JSON.stringify(sampleReviews, null, 2)}`;

  if (competitors && competitors.results && competitors.results.length > 0) {
    const peersList = competitors.results
      .filter((c: any) => !c.isSelf)
      .map(
        (c: any) =>
          `  #${c.rank} ${c.name} — Rating: ${c.rating ?? "N/A"}, Reviews: ${c.reviewCount ?? "N/A"}`,
      )
      .join("\n");

    prompt += `

MAP PACK COMPETITORS (searched "${competitors.query}"):
- This business ranks: ${
      competitors.selfRank
        ? `#${competitors.selfRank} of ${competitors.results.length}`
        : "Not found in top results"
    }
- Peer average rating: ${competitors.peerAverageRating ?? "N/A"}
- Peer average review count: ${competitors.peerAverageReviewCount ?? "N/A"}
- Peer median review count: ${competitors.peerMedianReviewCount ?? "N/A"}

COMPETITORS:
${peersList}

Use the competitor data to score RELATIVE performance.
- Review volume (5 pts): Score based on percentile vs peers.
- Average rating (6 pts): Compare against peer average.`;
  }

  return prompt;
}

// =============================================
// Helper utilities
// =============================================

type BusinessFacts = {
  website: string | null;
  address: string | null;
  phone: string | null;
  hasWebsite: boolean;
  hasAddress: boolean;
  hasPhone: boolean;
  hasOperatingHours: boolean;
  hoursStatus: "present" | "not_detected";
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function firstNonEmptyString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed.length > 0) {
        return trimmed;
      }
    }
  }
  return null;
}

function normalizeWebsiteUrl(value: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

function extractOperatingHours(place: Record<string, unknown>): string | null {
  const directHours = place.working_hours;
  if (
    directHours &&
    typeof directHours === "object" &&
    !Array.isArray(directHours) &&
    Object.keys(directHours).length > 0
  ) {
    return JSON.stringify(directHours);
  }

  const csvHours = firstNonEmptyString(
    place.working_hours_csv_compatible,
    place.hours,
    place.business_hours,
  );
  if (csvHours) return csvHours;

  return null;
}

function deriveBusinessFacts(rawData: unknown): BusinessFacts {
  const place = asRecord(rawData) ?? {};
  const links = asRecord(place.links);
  const contact = asRecord(place.contact);
  const location = asRecord(place.location);

  const website = normalizeWebsiteUrl(
    firstNonEmptyString(
      place.site,
      place.website,
      place.url,
      place.business_website,
      links?.website,
      links?.site,
    ),
  );

  const address = firstNonEmptyString(
    place.full_address,
    place.formatted_address,
    place.address,
    location?.address,
  );

  const phone = firstNonEmptyString(
    place.phone,
    place.phone_number,
    place.formatted_phone_number,
    contact?.phone,
  );

  const operatingHours = extractOperatingHours(place);

  return {
    website,
    address,
    phone,
    hasWebsite: Boolean(website),
    hasAddress: Boolean(address),
    hasPhone: Boolean(phone),
    hasOperatingHours: Boolean(operatingHours),
    hoursStatus: operatingHours ? "present" : "not_detected",
  };
}

function hasFalseMissingClaim(
  text: string,
  noun: "website" | "address" | "phone" | "hours",
): boolean {
  const normalized = text.replace(/\s+/g, " ").toLowerCase();
  const nounPattern = noun === "hours" ? "(?:operating\\s+)?hours" : noun;
  const regex = new RegExp(
    `\\b(no|not listed|not available|missing|without|lacks?|lack of)\\b[^.]{0,40}\\b${nounPattern}\\b`,
    "i",
  );
  return regex.test(normalized);
}

function isOperatingHoursAbsenceClaim(text: string): boolean {
  const normalized = text.replace(/\s+/g, " ").toLowerCase();
  const forward =
    /\b(no|not listed|not available|missing|without|lacks?|not detected)\b[^.]{0,45}\b(operating hours|business hours|hours)\b/i;
  const reverse =
    /\b(operating hours|business hours|hours)\b[^.]{0,45}\b(no|not listed|not available|missing|without|lacks?|not detected)\b/i;
  return forward.test(normalized) || reverse.test(normalized);
}

function toSingleIssueDetail(detail: string): string {
  const cleaned = detail.replace(/\s+/g, " ").trim();
  if (!cleaned) return detail;
  const firstSentence = cleaned.match(/^.+?[.!?](?=\s|$)/)?.[0] ?? cleaned;
  return firstSentence.replace(/[;:]\s.*$/, "").trim();
}

function dedupeInsights<
  T extends { title: string; detail?: string; description?: string },
>(items: T[]): T[] {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = `${item.title}|${item.detail || ""}|${item.description || ""}`
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();

    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

type InsightCategory =
  | "gbp"
  | "reviews"
  | "website"
  | "links"
  | "citations"
  | "social"
  | "overall";

type RecommendationItem = {
  title: string;
  description: string;
  category: InsightCategory;
  priority: "high" | "medium" | "low";
  impact: "high" | "medium" | "low";
  effort: "high" | "medium" | "low";
  steps: string[];
};

function insightFingerprint(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isStrengthLeakingIntoWeakness(
  weakness: { title: string; detail: string },
  strengths: Array<{ title: string; detail: string }>,
): boolean {
  const weakText = `${weakness.title} ${weakness.detail}`.toLowerCase();

  // Check 1: Is this just a positive statement with no negative signal?
  const negativeSignals =
    /\b(low|weak|limited|underperform|missing|lack|not detected|inconsistent|declin|poor|below|few|minimal|slow|drop|gap)\b/i;
  if (!negativeSignals.test(weakText)) return true;

  // Check 2: Does it substantially overlap with a strength?
  for (const s of strengths) {
    const strongText = `${s.title} ${s.detail}`.toLowerCase();
    const weakWords = new Set(
      weakText.split(/\s+/).filter((w) => w.length > 3),
    );
    const overlapCount = Array.from(weakWords).filter((w) =>
      strongText.includes(w),
    ).length;
    if (weakWords.size > 0 && overlapCount / weakWords.size > 0.6) return true;
  }

  return false;
}

function startsWithActionVerb(text: string): boolean {
  return /^(audit|fix|improve|increase|optimize|update|standardize|publish|implement|build|launch|create|request|respond|verify|add|expand|claim|monitor)\b/i.test(
    text.trim(),
  );
}

function isObservationStyleRecommendation(rec: RecommendationItem): boolean {
  const title = rec.title.trim();
  const description = rec.description.trim();
  const combined = `${title} ${description}`;

  if (/^(high|strong|positive|excellent|comprehensive)\b/i.test(title)) {
    return true;
  }

  if (/^(the business|business)\b/i.test(description)) {
    return true;
  }

  const hasPositiveTone =
    /\b(strong|high|excellent|positive|good|great|trusted|comprehensive|solid|satisfaction|well rated)\b/i.test(
      combined,
    );
  const hasNegativeSignal =
    /\b(low|weak|limited|underperform|missing|lack|not detected|inconsistent|declin|poor|opportunity|gap|below)\b/i.test(
      combined,
    );

  return hasPositiveTone && !hasNegativeSignal && !startsWithActionVerb(title);
}

function buildFallbackRecommendations(
  weaknesses: Array<{
    title: string;
    detail: string;
    category: InsightCategory;
  }>,
  visibility: any,
): RecommendationItem[] {
  const fallbacks: RecommendationItem[] = [];
  const weaknessCategories = new Set(weaknesses.map((w) => w.category));

  if (weaknessCategories.has("gbp") || (visibility?.gbp?.score ?? 0) < 24) {
    fallbacks.push({
      title: "Improve GBP completeness and freshness",
      description:
        "Tighten core Google Business Profile fields and publishing cadence to improve discoverability and conversion readiness.",
      category: "gbp",
      priority: "high",
      impact: "high",
      effort: "medium",
      steps: [
        "Audit core GBP fields (category, services, attributes, products) and correct inconsistencies.",
        "Verify business hours and holiday hours directly in GBP, then recheck public listing output.",
        "Publish a weekly post/photo update cadence to strengthen activity signals.",
      ],
    });
  }

  if (
    weaknessCategories.has("reviews") ||
    (visibility?.reviews?.recencyVelocity ?? 0) < 3
  ) {
    fallbacks.push({
      title: "Increase recent Google review velocity",
      description:
        "Create a consistent process to collect fresh reviews and respond quickly to reinforce trust and ranking signals.",
      category: "reviews",
      priority: "high",
      impact: "high",
      effort: "medium",
      steps: [
        "Trigger a review request via SMS/email within 24 hours of each completed service.",
        "Give staff a direct review link and script to request reviews in person at checkout.",
        "Respond to all new reviews within 72 hours and track weekly response coverage.",
      ],
    });
  }

  if (
    weaknessCategories.has("website") ||
    (visibility?.website?.score ?? 0) < 8
  ) {
    fallbacks.push({
      title: "Strengthen local website conversion signals",
      description:
        "Improve local landing page clarity and trust elements so traffic from map searches converts at a higher rate.",
      category: "website",
      priority: "high",
      impact: "high",
      effort: "medium",
      steps: [
        "Create or optimize city/service pages with unique copy, service details, and clear local intent.",
        "Add above-the-fold trust blocks (reviews, certifications, guarantees) plus click-to-call and booking CTAs.",
        "Ensure NAP details on the site exactly match Google Business Profile and major citations.",
      ],
    });
  }

  if (weaknessCategories.has("links") || (visibility?.links?.score ?? 0) < 4) {
    fallbacks.push({
      title: "Build local authority through citation and link campaigns",
      description:
        "Improve local prominence by increasing high-quality local references and consistent citations.",
      category: "links",
      priority: "medium",
      impact: "high",
      effort: "medium",
      steps: [
        "Submit/clean up top local directories with consistent NAP and category alignment.",
        "Acquire monthly local backlinks via partnerships, sponsorships, and chamber/community listings.",
        "Track citation/link growth and resolve duplicates or inconsistencies each month.",
      ],
    });
  }

  if (
    weaknessCategories.has("social") ||
    (visibility?.social?.score ?? 0) < 2
  ) {
    fallbacks.push({
      title: "Expand social proof and local engagement",
      description:
        "Increase brand visibility signals by activating core social profiles with consistent local content.",
      category: "social",
      priority: "medium",
      impact: "medium",
      effort: "medium",
      steps: [
        "Fully complete top social profiles with matching NAP, services, and booking links.",
        "Post weekly before/after jobs, customer wins, or service tips tied to local intent.",
        "Repurpose top Google reviews into social proof posts and stories each week.",
      ],
    });
  }

  if (fallbacks.length === 0) {
    fallbacks.push(
      {
        title: "Improve profile completeness and local consistency",
        description:
          "Reduce ranking friction by tightening listing completeness, consistency, and maintenance cadence.",
        category: "overall",
        priority: "high",
        impact: "high",
        effort: "medium",
        steps: [
          "Run a monthly profile and citation audit to fix any data inconsistencies.",
          "Refresh key listing and website content weekly to maintain activity signals.",
          "Track local ranking and conversion metrics to prioritize next improvements.",
        ],
      },
      {
        title: "Increase demand capture from local search traffic",
        description:
          "Convert more local visibility into calls and bookings with targeted conversion improvements.",
        category: "overall",
        priority: "medium",
        impact: "high",
        effort: "medium",
        steps: [
          "Add clear phone and booking CTAs across high-intent listing and site touchpoints.",
          "Use location-specific offers or service bundles to improve inquiry rate.",
          "Review call/book conversion weekly and optimize the lowest-performing pages.",
        ],
      },
    );
  }

  return dedupeInsights(fallbacks);
}

function normalizeRecommendations(
  aiRecommendations: RecommendationItem[],
  weaknesses: Array<{
    title: string;
    detail: string;
    category: InsightCategory;
  }>,
  visibility: any,
  _reputation: any,
  facts: BusinessFacts,
): RecommendationItem[] {
  const weaknessCategories = new Set(weaknesses.map((w) => w.category));

  const safeAi = aiRecommendations
    .map((rec) => ({
      ...rec,
      title: rec.title.trim(),
      description: rec.description.trim(),
      steps: rec.steps
        .map((step) => step.trim())
        .filter(Boolean)
        .slice(0, 3),
    }))
    .filter((rec) => rec.steps.length >= 2)
    .filter((rec) => !isObservationStyleRecommendation(rec))
    .filter((rec) => startsWithActionVerb(rec.title))
    .filter(
      (rec) =>
        weaknessCategories.size === 0 ||
        weaknessCategories.has(rec.category) ||
        rec.category === "overall",
    )
    .filter((rec) => {
      const text = `${rec.title} ${rec.description} ${rec.steps.join(" ")}`;
      if (facts.hasWebsite && hasFalseMissingClaim(text, "website"))
        return false;
      if (facts.hasAddress && hasFalseMissingClaim(text, "address"))
        return false;
      if (facts.hasPhone && hasFalseMissingClaim(text, "phone")) return false;
      if (
        facts.hoursStatus === "not_detected" &&
        isOperatingHoursAbsenceClaim(text)
      ) {
        return false;
      }
      return true;
    });

  const output: RecommendationItem[] = [];
  for (const rec of safeAi) {
    if (output.length >= 2) break;
    output.push(rec);
  }

  if (output.length < 2) {
    const fallback = buildFallbackRecommendations(weaknesses, visibility);
    for (const rec of fallback) {
      if (output.length >= 2) break;
      const exists = output.some(
        (r) =>
          insightFingerprint(`${r.title} ${r.description}`) ===
          insightFingerprint(`${rec.title} ${rec.description}`),
      );
      if (!exists) {
        output.push(rec);
      }
    }
  }

  return output.slice(0, 2);
}

function buildFallbackWeaknesses(
  visibility: any,
  reputation: any,
  facts: BusinessFacts,
): Array<{
  title: string;
  detail: string;
  category: InsightCategory;
}> {
  const fallbacks: Array<{
    title: string;
    detail: string;
    category: InsightCategory;
  }> = [];

  if (!facts.hasWebsite) {
    fallbacks.push({
      title: "Website not detected in available data",
      detail:
        "No website URL was detected in the current business data, which can limit local visibility and conversion opportunities.",
      category: "website",
    });
  } else if ((visibility?.website?.score ?? 0) < 8) {
    fallbacks.push({
      title: "Website signal is below competitive baseline",
      detail: `Website score is ${visibility.website.score}/15, indicating room to improve website quality signals that influence local pack performance.`,
      category: "website",
    });
  }

  if ((visibility?.reviews?.recencyVelocity ?? 0) < 3) {
    fallbacks.push({
      title: "Recent review momentum is limited",
      detail: `Reviews recency/velocity scored ${visibility.reviews.recencyVelocity}/5, suggesting weaker recent review growth versus stronger local competitors.`,
      category: "reviews",
    });
  }

  if ((visibility?.social?.score ?? 0) < 2) {
    fallbacks.push({
      title: "Social presence signal is weak",
      detail: `Social signal scored ${visibility.social.score}/4, indicating low detectable social platform visibility in current data.`,
      category: "social",
    });
  }

  if ((reputation?.googleReviews?.score ?? 0) < 70) {
    fallbacks.push({
      title: "Google review reputation score is underperforming",
      detail: `Google Reviews reputation scored ${reputation.googleReviews.score}/90, showing measurable headroom in rating consistency, freshness, or sentiment quality.`,
      category: "reviews",
    });
  }

  if ((visibility?.links?.score ?? 0) < 4) {
    fallbacks.push({
      title: "Authority signals from links are modest",
      detail: `Links scored ${visibility.links.score}/8, indicating limited authority signal compared with stronger local market profiles.`,
      category: "links",
    });
  }

  return fallbacks;
}

// =============================================
// String normalization for address comparison
// =============================================

function normalize(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[.,#\-\/\\]/g, " ") // Remove punctuation
    .replace(/\bstreet\b/g, "st")
    .replace(/\bavenue\b/g, "ave")
    .replace(/\bboulevard\b/g, "blvd")
    .replace(/\bdrive\b/g, "dr")
    .replace(/\broad\b/g, "rd")
    .replace(/\blane\b/g, "ln")
    .replace(/\bcourt\b/g, "ct")
    .replace(/\bsuite\b/g, "ste")
    .replace(/\bapartment\b/g, "apt")
    .replace(/\s+/g, " "); // Collapse whitespace
}

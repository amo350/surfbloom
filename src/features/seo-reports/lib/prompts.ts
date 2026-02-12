import type { OutscraperReview } from "@/lib/outscraper";
import { deriveBusinessFacts } from "./helpers";

export type AnalysisReview = {
  rating: number;
  text: string | null;
  publishedAt: Date | string | null;
  ownerResponse: string | null;
};

export const REPORT_SYSTEM_PROMPT = `You are a senior local SEO analyst.

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

function normalizeReviews(
  rawData: any,
  reviews: AnalysisReview[] | undefined,
): AnalysisReview[] {
  if (Array.isArray(reviews)) {
    return reviews;
  }

  const rawReviews = (rawData?.reviews_data || []) as OutscraperReview[];
  return rawReviews.map((r) => ({
    rating: r.review_rating ?? 0,
    text: r.review_text || null,
    publishedAt: r.review_datetime_utc ? new Date(r.review_datetime_utc) : null,
    ownerResponse: r.owner_answer || null,
  }));
}

function normalizeCompetitors(competitors: any): any[] {
  if (!competitors) return [];

  if (Array.isArray(competitors)) {
    return competitors;
  }

  if (Array.isArray(competitors.results)) {
    return competitors.results.map((r: any) => ({
      place_id: r.placeId || r.place_id || null,
      name: r.name,
      full_address: r.address || r.full_address || null,
      rating: r.rating ?? null,
      reviews: r.reviewCount ?? r.reviews ?? null,
      category: r.category || null,
    }));
  }

  return [];
}

export function buildAnalysisPrompt(
  place: any,
  competitors: any[] | null,
  reviews: AnalysisReview[],
): string {
  const normalizedReviews = normalizeReviews(place, reviews);
  const totalGoogleReviews = place.reviews ?? normalizedReviews.length;
  const sampleSize = normalizedReviews.length;

  const reviewsWithText = normalizedReviews.filter(
    (r) => r.text && r.text.trim().length > 0,
  ).length;

  const ownerResponses = normalizedReviews.filter(
    (r) => r.ownerResponse && r.ownerResponse.trim().length > 0,
  ).length;

  const sampleResponseRate =
    sampleSize > 0 ? Math.round((ownerResponses / sampleSize) * 100) : null;

  const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
  const recentReviews = normalizedReviews.filter(
    (r) => r.publishedAt && new Date(r.publishedAt).getTime() > ninetyDaysAgo,
  ).length;

  const ratingDist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  normalizedReviews.forEach((r) => {
    const rating = r.rating;
    if (rating != null && rating >= 1 && rating <= 5) {
      ratingDist[Math.round(rating)]++;
    }
  });

  const sampleReviews = normalizedReviews.slice(0, 30).map((r) => ({
    rating: r.rating,
    text: r.text?.slice(0, 300) || null,
    date: r.publishedAt ? new Date(r.publishedAt).toISOString() : null,
    hasOwnerResponse: !!r.ownerResponse,
    ownerResponse: r.ownerResponse?.slice(0, 150) || null,
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

  const rawCompetitors = normalizeCompetitors(competitors);

  if (rawCompetitors.length > 0) {
    const selfPlaceId = place.place_id;
    const peers = rawCompetitors.filter((c: any) => c.place_id !== selfPlaceId);

    const peerRatings = peers
      .map((r: any) => r.rating)
      .filter((r: number | null): r is number => r !== null);

    const peerReviewCounts = peers
      .map((r: any) => r.reviews)
      .filter((r: number | null): r is number => r !== null);

    const selfRank =
      rawCompetitors.findIndex((r: any) => r.place_id === selfPlaceId) + 1 ||
      null;

    const peerAvgRating =
      peerRatings.length > 0
        ? Math.round(
            (peerRatings.reduce((a, b) => a + b, 0) / peerRatings.length) * 100,
          ) / 100
        : null;

    const peerAvgReviews =
      peerReviewCounts.length > 0
        ? Math.round(
            peerReviewCounts.reduce((a, b) => a + b, 0) /
              peerReviewCounts.length,
          )
        : null;

    const peersList = peers
      .map(
        (c: any, i: number) =>
          `  #${i + 1} ${c.name} — Rating: ${c.rating ?? "N/A"}, Reviews: ${c.reviews ?? "N/A"}`,
      )
      .join("\n");

    prompt += `\n\nMAP PACK COMPETITORS:
- This business ranks: ${selfRank ? `#${selfRank} of ${rawCompetitors.length}` : "Not found in top results"}
- Peer average rating: ${peerAvgRating ?? "N/A"}
- Peer average review count: ${peerAvgReviews ?? "N/A"}

COMPETITORS:
${peersList}

Use the competitor data to score RELATIVE performance.
- Review volume (5 pts): Score based on percentile vs peers.
- Average rating (6 pts): Compare against peer average.`;
  }

  return prompt;
}

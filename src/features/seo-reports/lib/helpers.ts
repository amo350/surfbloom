import type { OutscraperPlace } from "@/lib/outscraper";

export type BusinessFacts = {
  website: string | null;
  address: string | null;
  phone: string | null;
  hasWebsite: boolean;
  hasAddress: boolean;
  hasPhone: boolean;
  hasOperatingHours: boolean;
  hoursStatus: "present" | "not_detected";
};

export type InsightCategory =
  | "gbp"
  | "reviews"
  | "website"
  | "links"
  | "citations"
  | "social"
  | "overall";

export type RecommendationItem = {
  title: string;
  description: string;
  category: InsightCategory;
  priority: "high" | "medium" | "low";
  impact: "high" | "medium" | "low";
  effort: "high" | "medium" | "low";
  steps: string[];
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

export function deriveBusinessFacts(rawData: unknown): BusinessFacts {
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

export function hasFalseMissingClaim(
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

export function isOperatingHoursAbsenceClaim(text: string): boolean {
  const normalized = text.replace(/\s+/g, " ").toLowerCase();
  const forward =
    /\b(no|not listed|not available|missing|without|lacks?|not detected)\b[^.]{0,45}\b(operating hours|business hours|hours)\b/i;
  const reverse =
    /\b(operating hours|business hours|hours)\b[^.]{0,45}\b(no|not listed|not available|missing|without|lacks?|not detected)\b/i;
  return forward.test(normalized) || reverse.test(normalized);
}

export function normalize(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[.,#\-\/\\]/g, " ")
    .replace(/\bstreet\b/g, "st")
    .replace(/\bavenue\b/g, "ave")
    .replace(/\bboulevard\b/g, "blvd")
    .replace(/\bdrive\b/g, "dr")
    .replace(/\broad\b/g, "rd")
    .replace(/\blane\b/g, "ln")
    .replace(/\bcourt\b/g, "ct")
    .replace(/\bsuite\b/g, "ste")
    .replace(/\bapartment\b/g, "apt")
    .replace(/\s+/g, " ");
}

export function recentReviewCount(
  rawData: any,
  reviews?: Array<{ publishedAt: Date | string | null }>,
): number | null {
  if (Array.isArray(reviews)) {
    const threshold = Date.now() - 90 * 24 * 60 * 60 * 1000;
    return reviews.filter(
      (r) => r.publishedAt && new Date(r.publishedAt).getTime() > threshold,
    ).length;
  }

  const rawReviews = rawData?.reviews_data;
  if (!Array.isArray(rawReviews)) return null;

  const ninetyDaysAgo = Math.floor(Date.now() / 1000) - 90 * 24 * 60 * 60;
  return rawReviews.filter(
    (r: any) => r.review_timestamp && r.review_timestamp > ninetyDaysAgo,
  ).length;
}

export function filterFalseClaims<
  T extends { title: string; detail?: string; description?: string },
>(items: T[], placeOrFacts: unknown): T[] {
  const facts = (() => {
    const record = asRecord(placeOrFacts);
    if (
      record &&
      typeof record.hasWebsite === "boolean" &&
      typeof record.hasAddress === "boolean" &&
      typeof record.hasPhone === "boolean" &&
      typeof record.hasOperatingHours === "boolean" &&
      (record.hoursStatus === "present" ||
        record.hoursStatus === "not_detected")
    ) {
      return record as BusinessFacts;
    }
    return deriveBusinessFacts(placeOrFacts);
  })();

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
}

export function toSingleIssueDetail(detail: string): string {
  const cleaned = detail.replace(/\s+/g, " ").trim();
  if (!cleaned) return detail;
  const firstSentence = cleaned.match(/^.+?[.!?](?=\s|$)/)?.[0] ?? cleaned;
  return firstSentence.replace(/[;:]\s.*$/, "").trim();
}

export function dedupeInsights<
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

function insightFingerprint(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function isStrengthLeakingIntoWeakness(
  weakness: { title: string; detail: string },
  strengths: Array<{ title: string; detail: string }>,
): boolean {
  const weakText = `${weakness.title} ${weakness.detail}`.toLowerCase();

  const negativeSignals =
    /\b(low|weak|limited|underperform|missing|lack|not detected|inconsistent|declin|poor|below|few|minimal|slow|drop|gap)\b/i;
  if (!negativeSignals.test(weakText)) return true;

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

export function normalizeRecommendations(
  aiRecommendations: RecommendationItem[],
  weaknesses: Array<{
    title: string;
    detail: string;
    category: InsightCategory;
  }>,
  visibility: any,
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

export function buildFallbackWeaknesses(
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

export function buildCompetitorJson(place: any, competitors: any[]) {
  const selfPlaceId = place.place_id;
  const peers = competitors.filter((c: any) => c.place_id !== selfPlaceId);

  const peerRatings = peers
    .map((r: any) => r.rating)
    .filter((r: number | null): r is number => r !== null);

  const peerReviewCounts = peers
    .map((r: any) => r.reviews)
    .filter((r: number | null): r is number => r !== null);

  const sortedCounts = [...peerReviewCounts].sort((a, b) => a - b);
  const median =
    sortedCounts.length > 0
      ? sortedCounts.length % 2 === 0
        ? (sortedCounts[sortedCounts.length / 2 - 1] +
            sortedCounts[sortedCounts.length / 2]) /
          2
        : sortedCounts[Math.floor(sortedCounts.length / 2)]
      : null;

  return {
    query: `${place.category || place.type || ""} ${place.city || ""}`.trim(),
    fetchedAt: new Date().toISOString(),
    results: competitors.map((r: any, i: number) => ({
      name: r.name,
      placeId: r.place_id || null,
      address: r.full_address || null,
      rating: r.rating ?? null,
      reviewCount: r.reviews ?? null,
      category: r.category || null,
      rank: i + 1,
      isSelf: r.place_id === selfPlaceId,
    })),
    selfRank:
      competitors.findIndex((r: any) => r.place_id === selfPlaceId) + 1 || null,
    peerAverageRating:
      peerRatings.length > 0
        ? Math.round(
            (peerRatings.reduce((a, b) => a + b, 0) / peerRatings.length) * 100,
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
}

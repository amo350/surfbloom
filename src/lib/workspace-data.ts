import { createId } from "@paralleldrive/cuid2";
import {
  type OutscraperPlace,
  type OutscraperReview,
  searchPlace,
  searchPlaceWithReviews,
} from "@/lib/outscraper";
import { prisma } from "@/lib/prisma";

const STALE_AFTER_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// =============================================
// Types
// =============================================

interface CachedWorkspaceData {
  place: OutscraperPlace;
  competitors: OutscraperPlace[];
  fromCache: boolean;
}

// =============================================
// Main entry point
// =============================================

export async function getWorkspaceData(
  workspaceId: string,
  options?: {
    forceRefresh?: boolean;
    query?: string;
    reviewsLimit?: number;
  },
): Promise<CachedWorkspaceData> {
  const workspace = await prisma.workspace.findUniqueOrThrow({
    where: { id: workspaceId },
  });

  const now = Date.now();
  const lastScraped = workspace.lastScrapedAt?.getTime() ?? 0;
  const isStale = now - lastScraped > STALE_AFTER_MS;
  const hasData = !!workspace.scrapedPlaceData;

  // ---- Return cached data if fresh ----
  if (hasData && !isStale && !options?.forceRefresh) {
    return {
      place: workspace.scrapedPlaceData as unknown as OutscraperPlace,
      competitors:
        (workspace.scrapedCompetitors as unknown as OutscraperPlace[]) ?? [],
      fromCache: true,
    };
  }

  // ---- Fetch fresh data from Outscraper ----
  const query = options?.query ?? buildWorkspaceQuery(workspace);

  const place = await searchPlaceWithReviews(query, {
    reviewsLimit: options?.reviewsLimit ?? 200,
  });

  if (!place) {
    throw new Error(`No business found for "${query}"`);
  }

  // ---- Fetch competitors ----
  const category = place.category || place.type || null;
  const city = place.city || null;
  const state = place.state || null;
  let competitorResults: OutscraperPlace[] = [];

  if (category && city) {
    const searchQuery = `${category} ${city}${state ? ` ${state}` : ""}`;
    competitorResults = await searchPlace(searchQuery, { limit: 10 });
  }

  // ---- Upsert reviews into Review table ----
  await upsertReviews(workspaceId, place.reviews_data ?? []);

  // ---- Cache place data + competitors on workspace ----
  await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      // Cache the Outscraper responses (minus reviews — those are in the table now)
      scrapedPlaceData: stripReviewsFromPlace(place) as any,
      scrapedCompetitors: competitorResults as any,
      lastScrapedAt: new Date(),

      // Always update GBP metadata
      googlePlaceId: place.place_id || undefined,
      primaryCategory: place.category || undefined,
      secondaryCategories: place.subtypes
        ? place.subtypes.split(", ").filter(Boolean)
        : [],
      googleRating: place.rating || undefined,
      googleReviewCount: place.reviews || undefined,

      // Only backfill empty address fields (preserve user-entered data)
      ...(!workspace.address && {
        address: place.full_address || undefined,
      }),
      ...(!workspace.city && { city: place.city || undefined }),
      ...(!workspace.state && { state: place.state || undefined }),
      ...(!workspace.zipCode && {
        zipCode: place.postal_code || undefined,
      }),
      ...(!workspace.country && {
        country: place.country_code || "US",
      }),
      ...(!workspace.phone && { phone: place.phone || undefined }),
      ...(!workspace.website && { website: place.site || undefined }),
      ...(!workspace.latitude && {
        latitude: place.latitude || undefined,
      }),
      ...(!workspace.longitude && {
        longitude: place.longitude || undefined,
      }),
      ...(!workspace.timezone && {
        timezone: place.time_zone || undefined,
      }),
    },
  });

  return {
    place,
    competitors: competitorResults,
    fromCache: false,
  };
}

// =============================================
// Review upsert — dedup by googleReviewId
// =============================================

async function upsertReviews(workspaceId: string, reviews: OutscraperReview[]) {
  if (!reviews.length) return;

  const reviewsWithIds = reviews.filter((r) => r.review_link || r.autor_id);
  if (!reviewsWithIds.length) return;

  const values = reviewsWithIds.map((r) => {
    const googleReviewId =
      r.review_link || `${r.autor_id}_${r.review_timestamp}`;
    const publishedAt = r.review_datetime_utc
      ? new Date(r.review_datetime_utc)
      : null;
    const ownerRespondedAt = r.owner_answer_timestamp
      ? new Date(r.owner_answer_timestamp * 1000)
      : null;

    return {
      id: createId(),
      workspaceId,
      googleReviewId,
      authorName: r.autor_name || null,
      authorUrl: r.autor_link || null,
      authorImageUrl: r.autor_image || null,
      rating: r.review_rating ?? 0,
      text: r.review_text || null,
      publishedAt,
      ownerResponse: r.owner_answer || null,
      ownerRespondedAt,
    };
  });

  // Single batch round trip instead of N upserts across network.
  await prisma.$executeRawUnsafe(
    `
    INSERT INTO "review" (
      "id", "workspaceId", "googleReviewId",
      "authorName", "authorUrl", "authorImageUrl",
      "rating", "text", "publishedAt",
      "ownerResponse", "ownerRespondedAt",
      "source", "language", "firstSeenAt", "lastSyncedAt"
    )
    SELECT
      v."id",
      v."workspaceId", v."googleReviewId",
      v."authorName", v."authorUrl", v."authorImageUrl",
      v."rating", v."text", v."publishedAt",
      v."ownerResponse", v."ownerRespondedAt",
      'google', NULL, NOW(), NOW()
    FROM jsonb_to_recordset($1::jsonb) AS v(
      "id" TEXT,
      "workspaceId" TEXT,
      "googleReviewId" TEXT,
      "authorName" TEXT,
      "authorUrl" TEXT,
      "authorImageUrl" TEXT,
      "rating" DOUBLE PRECISION,
      "text" TEXT,
      "publishedAt" TIMESTAMPTZ,
      "ownerResponse" TEXT,
      "ownerRespondedAt" TIMESTAMPTZ
    )
    ON CONFLICT ("workspaceId", "googleReviewId") DO UPDATE SET
      "ownerResponse" = EXCLUDED."ownerResponse",
      "ownerRespondedAt" = EXCLUDED."ownerRespondedAt",
      "lastSyncedAt" = NOW()
    `,
    JSON.stringify(values),
  );
}

// =============================================
// Helpers
// =============================================

function buildWorkspaceQuery(workspace: {
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
}): string {
  const parts = [workspace.name];
  if (workspace.address) parts.push(workspace.address);
  if (workspace.city) parts.push(workspace.city);
  if (workspace.state) parts.push(workspace.state);
  return parts.join(", ");
}

/** Strip reviews_data from the cached place JSON to avoid bloat.
 *  Reviews live in the Review table now. */
export function stripReviewsFromPlace(
  place: OutscraperPlace,
): Omit<OutscraperPlace, "reviews_data"> {
  const { reviews_data, ...rest } = place;
  return rest;
}

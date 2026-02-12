const BASE_URL = "https://api.app.outscraper.com";

// =============================================
// Types
// =============================================

export interface OutscraperPlace {
  name: string;
  google_id: string;
  place_id: string;
  full_address: string;
  borough: string | null;
  street: string | null;
  city: string | null;
  postal_code: string | null;
  state: string | null;
  country_code: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  time_zone: string | null;
  site: string | null;
  phone: string | null;
  type: string | null;
  category: string | null;
  subtypes: string | null;
  rating: number | null;
  reviews: number | null;
  photos_count: number | null;
  posts_count: number | null;
  verified: boolean | null;
  owner_title: string | null;
  owner_id: string | null;
  reviews_data: OutscraperReview[] | null;
  website?: string | null;
  description?: string | null;
  working_hours?: Record<string, unknown> | null;
  working_hours_csv_compatible?: string | null;
  price_range?: string | null;
  plus_code?: string | null;
  business_status?: string | null;
  links?: Record<string, unknown> | null;
  contact?: Record<string, unknown> | null;
  location?: Record<string, unknown> | null;
}

export interface OutscraperReview {
  autor_name: string | null;
  autor_id: string | null;
  autor_link: string | null;
  autor_image: string | null;
  review_text: string | null;
  review_link: string | null;
  review_rating: number | null;
  review_timestamp: number | null;
  review_datetime_utc: string | null;
  review_likes: number | null;
  owner_answer: string | null;
  owner_answer_timestamp: number | null;
  owner_answer_timestamp_datetime_utc: string | null;
}

// =============================================
// Runtime API key
// =============================================

function getApiKey(): string {
  const key = process.env.OUTSCRAPER_API_KEY;
  if (!key) {
    throw new Error("OUTSCRAPER_API_KEY is not set");
  }
  return key;
}

// =============================================
// Response parser
//
// Outscraper returns different shapes depending
// on the endpoint and version:
//   - [[place1, place2]]   (nested array)
//   - [place1, place2]     (flat array)
//   - { data: [[...]] }    (wrapped nested)
//   - { data: [...] }      (wrapped flat)
//   - { results: [...] }   (alternate wrapper)
//
// This normalizes all of them to a flat array.
// =============================================

function extractResults(raw: unknown): OutscraperPlace[] {
  // Unwrap wrapper objects
  let data = raw;

  if (data && typeof data === "object" && !Array.isArray(data)) {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.data)) {
      data = obj.data;
    } else if (Array.isArray(obj.results)) {
      data = obj.results;
    } else {
      // Unknown object shape — log and bail
      console.error(
        "[outscraper] Unknown response shape:",
        JSON.stringify(data).slice(0, 500),
      );
      return [];
    }
  }

  if (!Array.isArray(data)) {
    console.error(
      "[outscraper] Expected array, got:",
      typeof data,
      JSON.stringify(data).slice(0, 300),
    );
    return [];
  }

  // If nested array [[place1, place2]], flatten one level
  if (data.length > 0 && Array.isArray(data[0])) {
    return data.flat() as OutscraperPlace[];
  }

  // Already a flat array [place1, place2]
  return data as OutscraperPlace[];
}

// =============================================
// Core fetch helper
// =============================================

async function outscraperFetch(
  endpoint: string,
  params: Record<string, string | number | boolean>,
): Promise<OutscraperPlace[]> {
  const url = new URL(`${BASE_URL}${endpoint}`);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  const response = await fetch(url.toString(), {
    headers: {
      "X-API-KEY": getApiKey(),
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Outscraper API error: ${response.status} ${response.statusText}${text ? `: ${text}` : ""}`,
    );
  }

  const raw = await response.json();
  return extractResults(raw);
}

// =============================================
// Place Search — find a business by query
// =============================================

export async function searchPlace(
  query: string,
  options?: { limit?: number; language?: string },
): Promise<OutscraperPlace[]> {
  return outscraperFetch("/maps/search-v3", {
    query,
    limit: options?.limit ?? 1,
    language: options?.language ?? "en",
    async: false,
  });
}

// =============================================
// Reviews — get reviews for a specific place
// =============================================

export async function getReviews(
  placeId: string,
  options?: {
    reviewsLimit?: number;
    sort?: "newest" | "most_relevant" | "highest_rating" | "lowest_rating";
    cutoff?: number;
    language?: string;
    ignoreEmpty?: boolean;
  },
): Promise<OutscraperPlace[]> {
  return outscraperFetch("/maps/reviews-v3", {
    query: placeId,
    reviewsLimit: options?.reviewsLimit ?? 100,
    sort: options?.sort ?? "newest",
    language: options?.language ?? "en",
    ignoreEmpty: options?.ignoreEmpty ?? true,
    async: false,
    ...(options?.cutoff ? { cutoff: options.cutoff } : {}),
  });
}

// =============================================
// Combined — search then fetch reviews
// =============================================

function isEffectivelyEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
}

function mergePlaceData(
  searchResult: OutscraperPlace,
  reviewResult: OutscraperPlace,
): OutscraperPlace {
  const searchRecord = searchResult as unknown as Record<string, unknown>;
  const reviewRecord = reviewResult as unknown as Record<string, unknown>;
  const merged: Record<string, unknown> = {
    ...searchRecord,
    ...reviewRecord,
  };

  for (const [key, searchValue] of Object.entries(searchResult)) {
    const reviewValue = reviewRecord[key];
    if (isEffectivelyEmpty(reviewValue) && !isEffectivelyEmpty(searchValue)) {
      merged[key] = searchValue;
    }
  }

  return merged as unknown as OutscraperPlace;
}

export async function searchPlaceWithReviews(
  query: string,
  options?: {
    reviewsLimit?: number;
    language?: string;
  },
): Promise<OutscraperPlace | null> {
  // Step 1: Find the place
  const places = await searchPlace(query, { limit: 1 });
  if (!places.length) return null;

  const place = places[0];

  // Step 2: Fetch reviews using the place_id
  if (!place.place_id) return place;

  const withReviews = await getReviews(place.place_id, {
    reviewsLimit: options?.reviewsLimit ?? 100,
    sort: "newest",
    language: options?.language ?? "en",
  });

  if (withReviews.length > 0) {
    return mergePlaceData(place, withReviews[0]);
  }

  return place;
}

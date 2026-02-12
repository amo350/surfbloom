import { z } from "zod";

// =============================================
// Visibility Score Breakdown (100 pts total)
// =============================================

const gbpEligibilitySchema = z.object({
  verified: z.number().min(0).max(2), // Verified listing (2)
  nameGuidelines: z.number().min(0).max(2), // Name follows guidelines (2)
  addressSetup: z.number().min(0).max(2), // Correct address/service-area (2)
});

const gbpRelevanceSchema = z.object({
  primaryCategory: z.number().min(0).max(6), // Primary category correct (6)
  secondaryCategories: z.number().min(0).max(2), // Secondary categories (2)
  servicesProducts: z.number().min(0).max(2), // Services/products filled out (2)
});

const gbpCompletenessSchema = z.object({
  napConsistency: z.number().min(0).max(3),
  hours: z.number().min(0).max(2),
  websiteAndAttributes: z.number().min(0).max(3),
});

const gbpActivitySchema = z.object({
  photosVideos: z.number().min(0).max(4), // Photos/videos quantity + recency (4)
  postsCadence: z.number().min(0).max(2), // Posts cadence (2)
  qaMonitoring: z.number().min(0).max(2), // Q&A seeding/monitoring (2)
});

const gbpBreakdownSchema = z.object({
  score: z.number().min(0).max(32),
  eligibility: gbpEligibilitySchema, // 6 pts
  relevance: gbpRelevanceSchema, // 10 pts
  completeness: gbpCompletenessSchema, // 8 pts
  activity: gbpActivitySchema, // 8 pts
});

const reviewsVisibilitySchema = z.object({
  score: z.number().min(0).max(20),
  averageRating: z.number().min(0).max(6), // 4.7-5.0=6, 4.5-4.69=5, etc.
  volume: z.number().min(0).max(5), // Volume vs peers
  recencyVelocity: z.number().min(0).max(5), // Steady growth beats spikes
  textRichness: z.number().min(0).max(2), // % of reviews with text
  ownerResponseRate: z.number().min(0).max(2), // Response rate + median time
});

const websiteSchema = z.object({
  score: z.number().min(0).max(15),
  notes: z.array(z.string()),
});

const behavioralSchema = z.object({
  score: z.number().min(0).max(9),
  measured: z.boolean(),
  notes: z.array(z.string()),
});

const linksSchema = z.object({
  score: z.number().min(0).max(8),
  notes: z.array(z.string()),
});

const citationsSchema = z.object({
  score: z.number().min(0).max(6),
  notes: z.array(z.string()),
});

const personalizationSchema = z.object({
  score: z.number().min(0).max(6),
  measured: z.boolean(),
  notes: z.array(z.string()),
});

const socialSchema = z.object({
  score: z.number().min(0).max(4),
  platforms: z.array(
    z.object({
      name: z.string(),
      url: z.string().nullable(),
      found: z.boolean(),
    }),
  ),
  notes: z.array(z.string()),
});

export const visibilityBreakdownSchema = z.object({
  gbp: gbpBreakdownSchema, // 32 pts
  reviews: reviewsVisibilitySchema, // 20 pts
  website: websiteSchema, // 15 pts
  behavioral: behavioralSchema, // 9 pts
  links: linksSchema, // 8 pts
  citations: citationsSchema, // 6 pts
  personalization: personalizationSchema, // 6 pts
  social: socialSchema, // 4 pts
  unmeasuredPoints: z.number(),
});

// =============================================
// Reputation Score Breakdown (100 pts total)
// =============================================

const googleReviewsSchema = z.object({
  score: z.number().min(0).max(90),
  rating: z.number().min(0).max(5).nullable(), // Actual average rating
  reviewCount: z.number().min(0).nullable(), // Total reviews
  recentReviewCount: z.number().min(0).nullable(), // Last 90 days
  averageSentiment: z
    .enum(["positive", "neutral", "negative", "mixed"])
    .nullable(),
});

const otherReviewsSchema = z.object({
  score: z.number().min(0).max(10),
  platforms: z.array(
    z.object({
      name: z.string(),
      rating: z.number().min(0).max(5).nullable(),
      reviewCount: z.number().min(0).nullable(),
    }),
  ),
});

export const reputationBreakdownSchema = z.object({
  googleReviews: googleReviewsSchema, // 90 pts
  otherReviews: otherReviewsSchema, // 10 pts
});

// =============================================
// AI-Generated Insights
// =============================================

export const strengthsSchema = z.object({
  items: z
    .array(
      z.object({
        title: z.string(),
        detail: z.string(),
        category: z.enum([
          "gbp",
          "reviews",
          "website",
          "links",
          "citations",
          "social",
          "overall",
        ]),
      }),
    )
    .min(2)
    .max(3),
});

export const weaknessesSchema = z.object({
  items: z
    .array(
      z.object({
        title: z.string(),
        detail: z.string(),
        category: z.enum([
          "gbp",
          "reviews",
          "website",
          "links",
          "citations",
          "social",
          "overall",
        ]),
      }),
    )
    .min(2)
    .max(3),
});

export const recommendationsSchema = z.object({
  items: z
    .array(
      z.object({
        title: z.string(),
        description: z.string(),
        category: z.enum([
          "gbp",
          "reviews",
          "website",
          "links",
          "citations",
          "social",
          "overall",
        ]),
        priority: z.enum(["high", "medium", "low"]),
        impact: z.enum(["high", "medium", "low"]),
        effort: z.enum(["high", "medium", "low"]),
        steps: z.array(z.string()).max(3),
      }),
    )
    .min(2)
    .max(2),
});

// =============================================
// Verification (did we find the right business?)
// =============================================

export const verificationSchema = z.object({
  matched: z.boolean(),
  confidence: z.enum(["high", "medium", "low"]),
  workspaceData: z.object({
    name: z.string().nullable(),
    address: z.string().nullable(),
    city: z.string().nullable(),
    state: z.string().nullable(),
    zipCode: z.string().nullable(),
  }),
  outscraperData: z.object({
    name: z.string().nullable(),
    address: z.string().nullable(),
    placeId: z.string().nullable(),
    latitude: z.number().nullable(),
    longitude: z.number().nullable(),
  }),
  mismatches: z.array(
    z.object({
      field: z.string(),
      workspace: z.string().nullable(),
      outscraper: z.string().nullable(),
    }),
  ),
  needsReview: z.boolean(),
});

// =============================================
// Map Pack Competitors
// =============================================

export const competitorSchema = z.object({
  name: z.string(),
  placeId: z.string().nullable(),
  address: z.string().nullable(),
  rating: z.number().nullable(),
  reviewCount: z.number().nullable(),
  category: z.string().nullable(),
  rank: z.number(),
  isSelf: z.boolean(),
});

export const competitorsSchema = z.object({
  query: z.string(), // Search query used (e.g. "pizza restaurant Brooklyn NY")
  fetchedAt: z.string(), // ISO timestamp
  results: z.array(competitorSchema),
  selfRank: z.number().nullable(), // Where the business appears (null if not found)
  peerAverageRating: z.number().nullable(), // Average rating of competitors
  peerAverageReviewCount: z.number().nullable(), // Average review count of competitors
  peerMedianReviewCount: z.number().nullable(), // Median review count (less skewed by outliers)
});

// =============================================
// Full Report Schema (for validation on read)
// =============================================

export const fullReportSchema = z.object({
  visibilityScore: z.number().min(0).max(100),
  reputationScore: z.number().min(0).max(100),
  visibilityBreakdown: visibilityBreakdownSchema,
  reputationBreakdown: reputationBreakdownSchema,
  strengths: strengthsSchema,
  weaknesses: weaknessesSchema,
  recommendations: recommendationsSchema,
  verification: verificationSchema.nullable(),
  competitors: competitorsSchema.nullable(),
});

// =============================================
// Type Exports
// =============================================

export type VisibilityBreakdown = z.infer<typeof visibilityBreakdownSchema>;
export type ReputationBreakdown = z.infer<typeof reputationBreakdownSchema>;
export type Strength = z.infer<typeof strengthsSchema>["items"][number];
export type Weakness = z.infer<typeof weaknessesSchema>["items"][number];
export type Recommendation = z.infer<
  typeof recommendationsSchema
>["items"][number];
export type FullReport = z.infer<typeof fullReportSchema>;
export type Verification = z.infer<typeof verificationSchema>;
export type Competitor = z.infer<typeof competitorSchema>;
export type Competitors = z.infer<typeof competitorsSchema>;

// Sub-type exports for components
export type GbpBreakdown = z.infer<typeof gbpBreakdownSchema>;
export type ReviewsVisibility = z.infer<typeof reviewsVisibilitySchema>;
export type GoogleReviews = z.infer<typeof googleReviewsSchema>;
export type OtherReviews = z.infer<typeof otherReviewsSchema>;
export type SocialBreakdown = z.infer<typeof socialSchema>;

// Storage types (what gets saved to DB and returned from API — just the arrays)
export type StrengthsArray = Strength[];
export type WeaknessesArray = Weakness[];
export type RecommendationsArray = Recommendation[];

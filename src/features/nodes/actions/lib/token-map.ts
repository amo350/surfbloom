import type { WorkflowContext } from "@/features/nodes/types";

/**
 * Token definition: maps a campaign token name to a resolver function.
 *
 * Tokens use single braces: {first_name}, {location_name}
 * They resolve against the workflow context + loaded contact/workspace data.
 */
interface TokenDefinition {
  token: string;
  label: string;
  category: string;
  resolve: (ctx: ResolverContext) => string;
}

export interface ResolverContext {
  workflow: WorkflowContext;
  contact?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    phone: string | null;
    stage: string;
    source: string;
  } | null;
  workspace?: {
    name: string;
    phone: string | null;
    googleReviewUrl: string | null;
    feedbackSlug: string | null;
  } | null;
}

type ReviewLike = {
  rating?: number | string | null;
  text?: string | null;
  authorName?: string | null;
};

const getReviewFromWorkflow = (workflow: WorkflowContext): ReviewLike | null => {
  const value = workflow.review;
  return value && typeof value === "object" ? (value as ReviewLike) : null;
};

export const TOKEN_DEFINITIONS: TokenDefinition[] = [
  {
    token: "first_name",
    label: "First Name",
    category: "contact",
    resolve: (ctx) => ctx.contact?.firstName || "",
  },
  {
    token: "last_name",
    label: "Last Name",
    category: "contact",
    resolve: (ctx) => ctx.contact?.lastName || "",
  },
  {
    token: "full_name",
    label: "Full Name",
    category: "contact",
    resolve: (ctx) =>
      [ctx.contact?.firstName, ctx.contact?.lastName].filter(Boolean).join(" ") || "",
  },
  {
    token: "email",
    label: "Email",
    category: "contact",
    resolve: (ctx) => ctx.contact?.email || "",
  },
  {
    token: "phone",
    label: "Phone",
    category: "contact",
    resolve: (ctx) => ctx.contact?.phone || "",
  },
  {
    token: "location_name",
    label: "Business Name",
    category: "location",
    resolve: (ctx) => {
      const locationName =
        typeof ctx.workflow.location_name === "string"
          ? ctx.workflow.location_name
          : "";
      return ctx.workspace?.name || locationName;
    },
  },
  {
    token: "location_phone",
    label: "Business Phone",
    category: "location",
    resolve: (ctx) => ctx.workspace?.phone || "",
  },
  {
    token: "review_link",
    label: "Google Review Link",
    category: "link",
    resolve: (ctx) => ctx.workspace?.googleReviewUrl || "",
  },
  {
    token: "feedback_link",
    label: "Feedback Page Link",
    category: "link",
    resolve: (ctx) => {
      const slug = ctx.workspace?.feedbackSlug;
      if (!slug) return "";
      const base =
        process.env.NEXT_PUBLIC_APP_URL || "https://app.surfbloom.com";
      return `${base}/feedback/${slug}`;
    },
  },
  {
    token: "review_rating",
    label: "Review Rating",
    category: "review",
    resolve: (ctx) => {
      const review = getReviewFromWorkflow(ctx.workflow);
      return review?.rating?.toString() || "";
    },
  },
  {
    token: "review_text",
    label: "Review Text",
    category: "review",
    resolve: (ctx) => {
      const review = getReviewFromWorkflow(ctx.workflow);
      return review?.text || "";
    },
  },
  {
    token: "reviewer_name",
    label: "Reviewer Name",
    category: "review",
    resolve: (ctx) => {
      const review = getReviewFromWorkflow(ctx.workflow);
      return review?.authorName || "";
    },
  },
  {
    token: "ai_output",
    label: "AI Output",
    category: "ai",
    resolve: (ctx) =>
      typeof ctx.workflow.aiOutput === "string" ? ctx.workflow.aiOutput : "",
  },
];

export const TOKEN_CATEGORIES = [
  { id: "contact", label: "Contact" },
  { id: "location", label: "Business" },
  { id: "link", label: "Links" },
  { id: "review", label: "Review" },
  { id: "ai", label: "AI" },
];

/**
 * Resolve all {campaign_tokens} in a template string.
 *
 * Scans for {token_name} patterns (single braces, no spaces)
 * and replaces with resolved values.
 *
 * Does NOT touch {{handlebars}} (double braces).
 */
export function resolveCampaignTokens(
  template: string,
  ctx: ResolverContext,
): string {
  if (!template) return "";

  const tokenMap = new Map<string, string>();
  for (const def of TOKEN_DEFINITIONS) {
    tokenMap.set(def.token, def.resolve(ctx));
  }

  return template.replace(
    /(?<!\{)\{([a-z_]+)\}(?!\})/g,
    (match, tokenName: string) => {
      const value = tokenMap.get(tokenName);
      return value !== undefined ? value : match;
    },
  );
}

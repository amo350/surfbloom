export type ConditionOperator =
  | "eq" // equals
  | "neq" // not equals
  | "gt" // greater than
  | "gte" // greater than or equal
  | "lt" // less than
  | "lte" // less than or equal
  | "contains" // string contains
  | "exists" // value is truthy / not null
  | "not_exists" // value is falsy / null
  | "in"; // value is in array

export interface ConditionConfig {
  preset?: string; // preset name (for UI quick-select)
  field: string; // dot-path into context: "review.rating", "contact.stage", etc.
  operator: ConditionOperator;
  value?: string | number; // comparison target (not needed for exists/not_exists)
}

export interface ConditionPreset {
  id: string;
  label: string;
  description: string;
  category: string; // "review", "contact", "category", "survey", "message", "context"
  defaults: ConditionConfig;
}

export const CONDITION_PRESETS: ConditionPreset[] = [
  // Review
  {
    id: "review_rating_gte",
    label: "Review rating >=",
    description: "Review star rating is at or above threshold",
    category: "review",
    defaults: {
      field: "review.rating",
      operator: "gte",
      value: 4,
    },
  },
  {
    id: "review_rating_lt",
    label: "Review rating <",
    description: "Review star rating is below threshold",
    category: "review",
    defaults: {
      field: "review.rating",
      operator: "lt",
      value: 3,
    },
  },
  {
    id: "review_has_text",
    label: "Review has text",
    description: "Reviewer left a written comment",
    category: "review",
    defaults: {
      field: "review.text",
      operator: "exists",
    },
  },

  // Contact
  {
    id: "contact_stage_eq",
    label: "Contact stage is",
    description: "Contact is at a specific stage",
    category: "contact",
    defaults: {
      field: "contact.stage",
      operator: "eq",
      value: "new_lead",
    },
  },
  {
    id: "contact_has_phone",
    label: "Contact has phone",
    description: "Contact has a phone number on file",
    category: "contact",
    defaults: {
      field: "contact.phone",
      operator: "exists",
    },
  },
  {
    id: "contact_has_email",
    label: "Contact has email",
    description: "Contact has an email address on file",
    category: "contact",
    defaults: {
      field: "contact.email",
      operator: "exists",
    },
  },
  {
    id: "contact_opted_out",
    label: "Contact opted out",
    description: "Contact has opted out of messaging",
    category: "contact",
    defaults: {
      field: "contact.optedOut",
      operator: "eq",
      value: "true",
    },
  },

  // Category
  {
    id: "has_category",
    label: "Has category",
    description: "Contact has a specific category",
    category: "category",
    defaults: {
      field: "_categories",
      operator: "contains",
      value: "",
    },
  },
  {
    id: "no_category",
    label: "Does not have category",
    description: "Contact is missing a specific category",
    category: "category",
    defaults: {
      field: "_categories",
      operator: "not_exists",
      value: "",
    },
  },

  // Survey
  {
    id: "survey_score_gte",
    label: "Survey score >=",
    description: "Survey score is at or above threshold",
    category: "survey",
    defaults: {
      field: "score",
      operator: "gte",
      value: 8,
    },
  },
  {
    id: "survey_score_lte",
    label: "Survey score <=",
    description: "Survey score is at or below threshold",
    category: "survey",
    defaults: {
      field: "score",
      operator: "lte",
      value: 5,
    },
  },
  {
    id: "nps_promoter",
    label: "NPS: Promoter",
    description: "Contact is an NPS promoter (9-10)",
    category: "survey",
    defaults: {
      field: "npsCategory",
      operator: "eq",
      value: "promoter",
    },
  },
  {
    id: "nps_detractor",
    label: "NPS: Detractor",
    description: "Contact is an NPS detractor (0-6)",
    category: "survey",
    defaults: {
      field: "npsCategory",
      operator: "eq",
      value: "detractor",
    },
  },

  // Feedback
  {
    id: "feedback_rating_gte",
    label: "Feedback rating >=",
    description: "Feedback form rating at or above threshold",
    category: "feedback",
    defaults: {
      field: "rating",
      operator: "gte",
      value: 4,
    },
  },

  // Context (generic)
  {
    id: "custom",
    label: "Custom condition",
    description: "Check any context variable",
    category: "context",
    defaults: {
      field: "",
      operator: "eq",
      value: "",
    },
  },
];

export const PRESET_CATEGORIES = [
  { id: "review", label: "Review" },
  { id: "contact", label: "Contact" },
  { id: "category", label: "Category" },
  { id: "survey", label: "Survey" },
  { id: "feedback", label: "Feedback" },
  { id: "context", label: "Custom" },
];

export const OPERATOR_LABELS: Record<ConditionOperator, string> = {
  eq: "equals",
  neq: "does not equal",
  gt: "greater than",
  gte: "greater than or equal to",
  lt: "less than",
  lte: "less than or equal to",
  contains: "contains",
  exists: "exists",
  not_exists: "does not exist",
  in: "is one of",
};

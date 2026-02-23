export type DisplayConditionOperator =
  | "eq"
  | "neq"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "in";

export type DisplayCondition = {
  questionId: string;
  operator: DisplayConditionOperator;
  value: number | string | string[];
};

export type DisplayConditionAnswer = {
  answerNumber?: number | null;
  answerChoice?: string | null;
  answerText?: string | null;
};

const NUMERIC_LIKE_REGEX = /^\s*-?\d+(\.\d+)?\s*$/;

const validOperators = new Set<DisplayConditionOperator>([
  "eq",
  "neq",
  "gt",
  "gte",
  "lt",
  "lte",
  "in",
]);

function assertUnreachable(value: never): never {
  throw new Error(`Unhandled display condition operator: ${String(value)}`);
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function isNumericLike(value: unknown): value is number | string {
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value === "string") return NUMERIC_LIKE_REGEX.test(value);
  return false;
}

function normalizeComparable(value: number | string): number | string {
  return isNumericLike(value) ? Number(value) : String(value);
}

export function parseDisplayCondition(raw: unknown): DisplayCondition | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }

  const maybe = raw as Record<string, unknown>;
  const questionId =
    typeof maybe.questionId === "string" ? maybe.questionId.trim() : "";
  const operatorRaw =
    typeof maybe.operator === "string" ? maybe.operator.trim() : "";
  const value = maybe.value;

  if (!questionId || !validOperators.has(operatorRaw as DisplayConditionOperator)) {
    return null;
  }

  const operator = operatorRaw as DisplayConditionOperator;

  if (operator === "in") {
    if (!Array.isArray(value) || value.some((v) => typeof v !== "string")) {
      return null;
    }
  } else if (typeof value !== "number" && typeof value !== "string") {
    return null;
  }

  return {
    questionId,
    operator,
    value: value as DisplayCondition["value"],
  };
}

export function evaluateDisplayCondition(
  condition: DisplayCondition | null,
  answer: DisplayConditionAnswer | null | undefined,
): boolean {
  if (!condition) return true;
  if (!answer) return false;

  const { operator, value } = condition;
  const answerValue = answer.answerNumber ?? answer.answerChoice ?? answer.answerText;
  if (answerValue == null) return false;

  const answerNumber = toNumber(answerValue);
  const conditionNumber = toNumber(value);

  switch (operator) {
    case "eq": {
      // We normalize answerValue/value then use strict comparison:
      // for operator "eq"/"neq", numeric-like pairs (e.g. "10" and 10) compare as
      // numbers and everything else as strings; null/undefined answerValue is rejected
      // earlier to avoid loose-equality edge cases between answerValue and value.
      if (typeof value !== "number" && typeof value !== "string") return false;
      return normalizeComparable(answerValue) === normalizeComparable(value);
    }
    case "neq":
      if (typeof value !== "number" && typeof value !== "string") return false;
      return normalizeComparable(answerValue) !== normalizeComparable(value);
    case "gt":
      return answerNumber != null && conditionNumber != null
        ? answerNumber > conditionNumber
        : false;
    case "gte":
      return answerNumber != null && conditionNumber != null
        ? answerNumber >= conditionNumber
        : false;
    case "lt":
      return answerNumber != null && conditionNumber != null
        ? answerNumber < conditionNumber
        : false;
    case "lte":
      return answerNumber != null && conditionNumber != null
        ? answerNumber <= conditionNumber
        : false;
    case "in":
      return Array.isArray(value) && value.includes(String(answerValue));
    default:
      return assertUnreachable(operator);
  }
}

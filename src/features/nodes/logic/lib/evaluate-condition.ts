import type { WorkflowContext } from "@/features/nodes/types";
import { prisma } from "@/lib/prisma";
import type { ConditionConfig, ConditionOperator } from "./condition-presets";

/**
 * Evaluate a condition against the current workflow context.
 * Returns true or false.
 */
export async function evaluateCondition(
  condition: ConditionConfig,
  context: WorkflowContext,
): Promise<boolean> {
  // Special case: category check requires DB lookup
  if (condition.field === "_categories") {
    return evaluateCategoryCondition(condition, context);
  }

  // Resolve the field value from context using dot-path
  const actual = resolveField(context, condition.field);

  return compareValues(actual, condition.operator, condition.value);
}

/**
 * Resolve a dot-path field from the context object.
 * e.g. "review.rating" -> context.review.rating
 * e.g. "contact.phone" -> context.contact.phone
 */
function resolveField(context: WorkflowContext, field: string): unknown {
  const parts = field.split(".");
  let current: unknown = context;

  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }

  return current;
}

/**
 * Compare an actual value against an expected value using the operator.
 */
function compareValues(
  actual: unknown,
  operator: ConditionOperator,
  expected?: string | number,
): boolean {
  switch (operator) {
    case "exists":
      return actual != null && actual !== "" && actual !== false;

    case "not_exists":
      return actual == null || actual === "" || actual === false;

    case "eq": {
      if (actual == null) return false;
      // Loose comparison for string/number flexibility
      return String(actual).toLowerCase() === String(expected).toLowerCase();
    }

    case "neq": {
      if (actual == null) return expected != null;
      return String(actual).toLowerCase() !== String(expected).toLowerCase();
    }

    case "gt": {
      const a = toNumber(actual);
      const b = toNumber(expected);
      if (a == null || b == null) return false;
      return a > b;
    }

    case "gte": {
      const a = toNumber(actual);
      const b = toNumber(expected);
      if (a == null || b == null) return false;
      return a >= b;
    }

    case "lt": {
      const a = toNumber(actual);
      const b = toNumber(expected);
      if (a == null || b == null) return false;
      return a < b;
    }

    case "lte": {
      const a = toNumber(actual);
      const b = toNumber(expected);
      if (a == null || b == null) return false;
      return a <= b;
    }

    case "contains": {
      if (typeof actual === "string" && typeof expected === "string") {
        return actual.toLowerCase().includes(expected.toLowerCase());
      }
      if (Array.isArray(actual)) {
        return actual.some(
          (item) =>
            String(item).toLowerCase() === String(expected).toLowerCase(),
        );
      }
      return false;
    }

    case "in": {
      // expected is comma-separated list: "hot,warm,new"
      if (expected == null) return false;
      const options = String(expected)
        .split(",")
        .map((s) => s.trim().toLowerCase());
      return options.includes(String(actual).toLowerCase());
    }

    default:
      return false;
  }
}

/**
 * Category check: query the DB for contact's categories.
 *
 * The condition.value is the category name to check.
 * Operator "contains" = has category, "not_exists" = does not have category.
 */
async function evaluateCategoryCondition(
  condition: ConditionConfig,
  context: WorkflowContext,
): Promise<boolean> {
  const contactId = (context.contactId || (context.contact as any)?.id) as
    | string
    | undefined;
  const workspaceId = context.workspaceId as string | undefined;

  if (!contactId || !workspaceId) return false;

  const categoryName = String(condition.value || "").trim();
  if (!categoryName) return false;

  const match = await prisma.contactCategory.findFirst({
    where: {
      contactId,
      category: {
        workspaceId,
        name: { equals: categoryName, mode: "insensitive" },
      },
    },
  });

  if (condition.operator === "contains" || condition.operator === "exists") {
    return match != null;
  }
  if (condition.operator === "not_exists" || condition.operator === "neq") {
    return match == null;
  }

  return false;
}

function toNumber(value: unknown): number | null {
  if (value == null) return null;
  const n = Number(value);
  return isNaN(n) ? null : n;
}

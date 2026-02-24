import { prisma } from "@/lib/prisma";

interface UsageLogParams {
  workspaceId: string;
  nodeId?: string;
  workflowId?: string;
  executionId?: string;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number; // in cents
  purpose?: string;
}

/**
 * Log AI usage. Fire-and-forget — never throws.
 */
export async function logAiUsage(params: UsageLogParams): Promise<void> {
  try {
    await prisma.aiUsageLog.create({
      data: {
        workspaceId: params.workspaceId,
        nodeId: params.nodeId,
        workflowId: params.workflowId,
        executionId: params.executionId,
        provider: params.provider,
        model: params.model,
        inputTokens: params.inputTokens,
        outputTokens: params.outputTokens,
        estimatedCost: params.estimatedCost,
        purpose: params.purpose,
      },
    });
  } catch (err) {
    console.error("[ai-usage-logger] Failed to log:", err);
  }
}

/**
 * Pre-flight budget check.
 * For now, always returns true. Future: check against workspace limits.
 */
export async function checkAiBudget(workspaceId: string): Promise<boolean> {
  // TODO: Query AiUsageLog for this month's total, compare against
  // workspace.aiMonthlyBudgetCents and workspace.aiDailyCallLimit
  return true;
}

/**
 * Estimate cost in cents based on provider and token counts.
 * Rough estimates — updated as pricing changes.
 */
export function estimateCost(
  provider: string,
  model: string,
  inputTokens: number,
  outputTokens: number,
): number {
  // Per 1M tokens pricing (in cents), rough estimates
  const pricing: Record<string, { input: number; output: number }> = {
    "claude-sonnet-4-20250514": { input: 300, output: 1500 },
    "claude-haiku-4-5-20251001": { input: 80, output: 400 },
    "gpt-4o": { input: 250, output: 1000 },
    "gpt-4o-mini": { input: 15, output: 60 },
    "gemini-2.0-flash": { input: 10, output: 40 },
    "grok-3-mini": { input: 30, output: 50 },
  };

  const rates = pricing[model] || { input: 100, output: 500 }; // fallback

  return (
    (inputTokens / 1_000_000) * rates.input +
    (outputTokens / 1_000_000) * rates.output
  );
}

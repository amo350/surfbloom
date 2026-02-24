import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { createXai } from "@ai-sdk/xai";
import { generateText } from "ai";
import { resolveTemplate } from "@/features/nodes/actions/lib/resolve-template";
import type { WorkflowContext } from "@/features/nodes/types";
import { getPreset } from "./ai-presets";
import {
  formatBrandPrompt,
  loadBrandContext,
  type BrandProfile,
} from "./brand-context";
import { checkAiBudget, estimateCost, logAiUsage } from "./usage-logger";

export type AiProvider = "anthropic" | "openai" | "google" | "xai";

interface AiNodeConfig {
  mode: string; // "generate" | "analyze" | "summarize"
  provider: AiProvider;
  model?: string; // specific model, or auto-selected per provider
  presetId?: string; // preset ID from ai-presets
  systemPrompt?: string; // custom system prompt (overrides preset)
  userPrompt?: string; // custom user prompt (overrides preset)
  variableName?: string; // context key for output (default: "aiOutput")
}

interface AiResult {
  text: string;
  inputTokens: number;
  outputTokens: number;
  model: string;
  provider: string;
}

const DEFAULT_MODELS: Record<AiProvider, string> = {
  anthropic: "claude-sonnet-4-20250514",
  openai: "gpt-4o-mini",
  google: "gemini-2.0-flash",
  xai: "grok-3-mini",
};

/**
 * Execute an AI call with the configured provider.
 *
 * 1. Resolve prompt from preset or custom input
 * 2. Inject brand context
 * 3. Check budget
 * 4. Call provider SDK
 * 5. Log usage
 * 6. Return result
 */
export async function executeAiCall(
  config: AiNodeConfig,
  context: WorkflowContext,
  meta: {
    workspaceId: string;
    nodeId: string;
    workflowId?: string;
    executionId?: string;
  },
): Promise<AiResult> {
  // 1. Resolve prompts
  let systemPrompt = config.systemPrompt || "";
  let userPrompt = config.userPrompt || "";

  if (config.presetId) {
    const preset = getPreset(config.presetId);
    if (preset) {
      if (!systemPrompt) systemPrompt = preset.systemPrompt;
      if (!userPrompt) userPrompt = preset.userPromptTemplate;
    }
  }

  // Compile user prompt with Handlebars against context
  const templateContext: Record<string, unknown> = {
    ...context,
    location_name:
      (context as Record<string, unknown>).location_name || meta.workspaceId,
  };
  userPrompt = resolveTemplate(userPrompt, templateContext);

  // 2. Inject brand context
  const brand = resolveBrandFromContext(context) || (await loadBrandContext(meta.workspaceId));
  const brandPrompt = formatBrandPrompt(brand);

  // Add brand + location_name to template context for any remaining references
  templateContext.brand = brand;
  templateContext.location_name = brand.locationName;

  const fullSystemPrompt = systemPrompt + brandPrompt;

  // 3. Budget check
  const allowed = await checkAiBudget(meta.workspaceId);
  if (!allowed) {
    throw new Error("AI budget exceeded for this workspace");
  }

  // 4. Call provider
  const model =
    config.model || DEFAULT_MODELS[config.provider] || DEFAULT_MODELS.anthropic;

  let result: AiResult;

  switch (config.provider) {
    case "anthropic":
      result = await callAnthropic(fullSystemPrompt, userPrompt, model);
      break;
    case "openai":
      result = await callOpenAi(fullSystemPrompt, userPrompt, model);
      break;
    case "google":
      result = await callGoogle(fullSystemPrompt, userPrompt, model);
      break;
    case "xai":
      result = await callXAi(fullSystemPrompt, userPrompt, model);
      break;
    default:
      throw new Error(`Unknown AI provider: ${config.provider}`);
  }

  // 5. Log usage
  const cost = estimateCost(
    config.provider,
    model,
    result.inputTokens,
    result.outputTokens,
  );

  logAiUsage({
    workspaceId: meta.workspaceId,
    nodeId: meta.nodeId,
    workflowId: meta.workflowId,
    executionId: meta.executionId,
    provider: config.provider,
    model,
    inputTokens: result.inputTokens,
    outputTokens: result.outputTokens,
    estimatedCost: cost,
    purpose: `${config.mode}:${config.presetId || "custom"}`,
  }).catch(() => {}); // fire-and-forget

  return result;
}

function resolveBrandFromContext(context: WorkflowContext): BrandProfile | null {
  const workspace = (context as Record<string, unknown>).workspace;
  if (!workspace || typeof workspace !== "object") return null;

  const w = workspace as Record<string, unknown>;
  const name = w.name;
  if (typeof name !== "string" || !name.trim()) return null;

  return {
    locationName: name,
    tone: typeof w.brandTone === "string" ? w.brandTone : null,
    industry: typeof w.brandIndustry === "string" ? w.brandIndustry : null,
    services: typeof w.brandServices === "string" ? w.brandServices : null,
    usps: typeof w.brandUsps === "string" ? w.brandUsps : null,
    instructions:
      typeof w.brandInstructions === "string" ? w.brandInstructions : null,
  };
}

// ─── Provider Implementations ─────────────────────────

async function callAnthropic(
  systemPrompt: string,
  userPrompt: string,
  model: string,
): Promise<AiResult> {
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic();

  const response = await client.messages.create({
    model,
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const text = response.content
    .filter((block) => block.type === "text")
    .map((block) => (block as any).text)
    .join("");

  return {
    text,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
    model,
    provider: "anthropic",
  };
}

async function callOpenAi(
  systemPrompt: string,
  userPrompt: string,
  model: string,
): Promise<AiResult> {
  const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY || "",
  });

  const response = await generateText({
    model: openai(model),
    system: systemPrompt,
    prompt: userPrompt,
    maxOutputTokens: 1024,
  });

  return {
    text: response.text || "",
    inputTokens: response.usage.inputTokens || 0,
    outputTokens: response.usage.outputTokens || 0,
    model,
    provider: "openai",
  };
}

async function callGoogle(
  systemPrompt: string,
  userPrompt: string,
  model: string,
): Promise<AiResult> {
  const google = createGoogleGenerativeAI({
    apiKey:
      process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
      process.env.GOOGLE_AI_API_KEY ||
      "",
  });

  const response = await generateText({
    model: google(model),
    system: systemPrompt,
    prompt: userPrompt,
    maxOutputTokens: 1024,
  });

  return {
    text: response.text || "",
    inputTokens: response.usage.inputTokens || 0,
    outputTokens: response.usage.outputTokens || 0,
    model,
    provider: "google",
  };
}

async function callXAi(
  systemPrompt: string,
  userPrompt: string,
  model: string,
): Promise<AiResult> {
  // xAI uses OpenAI-compatible API
  const xai = createXai({
    apiKey: process.env.XAI_API_KEY || "",
  });

  const response = await generateText({
    model: xai(model),
    system: systemPrompt,
    prompt: userPrompt,
    maxOutputTokens: 1024,
  });

  return {
    text: response.text || "",
    inputTokens: response.usage.inputTokens || 0,
    outputTokens: response.usage.outputTokens || 0,
    model,
    provider: "xai",
  };
}

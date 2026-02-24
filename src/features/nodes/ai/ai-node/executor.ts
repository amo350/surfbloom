// biome-ignore assist/source/organizeImports: preserve existing import order for this file.
import type { NodeExecutor } from "@/features/nodes/types";
import { aiNodeChannel } from "./channel";
import { executeAiCall, type AiProvider } from "../lib/ai-providers";

interface AiNodeData {
  mode?: string;
  provider?: AiProvider;
  model?: string;
  presetId?: string;
  systemPrompt?: string;
  userPrompt?: string;
  variableName?: string;
}

function normalizeAiNodeData(data: Record<string, unknown>): AiNodeData {
  const provider = data.provider;
  const mode = data.mode;
  return {
    mode: typeof mode === "string" ? mode : undefined,
    provider: typeof provider === "string" ? (provider as AiProvider) : undefined,
    model: typeof data.model === "string" ? data.model : undefined,
    presetId: typeof data.presetId === "string" ? data.presetId : undefined,
    systemPrompt:
      typeof data.systemPrompt === "string" ? data.systemPrompt : undefined,
    userPrompt: typeof data.userPrompt === "string" ? data.userPrompt : undefined,
    variableName:
      typeof data.variableName === "string" ? data.variableName : undefined,
  };
}

export const aiNodeExecutor: NodeExecutor = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  const aiData = normalizeAiNodeData(data);
  await publish(aiNodeChannel().status({ nodeId, status: "loading" }));

  try {
    const result = await step.run("ai-node-execute", async () => {
      const workspaceId = context.workspaceId as string;
      if (!workspaceId) throw new Error("No workspaceId in context");

      const aiResult = await executeAiCall(
        {
          mode: aiData.mode || "generate",
          provider: aiData.provider || "anthropic",
          model: aiData.model,
          presetId: aiData.presetId,
          systemPrompt: aiData.systemPrompt,
          userPrompt: aiData.userPrompt,
          variableName: aiData.variableName,
        },
        context,
        {
          workspaceId,
          nodeId,
          // workflowId and executionId could be threaded through context
          // if needed for usage tracking granularity
        },
      );

      const outputKey = aiData.variableName || "aiOutput";

      return {
        ...context,
        [outputKey]: aiResult.text,
        _aiMeta: {
          provider: aiResult.provider,
          model: aiResult.model,
          inputTokens: aiResult.inputTokens,
          outputTokens: aiResult.outputTokens,
        },
      };
    });

    await publish(aiNodeChannel().status({ nodeId, status: "success" }));
    return result;
  } catch (error) {
    await publish(aiNodeChannel().status({ nodeId, status: "error" }));
    throw error;
  }
};

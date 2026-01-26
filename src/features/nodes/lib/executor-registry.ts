import { googleFormTriggerExecutor } from "@/features/nodes/google-form-trigger/executor";
import { manualTriggerExecutor } from "@/features/nodes/manual-trigger/executor";
import { stripeTriggerExecutor } from "@/features/nodes/stripe-trigger/executor";
import { NodeType } from "@/generated/prisma/enums";
import { geminiExecutor } from "@/features/nodes/gemini/executor";
import { HttpRequestExecutor } from "@/features/nodes/http-requests/executor";
import { openAiExecutor } from "@/features/nodes/openAi/executor";
import { xAiExecutor } from "@/features/nodes/xAi/executor";
import { NodeExecutor } from "@/features/nodes/types";
import { slackExecutor } from "@/features/nodes/slack/executor";

export const executorRegistry: Record<NodeType, NodeExecutor> = {
  [NodeType.INITIAL]: manualTriggerExecutor,
  [NodeType.MANUAL_TRIGGER]: manualTriggerExecutor,
  [NodeType.HTTP_REQUEST]: HttpRequestExecutor,
  [NodeType.GOOGLE_FORM_TRIGGER]: googleFormTriggerExecutor,
  [NodeType.STRIPE_TRIGGER]: stripeTriggerExecutor,
  [NodeType.GEMINI]: geminiExecutor,
  [NodeType.OPENAI]: openAiExecutor,
  // TODO: Implement these executors
  [NodeType.GROK]: xAiExecutor,
  [NodeType.SLACK]: slackExecutor,
};

export const getExecutor = (type: NodeType): NodeExecutor => {
  const executor = executorRegistry[type];
  if (!executor) {
    throw new Error(`No executor found for node type: ${type}`);
  }
  return executor;
};

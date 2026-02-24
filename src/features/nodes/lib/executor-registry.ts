import { geminiExecutor } from "@/features/nodes/gemini/executor";
import { googleFormTriggerExecutor } from "@/features/nodes/google-form-trigger/executor";
import { HttpRequestExecutor } from "@/features/nodes/http-requests/executor";
import { manualTriggerExecutor } from "@/features/nodes/manual-trigger/executor";
import { openAiExecutor } from "@/features/nodes/openAi/executor";
import { slackExecutor } from "@/features/nodes/slack/executor";
import { stripeTriggerExecutor } from "@/features/nodes/stripe-trigger/executor";
import { categoryAddedExecutor } from "@/features/nodes/triggers/category-added/executor";
import { contactCreatedExecutor } from "@/features/nodes/triggers/contact-created/executor";
import { reviewReceivedExecutor } from "@/features/nodes/triggers/review-received/executor";
import { scheduleExecutor } from "@/features/nodes/triggers/schedule/executor";
import { NodeExecutor } from "@/features/nodes/types";
import { xAiExecutor } from "@/features/nodes/xAi/executor";
import { NodeType } from "@/generated/prisma/enums";

export const executorRegistry: Partial<Record<NodeType, NodeExecutor>> = {
  [NodeType.INITIAL]: manualTriggerExecutor,
  [NodeType.MANUAL_TRIGGER]: manualTriggerExecutor,
  [NodeType.HTTP_REQUEST]: HttpRequestExecutor,
  [NodeType.GOOGLE_FORM_TRIGGER]: googleFormTriggerExecutor,
  [NodeType.STRIPE_TRIGGER]: stripeTriggerExecutor,
  [NodeType.CATEGORY_ADDED]: categoryAddedExecutor,
  [NodeType.CONTACT_CREATED]: contactCreatedExecutor,
  [NodeType.REVIEW_RECEIVED]: reviewReceivedExecutor,
  [NodeType.SCHEDULE]: scheduleExecutor,
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

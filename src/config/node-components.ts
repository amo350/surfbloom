import { NodeTypes } from "@xyflow/react";
import { InitialNode } from "@/components/InitialNode";
import { GeminiNode } from "@/features/nodes/gemini/node";
import { GoogleFormTrigger } from "@/features/nodes/google-form-trigger/node";
import { HttpRequestNode } from "@/features/nodes/http-requests/node";
import { ManualTriggerNode } from "@/features/nodes/manual-trigger/node";
import { OpenAiNode } from "@/features/nodes/openAi/node";
import { SlackNode } from "@/features/nodes/slack/node";
import { StripeTriggerNode } from "@/features/nodes/stripe-trigger/node";
import { CategoryAddedNode } from "@/features/nodes/triggers/category-added/node";
import { ContactCreatedNode } from "@/features/nodes/triggers/contact-created/node";
import { ReviewReceivedNode } from "@/features/nodes/triggers/review-received/node";
import { ScheduleNode } from "@/features/nodes/triggers/schedule/node";
import { XAiNode } from "@/features/nodes/xAi/node";
import { NodeType } from "@/generated/prisma/enums";

export const nodeComponents = {
  [NodeType.INITIAL]: InitialNode,
  [NodeType.HTTP_REQUEST]: HttpRequestNode,
  [NodeType.MANUAL_TRIGGER]: ManualTriggerNode,
  [NodeType.GOOGLE_FORM_TRIGGER]: GoogleFormTrigger,
  [NodeType.STRIPE_TRIGGER]: StripeTriggerNode,
  [NodeType.CATEGORY_ADDED]: CategoryAddedNode,
  [NodeType.CONTACT_CREATED]: ContactCreatedNode,
  [NodeType.REVIEW_RECEIVED]: ReviewReceivedNode,
  [NodeType.SCHEDULE]: ScheduleNode,
  [NodeType.GEMINI]: GeminiNode,
  [NodeType.OPENAI]: OpenAiNode,
  [NodeType.GROK]: XAiNode,
  [NodeType.SLACK]: SlackNode,
} as const satisfies NodeTypes;

export type RegisteredNodeType = keyof typeof nodeComponents;

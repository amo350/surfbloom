import { NodeTypes } from "@xyflow/react";
import { InitialNode } from "@/components/InitialNode";
import { GeminiNode } from "@/features/nodes/gemini/node";
import { HttpRequestNode } from "@/features/nodes/http-requests/node";
import { OpenAiNode } from "@/features/nodes/openAi/node";
import { XAiNode } from "@/features/nodes/xAi/node";
import { GoogleFormTrigger } from "@/features/nodes/google-form-trigger/node";
import { ManualTriggerNode } from "@/features/nodes/manual-trigger/node";
import { StripeTriggerNode } from "@/features/nodes/stripe-trigger/node";
import { NodeType } from "@/generated/prisma/enums";
import { SlackNode } from "@/features/nodes/slack/node";

export const nodeComponents = {
  [NodeType.INITIAL]: InitialNode,
  [NodeType.HTTP_REQUEST]: HttpRequestNode,
  [NodeType.MANUAL_TRIGGER]: ManualTriggerNode,
  [NodeType.GOOGLE_FORM_TRIGGER]: GoogleFormTrigger,
  [NodeType.STRIPE_TRIGGER]: StripeTriggerNode,
  [NodeType.GEMINI]: GeminiNode,
  [NodeType.OPENAI]: OpenAiNode,
  [NodeType.GROK]: XAiNode,
  [NodeType.SLACK]: SlackNode,
} as const satisfies NodeTypes;

export type RegisteredNodeType = keyof typeof nodeComponents;

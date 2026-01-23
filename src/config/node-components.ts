import { NodeTypes } from "@xyflow/react";
import { InitialNode } from "@/components/InitialNode";
import { HttpRequestNode } from "@/features/executions/components/http-requests/node";
import { GoogleFormTrigger } from "@/features/triggers/components/google-form-trigger/node";
import { ManualTriggerNode } from "@/features/triggers/components/manual-trigger/node";
import { StripeTriggerNode } from "@/features/triggers/components/stripe-trigger/node";
import { NodeType } from "@/generated/prisma/enums";

export const nodeComponents = {
    [NodeType.INITIAL]: InitialNode,
    [NodeType.HTTP_REQUEST]: HttpRequestNode,
    [NodeType.MANUAL_TRIGGER]: ManualTriggerNode,
    [NodeType.GOOGLE_FORM_TRIGGER]: GoogleFormTrigger,
    [NodeType.STRIPE_TRIGGER]: StripeTriggerNode,
} as const satisfies NodeTypes;

export type RegisteredNodeType = keyof typeof nodeComponents;

// biome-ignore-all assist/source/organizeImports: preserve existing import order for this file.
"use client";

import { memo, useState } from "react";
import type { Node, NodeProps } from "@xyflow/react";
import { useReactFlow } from "@xyflow/react";
import { Sparkles } from "lucide-react";

import { BaseExecutionNode } from "@/features/nodes/components/BaseExecutionNode";
import { useNodeStatus } from "@/features/nodes/hooks/use-node-status";
import { AiNodeDialog } from "@/features/nodes/ai/ai-node/dialog";
import { fetchAiNodeRealtimeToken } from "./actions";

type AiNodeNodeType = {
  mode?: string;
  provider?: string;
  model?: string;
  presetId?: string;
  systemPrompt?: string;
  userPrompt?: string;
  variableName?: string;
};

type AiNodeType = Node<AiNodeNodeType>;

const PROVIDER_ICONS: Record<string, string> = {
  anthropic: "/logos/claude-color.svg",
  openai: "/logos/openai.svg",
  google: "/logos/gemini.svg",
  xai: "/logos/grok.svg",
};

const PROVIDER_LABELS: Record<string, string> = {
  anthropic: "Claude",
  openai: "GPT",
  google: "Gemini",
  xai: "Grok",
};

const MODE_LABELS: Record<string, string> = {
  generate: "Generate",
  analyze: "Analyze",
  summarize: "Summarize",
};

export const AiNodeNode = memo((props: NodeProps<AiNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const handleOpenSettings = () => setDialogOpen(true);

  const handleSubmit = (values: AiNodeNodeType) => {
    setNodes((nodes) =>
      nodes.map((n) =>
        n.id === props.id ? { ...n, data: { ...n.data, ...values } } : n,
      ),
    );
  };

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: "ai-node-execution",
    topic: "status",
    refreshToken: fetchAiNodeRealtimeToken,
  });

  const data = props.data;
  const provider = data?.provider || "anthropic";
  const mode = data?.mode || "generate";

  const providerLabel = PROVIDER_LABELS[provider] || provider;
  const modeLabel = MODE_LABELS[mode] || mode;
  const description =
    data?.presetId || data?.mode
      ? `${modeLabel} · ${providerLabel}`
      : "Not configured";

  // Use provider icon if available, otherwise default sparkles
  const providerIcon = PROVIDER_ICONS[provider];
  const icon = providerIcon || Sparkles;

  return (
    <>
      <AiNodeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={data}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon={icon}
        name="AI Node"
        description={description}
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

AiNodeNode.displayName = "AiNodeNode";

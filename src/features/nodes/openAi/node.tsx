"use client";

import { type Node, type NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { useNodeStatus } from "@/features/nodes/hooks/use-node-status";
import { BaseExecutionNode } from "@/features/nodes/components/BaseExecutionNode";
import { fetchOpenAiRealtimeToken } from "./actions";
import { OpenAiDialog, OpenAiValues } from "./dialog";

type OpenAiNodeData = {
  variableName?: string;
  model?: string;
  systemPrompt?: string;
  userPrompt?: string;
};

type OpenAiNodeType = Node<OpenAiNodeData>;

export const OpenAiNode = memo((props: NodeProps<OpenAiNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const handleOpenSettings = () => setDialogOpen(true);

  const handleSubmit = (values: OpenAiValues) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === props.id) {
          return {
            ...node,
            data: {
              ...node.data,
              ...values,
            },
          };
        }
        return node;
      }),
    );
  };

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: "openAi-execution",
    topic: "status",
    refreshToken: fetchOpenAiRealtimeToken,
  });

  const nodeData = props.data;
  const model = nodeData?.model || "gpt-4o-mini";
  const description = nodeData?.userPrompt
    ? `${model}: ${nodeData.userPrompt.slice(0, 50)}...`
    : "Not configured";

  return (
    <>
      <OpenAiDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon="/logos/openai.svg"
        name="ChatGPT"
        description={description}
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

OpenAiNode.displayName = "OpenAiNode";

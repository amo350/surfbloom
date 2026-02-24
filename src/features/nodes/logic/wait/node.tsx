"use client";

import { type NodeProps, useReactFlow } from "@xyflow/react";
import { Timer } from "lucide-react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "@/features/nodes/components/BaseExecutionNode";
import { useNodeStatus } from "@/features/nodes/hooks/use-node-status";
import { fetchWaitRealtimeToken } from "./actions";
import { WaitDialog } from "./dialog";

type WaitNodeData = {
  amount?: number;
  unit?: "minutes" | "hours" | "days";
};

export const WaitNode = memo((props: NodeProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const handleOpenSettings = () => setDialogOpen(true);

  const handleSubmit = (values: WaitNodeData) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === props.id
          ? { ...node, data: { ...node.data, ...values } }
          : node,
      ),
    );
  };

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: "wait-execution",
    topic: "status",
    refreshToken: fetchWaitRealtimeToken,
  });

  const nodeData = props.data as WaitNodeData | undefined;
  const description =
    nodeData?.amount && nodeData?.unit
      ? `Wait ${nodeData.amount} ${nodeData.unit}`
      : "Not configured";

  return (
    <>
      <WaitDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon={Timer}
        name="Wait"
        description={description}
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

WaitNode.displayName = "WaitNode";

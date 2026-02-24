"use client";

import type { NodeProps } from "@xyflow/react";
import { useReactFlow } from "@xyflow/react";
import { Tag } from "lucide-react";
import { memo, useState } from "react";
import { BaseTriggerNode } from "@/features/nodes/components/BaseTriggerNode";
import { useNodeStatus } from "@/features/nodes/hooks/use-node-status";
import { fetchCategoryAddedRealtimeToken } from "./actions";
import { CategoryAddedDialog } from "./dialog";

export const CategoryAddedNode = memo((props: NodeProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const handleOpenSettings = () => setDialogOpen(true);

  const handleSubmit = (values: { categoryName?: string }) => {
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
    channel: "category-added-trigger",
    topic: "status",
    refreshToken: fetchCategoryAddedRealtimeToken,
  });

  const nodeData = props.data;
  const description = nodeData?.categoryName
    ? `Category: ${nodeData.categoryName}`
    : "Any category";

  return (
    <>
      <CategoryAddedDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseTriggerNode
        {...props}
        icon={Tag}
        name="Category Added"
        description={description}
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

CategoryAddedNode.displayName = "CategoryAddedNode";

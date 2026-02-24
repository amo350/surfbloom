"use client";

import type { NodeProps } from "@xyflow/react";
import { useReactFlow } from "@xyflow/react";
import { Star } from "lucide-react";
import { memo, useState } from "react";
import { BaseTriggerNode } from "@/features/nodes/components/BaseTriggerNode";
import { useNodeStatus } from "@/features/nodes/hooks/use-node-status";
import { fetchReviewReceivedRealtimeToken } from "./actions";
import { ReviewReceivedDialog } from "./dialog";

interface ReviewReceivedNodeData {
  minRating?: number;
  maxRating?: number;
}

export const ReviewReceivedNode = memo((props: NodeProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const handleOpenSettings = () => setDialogOpen(true);

  const handleSubmit = (values: ReviewReceivedNodeData) => {
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
    channel: "review-received-trigger",
    topic: "status",
    refreshToken: fetchReviewReceivedRealtimeToken,
  });

  const nodeData = props.data as ReviewReceivedNodeData | undefined;
  const description =
    nodeData?.minRating != null || nodeData?.maxRating != null
      ? `Rating ${
          nodeData?.minRating != null ? `>= ${nodeData.minRating}` : ""
        }${
          nodeData?.minRating != null && nodeData?.maxRating != null ? ", " : ""
        }${nodeData?.maxRating != null ? `<= ${nodeData.maxRating}` : ""}`
      : "Any rating";

  return (
    <>
      <ReviewReceivedDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseTriggerNode
        {...props}
        icon={Star}
        name="Review Received"
        description={description}
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

ReviewReceivedNode.displayName = "ReviewReceivedNode";

"use client";

import { type NodeProps, useReactFlow } from "@xyflow/react";
import { MessageSquare } from "lucide-react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "@/features/nodes/components/BaseExecutionNode";
import { useNodeStatus } from "@/features/nodes/hooks/use-node-status";
import { fetchSendSmsRealtimeToken } from "./actions";
import { SEND_SMS_CHANNEL_NAME } from "./channel";
import { SendSmsDialog } from "./dialog";

type SendSmsNodeData = { messageBody?: string };

export const SendSmsNode = memo((props: NodeProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const handleOpenSettings = () => setDialogOpen(true);

  const handleSubmit = (values: { messageBody: string }) => {
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
    channel: SEND_SMS_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchSendSmsRealtimeToken,
  });

  const nodeData = props.data as SendSmsNodeData | undefined;
  const body = nodeData?.messageBody;
  const description = body
    ? body.length > 40
      ? `${body.slice(0, 40)}...`
      : body
    : "Not configured";

  return (
    <>
      <SendSmsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        icon={MessageSquare}
        name="Send SMS"
        description={description}
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

SendSmsNode.displayName = "SendSmsNode";

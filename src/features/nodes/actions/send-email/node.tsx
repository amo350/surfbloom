"use client";

import type { NodeProps } from "@xyflow/react";
import { useReactFlow } from "@xyflow/react";
import { Mail } from "lucide-react";
import { memo, useState } from "react";

import { BaseExecutionNode } from "@/features/nodes/components/BaseExecutionNode";
import { useNodeStatus } from "@/features/nodes/hooks/use-node-status";
import { fetchSendEmailRealtimeToken } from "./actions";
import { SendEmailDialog } from "./dialog";

type SendEmailNodeType = { subject?: string; htmlBody?: string };

export const SendEmailNode = memo((props: NodeProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const handleOpenSettings = () => setDialogOpen(true);
  const handleSubmit = (values: { subject: string; htmlBody: string }) => {
    setNodes((nodes) =>
      nodes.map((n) =>
        n.id === props.id ? { ...n, data: { ...n.data, ...values } } : n,
      ),
    );
  };

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: "send-email-execution",
    topic: "status",
    refreshToken: fetchSendEmailRealtimeToken,
  });

  const nodeData = props.data as SendEmailNodeType | undefined;
  const subj = nodeData?.subject;
  const description = subj
    ? subj.length > 35
      ? `${subj.slice(0, 35)}...`
      : subj
    : "Not configured";

  return (
    <>
      <SendEmailDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon={Mail}
        name="Send Email"
        description={description}
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

SendEmailNode.displayName = "SendEmailNode";

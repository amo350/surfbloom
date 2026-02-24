"use client";

import type { NodeProps } from "@xyflow/react";
import { useReactFlow } from "@xyflow/react";
import { UserPlus } from "lucide-react";
import { memo, useState } from "react";
import { BaseTriggerNode } from "@/features/nodes/components/BaseTriggerNode";
import { useNodeStatus } from "@/features/nodes/hooks/use-node-status";
import { fetchContactCreatedRealtimeToken } from "./actions";
import { ContactCreatedDialog } from "./dialog";

export const ContactCreatedNode = memo(
  (props: NodeProps) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const handleOpenSettings = () => setDialogOpen(true);

    const handleSubmit = (values: { source?: string }) => {
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
      channel: "contact-created-trigger",
      topic: "status",
      refreshToken: fetchContactCreatedRealtimeToken,
    });

    const nodeData = props.data;
    const description = nodeData?.source
      ? `Source: ${nodeData.source}`
      : "Any source";

    return (
      <>
        <ContactCreatedDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={handleSubmit}
          defaultValues={nodeData}
        />
        <BaseTriggerNode
          {...props}
          icon={UserPlus}
          name="Contact Created"
          description={description}
          status={nodeStatus}
          onSettings={handleOpenSettings}
          onDoubleClick={handleOpenSettings}
        />
      </>
    );
  },
);

ContactCreatedNode.displayName = "ContactCreatedNode";

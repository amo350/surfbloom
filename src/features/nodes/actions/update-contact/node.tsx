"use client";

import { type NodeProps, useReactFlow } from "@xyflow/react";
import { UserCog } from "lucide-react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "@/features/nodes/components/BaseExecutionNode";
import { useNodeStatus } from "@/features/nodes/hooks/use-node-status";
import { fetchUpdateContactRealtimeToken } from "./actions";
import { UpdateContactDialog } from "./dialog";

type ContactAction =
  | "update_stage"
  | "add_category"
  | "remove_category"
  | "log_note"
  | "assign_contact";

type UpdateContactNodeData = {
  action?: ContactAction;
  stage?: string;
  categoryName?: string;
  noteTemplate?: string;
  assigneeId?: string;
};

const ACTION_LABELS: Record<string, string> = {
  update_stage: "Update Stage",
  add_category: "Add Category",
  remove_category: "Remove Category",
  log_note: "Log Note",
  assign_contact: "Assign Contact",
};

export const UpdateContactNode = memo((props: NodeProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const handleOpenSettings = () => setDialogOpen(true);

  const handleSubmit = (values: UpdateContactNodeData) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === props.id ? { ...node, data: { ...node.data, ...values } } : node,
      ),
    );
  };

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: "update-contact-execution",
    topic: "status",
    refreshToken: fetchUpdateContactRealtimeToken,
  });

  const data = props.data as UpdateContactNodeData | undefined;
  const actionLabel = ACTION_LABELS[data?.action || ""] || "Not configured";

  let detail = "";
  switch (data?.action) {
    case "update_stage":
      detail = data.stage ? `-> ${data.stage}` : "";
      break;
    case "add_category":
      detail = data.categoryName ? `+ ${data.categoryName}` : "";
      break;
    case "remove_category":
      detail = data.categoryName ? `- ${data.categoryName}` : "";
      break;
    case "log_note":
      detail = data.noteTemplate
        ? data.noteTemplate.length > 25
          ? `${data.noteTemplate.slice(0, 25)}...`
          : data.noteTemplate
        : "";
      break;
    case "assign_contact":
      detail = data.assigneeId ? "-> member" : "";
      break;
  }

  const description = detail ? `${actionLabel}: ${detail}` : actionLabel;

  return (
    <>
      <UpdateContactDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={data}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon={UserCog}
        name="Update Contact"
        description={description}
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

UpdateContactNode.displayName = "UpdateContactNode";

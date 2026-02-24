"use client";

import type { NodeProps } from "@xyflow/react";
import { useReactFlow } from "@xyflow/react";
import { CheckSquare } from "lucide-react";
import { memo, useState } from "react";

import { BaseExecutionNode } from "@/features/nodes/components/BaseExecutionNode";
import { useNodeStatus } from "@/features/nodes/hooks/use-node-status";
import { fetchCreateTaskRealtimeToken } from "./actions";
import { CreateTaskDialog } from "./dialog";

type CreateTaskNodeType = {
  titleTemplate?: string;
  descriptionTemplate?: string;
  assigneeId?: string;
  priority?: string;
  dueDateOffset?: number;
  columnId?: string;
};

export const CreateTaskNode = memo((props: NodeProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const handleOpenSettings = () => setDialogOpen(true);
  const handleSubmit = (values: CreateTaskNodeType) => {
    setNodes((nodes) =>
      nodes.map((n) =>
        n.id === props.id ? { ...n, data: { ...n.data, ...values } } : n,
      ),
    );
  };

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: "create-task-execution",
    topic: "status",
    refreshToken: fetchCreateTaskRealtimeToken,
  });

  const nodeData = props.data as CreateTaskNodeType | undefined;
  const title = nodeData?.titleTemplate;
  const description = title
    ? title.length > 35
      ? `${title.slice(0, 35)}...`
      : title
    : "Not configured";

  return (
    <>
      <CreateTaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon={CheckSquare}
        name="Create Task"
        description={description}
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

CreateTaskNode.displayName = "CreateTaskNode";

"use client";

import { type NodeProps, Position, useReactFlow } from "@xyflow/react";
import { GitBranch } from "lucide-react";
import { memo, useState } from "react";
import { BaseHandle } from "@/components/react-flow/base-handle";
import { BaseNode, BaseNodeContent } from "@/components/react-flow/base-node";
import { NodeStatusIndicator } from "@/components/react-flow/node-status-indicator";
import { WorkflowNode } from "@/components/WorkflowNode";
import { useNodeStatus } from "@/features/nodes/hooks/use-node-status";
import {
  CONDITION_PRESETS,
  type ConditionConfig,
  OPERATOR_LABELS,
} from "@/features/nodes/logic/lib/condition-presets";
import { fetchIfElseRealtimeToken } from "./actions";
import { IfElseDialog } from "./dialog";

type IfElseNodeData = {
  condition?: ConditionConfig;
};

export const IfElseNode = memo((props: NodeProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes, setEdges } = useReactFlow();

  const handleOpenSettings = () => setDialogOpen(true);

  const handleSubmit = (values: { condition: ConditionConfig }) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === props.id
          ? { ...node, data: { ...node.data, ...values } }
          : node,
      ),
    );
  };

  const handleDelete = () => {
    setNodes((nodes) => nodes.filter((node) => node.id !== props.id));
    setEdges((edges) =>
      edges.filter(
        (edge) => edge.source !== props.id && edge.target !== props.id,
      ),
    );
  };

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: "if-else-execution",
    topic: "status",
    refreshToken: fetchIfElseRealtimeToken,
  });

  const nodeData = props.data as IfElseNodeData | undefined;
  const condition = nodeData?.condition;
  let description = "Not configured";

  if (condition?.field) {
    if (condition.preset && condition.preset !== "custom") {
      const preset = CONDITION_PRESETS.find((p) => p.id === condition.preset);
      if (preset) {
        description =
          condition.value != null
            ? `${preset.label} ${condition.value}`
            : preset.label;
      }
    } else {
      const operatorLabel =
        OPERATOR_LABELS[condition.operator] || condition.operator;
      description =
        condition.value != null
          ? `${condition.field} ${operatorLabel} ${condition.value}`
          : `${condition.field} ${operatorLabel}`;
    }
  }

  return (
    <>
      <IfElseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <WorkflowNode
        name="If/Else"
        description={description}
        onDelete={handleDelete}
        onSettings={handleOpenSettings}
      >
        <NodeStatusIndicator status={nodeStatus} className="rounded-sm">
          <BaseNode onDoubleClick={handleOpenSettings} status={nodeStatus}>
            <BaseNodeContent>
              <GitBranch className="size-4 text-muted-foreground" />

              <BaseHandle
                id="target-1"
                type="target"
                position={Position.Left}
              />

              <BaseHandle
                id="true"
                type="source"
                position={Position.Right}
                style={{ top: "30%" }}
              />

              <BaseHandle
                id="false"
                type="source"
                position={Position.Right}
                style={{ top: "70%" }}
              />
            </BaseNodeContent>
          </BaseNode>
        </NodeStatusIndicator>
      </WorkflowNode>
    </>
  );
});

IfElseNode.displayName = "IfElseNode";

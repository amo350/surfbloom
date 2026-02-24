"use client";

import { createId } from "@paralleldrive/cuid2";
import { useReactFlow, type NodeProps } from "@xyflow/react";
import { PlusIcon } from "lucide-react";
import { memo, useCallback, useState } from "react";
import { toast } from "sonner";
import { NodeType } from "@/generated/prisma/enums";
import { NodeSelector } from "./NodeSelector";
import { PlaceholderNode } from "./react-flow/placeholder-node";
import { WorkflowNode } from "./WorkflowNode";

export const InitialNode = memo((props: NodeProps) => {
  const [selectorOpen, setSelectorOpen] = useState(false);
  const { getNodes, screenToFlowPosition, setNodes } = useReactFlow();

  const handleAddNode = useCallback(
    (type: NodeType) => {
      if (type === NodeType.MANUAL_TRIGGER) {
        const hasManualTrigger = getNodes().some(
          (node) => node.type === NodeType.MANUAL_TRIGGER,
        );
        if (hasManualTrigger) {
          toast.error("too many manual triggers");
          return;
        }
      }

      setNodes((nodes) => {
        const hasInitialTrigger = nodes.some((node) => node.type === NodeType.INITIAL);
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const position = screenToFlowPosition({
          x: centerX + (Math.random() - 0.5) * 200,
          y: centerY + (Math.random() - 0.5) * 200,
        });

        const newNode = {
          id: createId(),
          data: {},
          position,
          type,
        };

        if (hasInitialTrigger) {
          return [newNode];
        }

        return [...nodes, newNode];
      });
    },
    [getNodes, screenToFlowPosition, setNodes],
  );

  return (
    <>
      <WorkflowNode showToolbar={false}>
        <PlaceholderNode {...props} onClick={() => setSelectorOpen(true)}>
          <div className="cursor-pointer flex items-center justify-center">
            <PlusIcon />
          </div>
        </PlaceholderNode>
      </WorkflowNode>
      <NodeSelector
        open={selectorOpen}
        onOpenChange={setSelectorOpen}
        onSelect={handleAddNode}
      />
    </>
  );
});

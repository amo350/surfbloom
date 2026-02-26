"use client";

import { createId } from "@paralleldrive/cuid2";
import { useReactFlow } from "@xyflow/react";
import { PlusIcon } from "lucide-react";
import { memo, useCallback } from "react";
import { toast } from "sonner";
import { NodeSelector } from "@/components/NodeSelector";
import { Button } from "@/components/ui/button";
import { NodeType } from "@/generated/prisma/enums";

interface AddNodeButtonProps {
  selectorOpen: boolean;
  onSelectorOpenChange: (open: boolean) => void;
}

export const AddNodeButton = memo(
  ({ selectorOpen, onSelectorOpenChange }: AddNodeButtonProps) => {
    const { screenToFlowPosition, setNodes } = useReactFlow();

    const handleAddNode = useCallback(
      (type: NodeType) => {
        setNodes((nodes) => {
          if (type === NodeType.MANUAL_TRIGGER) {
            const hasManualTrigger = nodes.some(
              (node) => node.type === NodeType.MANUAL_TRIGGER,
            );
            if (hasManualTrigger) {
              toast.error("too many manual triggers");
              return nodes;
            }
          }

          const hasInitialTrigger = nodes.some(
            (node) => node.type === NodeType.INITIAL,
          );
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
      [screenToFlowPosition, setNodes],
    );

    return (
      <>
        <Button
          onClick={() => onSelectorOpenChange(true)}
          size="icon"
          className="h-9 w-9 rounded-full border border-black/10 bg-[linear-gradient(to_bottom,#FCF9F5,#F8F3ED)] text-black hover:brightness-95"
          aria-label="Add node"
          title="Add node (⌘K)"
        >
          <PlusIcon className="size-4" />
        </Button>
        <NodeSelector
          open={selectorOpen}
          onOpenChange={onSelectorOpenChange}
          onSelect={handleAddNode}
        />
      </>
    );
  },
);

AddNodeButton.displayName = "AddNodeButton";

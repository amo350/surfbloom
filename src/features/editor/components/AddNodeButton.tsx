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
          size="sm"
          variant="outline"
          className="bg-background"
        >
          <PlusIcon className="mr-1.5 size-3.5" />
          Add Node
          <kbd className="ml-2 rounded border bg-muted px-1 py-0.5 text-[9px] text-muted-foreground">
            ⌘K
          </kbd>
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

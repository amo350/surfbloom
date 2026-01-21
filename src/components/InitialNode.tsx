"useClient";

import type { NodeProps } from "@xyflow/react";
import { PlusIcon } from "lucide-react";
import { memo, useState } from "react";
import { NodeSelector } from "./NodeSelector";
import { PlaceholderNode } from "./react-flow/placeholder-node";
import { WorkflowNode } from "./WorkflowNode";

export const InitialNode = memo((props: NodeProps) => {
  const [selectorOpen, setSelectorOpen] = useState(false);
  return (
    <NodeSelector open={selectorOpen} onOpenChange={setSelectorOpen}>
      <WorkflowNode showToolbar={false}>
        <PlaceholderNode {...props} onClick={() => setSelectorOpen(true)}>
          <div className="cursor-pointer flex items-center justify-center">
            <PlusIcon />
          </div>
        </PlaceholderNode>
      </WorkflowNode>
    </NodeSelector>
  );
});

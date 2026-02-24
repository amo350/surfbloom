"use client";

import type { NodeProps } from "@xyflow/react";
import { useReactFlow } from "@xyflow/react";
import { Clock } from "lucide-react";
import { memo, useState } from "react";
import { BaseTriggerNode } from "@/features/nodes/components/BaseTriggerNode";
import { useNodeStatus } from "@/features/nodes/hooks/use-node-status";
import { fetchScheduleRealtimeToken } from "./actions";
import { ScheduleDialog } from "./dialog";

interface ScheduleNodeData {
  frequency?: string;
  hour?: number;
  minute?: number;
  dayOfWeek?: number;
  dayOfMonth?: number;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const ScheduleNode = memo((props: NodeProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const handleOpenSettings = () => setDialogOpen(true);

  const handleSubmit = (values: ScheduleNodeData) => {
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
    channel: "schedule-trigger",
    topic: "status",
    refreshToken: fetchScheduleRealtimeToken,
  });

  const nodeData = props.data as ScheduleNodeData | undefined;
  let description = "Not configured";
  if (nodeData?.frequency) {
    const time =
      nodeData.hour != null
        ? `${String(nodeData.hour).padStart(2, "0")}:${String(
            nodeData.minute ?? 0,
          ).padStart(2, "0")} UTC`
        : "";

    switch (nodeData.frequency) {
      case "daily":
        description = `Daily at ${time}`;
        break;
      case "weekly":
        description = `${DAY_NAMES[nodeData.dayOfWeek ?? 0]}s at ${time}`;
        break;
      case "monthly":
        description = `${nodeData.dayOfMonth ?? 1}${ordinal(
          nodeData.dayOfMonth ?? 1,
        )} at ${time}`;
        break;
      default:
        break;
    }
  }

  return (
    <>
      <ScheduleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseTriggerNode
        {...props}
        icon={Clock}
        name="Schedule"
        description={description}
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

ScheduleNode.displayName = "ScheduleNode";

function ordinal(n: number): string {
  const v = n % 100;
  if (v >= 11 && v <= 13) return "th";
  const d = v % 10;
  if (d === 1) return "st";
  if (d === 2) return "nd";
  if (d === 3) return "rd";
  return "th";
}

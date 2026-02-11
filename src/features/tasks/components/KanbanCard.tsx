"use client";

import { useState } from "react";
import { MoreHorizontalIcon, SquareIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { TaskActions } from "./TaskActions";

type KanbanCardProps = {
  id: string;
  name: string;
  taskNumber: number;
  statusColor: string;
  creatorName: string;
  workspaceId: string;
  isSelected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  onOpenTask: (id: string) => void;
  returnUrl?: string;
};

export const KanbanCard = ({
  id,
  name,
  taskNumber,
  statusColor,
  creatorName,
  workspaceId,
  isSelected,
  onSelect,
  onOpenTask,
  returnUrl,
}: KanbanCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  // Get initials from creator name (first 3 letters of email prefix or name); safe fallback when empty
  const creatorInitials = creatorName?.trim()
    ? creatorName.split("@")[0].slice(0, 3).toUpperCase()
    : "???";

  return (
    <div
      className="bg-card border rounded-md mb-0.5 cursor-grab active:cursor-grabbing"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onOpenTask(id)}
    >
      <div className="p-2">
        {/* Top row: shape + task number + separator + creator + actions */}
        <div className="flex items-center justify-between gap-1.5 mb-1">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            {/* Status shape with color */}
            <div
              className="size-3 rounded-sm flex items-center justify-center shrink-0"
              style={{ backgroundColor: statusColor }}
            >
              <SquareIcon className="size-2 text-white" />
            </div>
            <span className="font-mono">#{taskNumber}</span>
            <div className="w-px h-2.5 bg-border shrink-0" />
            <span>@{creatorInitials}</span>
          </div>

          <div className="flex items-center gap-0.5 shrink-0 justify-end min-w-12">
            {/* Always in DOM so card doesn't grow on hover; visibility toggled */}
            <div
              className={
                isHovered || isSelected
                  ? "visible"
                  : "invisible pointer-events-none"
              }
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => onSelect(id, !!checked)}
                onClick={(e) => e.stopPropagation()}
                className="size-3"
              />
            </div>
            <div
              className={
                isHovered ? "visible" : "invisible pointer-events-none"
              }
            >
              <TaskActions
                taskId={id}
                workspaceId={workspaceId}
                onOpenTask={onOpenTask}
                returnUrl={returnUrl}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontalIcon className="size-3 text-muted-foreground" />
                </Button>
              </TaskActions>
            </div>
          </div>
        </div>

        {/* Bottom row: task name */}
        <p className="text-xs font-medium line-clamp-2 leading-tight">
          {name || "Untitled task"}
        </p>
      </div>
    </div>
  );
};

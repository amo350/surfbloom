"use client";

import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type KanbanColumnHeaderProps = {
  title: string;
  color: string;
  count: number;
  onAddTask?: () => void;
};

export const KanbanColumnHeader = ({
  title,
  color,
  count,
  onAddTask,
}: KanbanColumnHeaderProps) => {
  return (
    <div className="flex items-center px-2 py-1.5">
      <div className="flex-1 min-w-0" />
      <div className="flex items-center gap-x-2 shrink-0">
        <h3 className="font-medium text-sm">{title}</h3>
        <span className="text-xs text-muted-foreground">({count})</span>
      </div>
      <div className="flex-1 flex justify-end min-w-0">
        {onAddTask && (
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            onClick={onAddTask}
          >
            <PlusIcon className="size-4 text-muted-foreground" />
          </Button>
        )}
      </div>
    </div>
  );
};

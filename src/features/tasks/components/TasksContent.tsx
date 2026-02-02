"use client";

import { useEffect, useRef } from "react";
import { useGetTasks } from "../hooks/use-tasks";
import {
  useGetTaskColumns,
  useCreateTaskColumn,
} from "../hooks/use-task-columns";
import { KanbanSkeleton } from "./KanbanSkeleton";

type TasksContentProps = {
  workspaceId: string;
  columnId?: string | null;
  assigneeId?: string | null;
  onTaskClick?: (taskId: string) => void;
};

const DEFAULT_COLUMNS = [
  { name: "Overdue", color: "#EF4444", position: 1 },
  { name: "Priority 1", color: "#F97316", position: 2 },
  { name: "Priority 2", color: "#3B82F6", position: 3 },
  { name: "Completed", color: "#10B981", position: 4 },
  { name: "Verified", color: "#8B5CF6", position: 5 },
];

export const TasksContent = ({
  workspaceId,
  columnId,
  assigneeId,
  onTaskClick,
}: TasksContentProps) => {
  const { data: tasks, isLoading: tasksLoading } = useGetTasks({
    workspaceId,
    ...(columnId && { columnId }),
    ...(assigneeId && { assigneeId }),
  });
  const { data: columns, isLoading: columnsLoading } =
    useGetTaskColumns(workspaceId);
  const createColumn = useCreateTaskColumn();

  // Track if we've already attempted to seed columns
  const hasSeededRef = useRef(false);

  // Auto-create default columns for workspaces that don't have any
  useEffect(() => {
    if (
      !columnsLoading &&
      columns &&
      columns.length === 0 &&
      !hasSeededRef.current
    ) {
      hasSeededRef.current = true;
      DEFAULT_COLUMNS.forEach((col) => {
        createColumn.mutate({
          workspaceId,
          name: col.name,
          color: col.color,
        });
      });
    }
  }, [columnsLoading, columns, workspaceId, createColumn]);

  if (tasksLoading || columnsLoading || (columns && columns.length === 0)) {
    return <KanbanSkeleton />;
  }

  const taskCount = tasks?.length ?? 0;
  const columnCount = columns?.length ?? 0;

  return (
    <div className="h-full">
      <div className="border rounded-lg p-8 text-center text-muted-foreground">
        Loaded {taskCount} task{taskCount !== 1 ? "s" : ""} across {columnCount}{" "}
        column{columnCount !== 1 ? "s" : ""}
      </div>
    </div>
  );
};

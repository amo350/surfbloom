"use client";

import { useEffect, useRef } from "react";
import { useGetTasks } from "../hooks/use-tasks";
import {
  useGetTaskColumns,
  useCreateTaskColumn,
} from "../hooks/use-task-columns";
import { KanbanSkeleton } from "./KanbanSkeleton";
import { TaskTable } from "./TaskTable";
import { KanbanBoard } from "./KanbanBoard";
import { TaskCalendar } from "./TaskCalendar";
import { TaskRow } from "./TaskTableColumns";

type TaskView = "table" | "kanban" | "calendar";

type TasksContentProps = {
  workspaceId: string;
  columnId?: string | null;
  assigneeId?: string | null;
  view: TaskView;
  onTaskClick?: (taskId: string) => void;
  onSelectionChange?: (selectedTasks: TaskRow[]) => void;
  selectedTaskIds?: string[];
  onTaskSelect?: (taskId: string, selected: boolean) => void;
  returnUrl?: string;
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
  view,
  onTaskClick,
  onSelectionChange,
  selectedTaskIds = [],
  onTaskSelect,
  returnUrl,
}: TasksContentProps) => {
  const { data: tasks, isLoading: tasksLoading } = useGetTasks({
    workspaceId,
    ...(columnId && { columnId }),
    ...(assigneeId && { assigneeId }),
  });
  const { data: columns, isLoading: columnsLoading } =
    useGetTaskColumns(workspaceId);
  const createColumn = useCreateTaskColumn();

  const hasSeededRef = useRef(false);

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

  const handleTaskClick = (taskId: string) => {
    onTaskClick?.(taskId);
  };

  const handleSelectionChange = (selectedTasks: TaskRow[]) => {
    onSelectionChange?.(selectedTasks);
  };

  const handleTaskSelect = (taskId: string, selected: boolean) => {
    onTaskSelect?.(taskId, selected);
  };

  // TABLE VIEW
  if (view === "table") {
    return (
      <TaskTable
        tasks={(tasks as TaskRow[]) ?? []}
        workspaceId={workspaceId}
        onTaskClick={handleTaskClick}
        onSelectionChange={handleSelectionChange}
        returnUrl={returnUrl}
      />
    );
  }

  // KANBAN VIEW
  if (view === "kanban") {
    return (
      <KanbanBoard
        tasks={tasks ?? []}
        columns={columns ?? []}
        workspaceId={workspaceId}
        selectedTaskIds={selectedTaskIds}
        onTaskSelect={handleTaskSelect}
        onOpenTask={handleTaskClick}
        returnUrl={returnUrl}
      />
    );
  }

  // CALENDAR VIEW
  if (view === "calendar") {
    return (
      <div className="h-full overflow-hidden">
      <TaskCalendar
        tasks={tasks ?? []}
        workspaceId={workspaceId}
        onTaskClick={handleTaskClick}
      />
      </div>
    );
  }

  return null;
};

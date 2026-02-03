"use client";

import { useMemo } from "react";
import { DataTable } from "@/components/DataTable";
import { getTaskTableColumns, TaskRow } from "./TaskTableColumns";

type TaskTableProps = {
  tasks: TaskRow[];
  workspaceId: string;
  onTaskClick: (taskId: string) => void;
  onSelectionChange: (selectedTasks: TaskRow[]) => void;
  returnUrl?: string;
};

export const TaskTable = ({
  tasks,
  workspaceId,
  onTaskClick,
  onSelectionChange,
  returnUrl,
}: TaskTableProps) => {
  const columns = useMemo(
    () =>
      getTaskTableColumns({
        workspaceId,
        onOpenTask: onTaskClick,
        returnUrl,
      }),
    [workspaceId, onTaskClick, returnUrl],
  );

  return (
    <DataTable
      columns={columns}
      data={tasks}
      onRowClick={(row) => onTaskClick(row.id)}
      onSelectionChange={onSelectionChange}
      enableSelection
    />
  );
};

"use client";

import {
  CalendarIcon,
  CheckCircleIcon,
  GridIcon,
  UserIcon,
  StarIcon,
  XIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { DatePicker } from "@/components/DatePicker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useGetTaskColumns } from "../hooks/use-task-columns";
import { useGetTask, useUpdateTask } from "../hooks/use-tasks";

type TaskAttributesProps = {
  taskId: string;
  workspaceId: string;
};

type AttributeRowProps = {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
};

const AttributeRow = ({ icon, label, children }: AttributeRowProps) => (
  <div className="flex items-center justify-between py-4 px-5">
    <div className="flex items-center gap-3 text-muted-foreground">
      {icon}
      <span className="text-sm">{label}</span>
    </div>
    <div>{children}</div>
  </div>
);

function LinkedReviewRow({
  taskId,
  workspaceId,
}: {
  taskId: string;
  workspaceId: string;
}) {
  const { data: task } = useGetTask(taskId, workspaceId);
  const updateTask = useUpdateTask();
  const [isHovered, setIsHovered] = useState(false);

  const handleRemove = () => {
    updateTask.mutate({ id: taskId, workspaceId, reviewId: null });
  };

  return (
    <div className="flex items-center justify-between py-4 px-5">
      <div className="flex items-center gap-3 text-muted-foreground">
        <StarIcon className="size-4" />
        <span className="text-sm">Review</span>
      </div>
      <div>
        {task?.reviewId ? (
          <div
            className="flex items-center gap-2"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/20 px-2.5 py-1 ring-1 ring-amber-200/60 dark:ring-amber-800/30">
              <StarIcon className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                Linked
              </span>
            </div>
            {isHovered && (
              <button
                type="button"
                onClick={handleRemove}
                className="flex items-center justify-center size-5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              >
                <XIcon className="size-3" />
              </button>
            )}
          </div>
        ) : (
          <span className="text-sm text-muted-foreground/50">—</span>
        )}
      </div>
    </div>
  );
}

export const TaskAttributes = ({
  taskId,
  workspaceId,
}: TaskAttributesProps) => {
  const { data: task } = useGetTask(taskId, workspaceId);
  const { data: columns } = useGetTaskColumns(workspaceId);
  const updateTask = useUpdateTask();

  // Local state for immediate UI feedback
  const [localColumnId, setLocalColumnId] = useState<string>("");
  const [localStartDate, setLocalStartDate] = useState<Date | undefined>();
  const [localDueDate, setLocalDueDate] = useState<Date | undefined>();

  // Sync local state when task data loads/changes
  useEffect(() => {
    if (task) {
      setLocalColumnId(task.columnId ?? "");
      setLocalStartDate(task.startDate ? new Date(task.startDate) : undefined);
      setLocalDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
    }
  }, [task]);

  const handleStatusChange = (columnId: string) => {
    // Update local state immediately
    setLocalColumnId(columnId);
    // Then sync to server
    updateTask.mutate({ id: taskId, workspaceId, columnId });
  };

  const handleStartDateChange = (date: Date | undefined) => {
    setLocalStartDate(date);
    updateTask.mutate({
      id: taskId,
      workspaceId,
      startDate: date ?? null,
    });
  };

  const handleDueDateChange = (date: Date | undefined) => {
    setLocalDueDate(date);
    updateTask.mutate({
      id: taskId,
      workspaceId,
      dueDate: date ?? null,
    });
  };

  // TODO: Fetch workspace members and populate assignee options
  // TODO: Make categories configurable per workspace

  return (
    <div className="py-2">
      {/* Status */}
      <AttributeRow
        icon={<CheckCircleIcon className="size-4" />}
        label="Status"
      >
        <Select value={localColumnId} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-32 h-8 text-sm">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {columns?.map((column) => (
              <SelectItem key={column.id} value={column.id}>
                <div className="flex items-center gap-2">
                  <div
                    className="size-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: column.color }}
                  />
                  {column.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </AttributeRow>

      <Separator />

      {/* Category */}
      <AttributeRow icon={<GridIcon className="size-4" />} label="Category">
        <Select>
          <SelectTrigger className="w-32 h-8 text-sm">
            <SelectValue placeholder="—" />
          </SelectTrigger>
          <SelectContent>
            {/* TODO: Populate from configurable workspace categories */}
            <SelectItem value="bug">Bug</SelectItem>
            <SelectItem value="feature">Feature</SelectItem>
            <SelectItem value="improvement">Improvement</SelectItem>
          </SelectContent>
        </Select>
      </AttributeRow>

      <Separator />

      {/* Assignee */}
      <AttributeRow icon={<UserIcon className="size-4" />} label="Assignee">
        <Select>
          <SelectTrigger className="w-32 h-8 text-sm">
            <SelectValue placeholder="—" />
          </SelectTrigger>
          <SelectContent>
            {/* TODO: Populate from workspace members */}
            <SelectItem value="unassigned">Unassigned</SelectItem>
          </SelectContent>
        </Select>
      </AttributeRow>

      <Separator />

      {/* Start date */}
      <AttributeRow
        icon={<CalendarIcon className="size-4" />}
        label="Start date"
      >
        <DatePicker
          value={localStartDate}
          onChange={handleStartDateChange}
          placeholder="—"
        />
      </AttributeRow>

      <Separator />

      {/* Due date */}
      <AttributeRow icon={<CalendarIcon className="size-4" />} label="Due date">
        <DatePicker
          value={localDueDate}
          onChange={handleDueDateChange}
          placeholder="—"
        />
      </AttributeRow>

      <Separator />

      {/* Linked Review */}
      <LinkedReviewRow taskId={taskId} workspaceId={workspaceId} />
    </div>
  );
};

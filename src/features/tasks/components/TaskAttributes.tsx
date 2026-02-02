"use client";

import { useState, useMemo } from "react";
import {
  CheckCircleIcon,
  ChevronDownIcon,
  GridIcon,
  UserIcon,
  CalendarIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DatePicker } from "@/components/DatePicker";
import { useGetTask, useUpdateTask } from "../hooks/use-tasks";
import { useGetTaskColumns } from "../hooks/use-task-columns";

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

type SearchSelectOption = { value: string; label: string };

/**
 * When closed: "—" + down arrow in the attribute row.
 * When open: that same space becomes the search field inline; the list dropdown appears below.
 */
function AttributeSearchSelect({
  value,
  onChange,
  options,
  placeholder = "—",
}: {
  value: string | null;
  onChange: (value: string | null) => void;
  options: SearchSelectOption[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selectedLabel = value
    ? options.find((o) => o.value === value)?.label ?? placeholder
    : placeholder;
  const filtered = useMemo(
    () =>
      search.trim()
        ? options.filter((o) =>
            o.label.toLowerCase().includes(search.toLowerCase()),
          )
        : options,
    [options, search],
  );

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setSearch("");
    setOpen(false);
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setSearch("");
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <div className="h-8 w-full max-w-36 flex items-center justify-end rounded-md">
          {open ? (
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-7 w-28 text-xs rounded-md"
              autoFocus
            />
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 w-full justify-end gap-1 text-sm font-normal",
                !value && "text-muted-foreground",
              )}
            >
              <span>{selectedLabel}</span>
              <ChevronDownIcon className="size-4 shrink-0 opacity-50" />
            </Button>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={0}
        className="w-64 p-0 rounded-t-none border-t-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="max-h-48 overflow-y-auto p-1 min-h-[80px] border rounded-b-md">
          {filtered.length === 0 ? (
            <p className="text-xs text-muted-foreground p-2">No results</p>
          ) : (
            filtered.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={cn(
                  "w-full text-left text-sm px-2 py-1.5 rounded hover:bg-accent",
                  value === opt.value && "bg-accent",
                )}
                onClick={() => handleSelect(opt.value)}
              >
                {opt.label}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export const TaskAttributes = ({
  taskId,
  workspaceId,
}: TaskAttributesProps) => {
  const { data: task } = useGetTask(taskId, workspaceId);
  const { data: columns } = useGetTaskColumns(workspaceId);
  const updateTask = useUpdateTask();

  const handleStatusChange = (columnId: string) => {
    updateTask.mutate({ id: taskId, workspaceId, columnId });
  };

  const handleStartDateChange = (date: Date | undefined) => {
    updateTask.mutate({
      id: taskId,
      workspaceId,
      startDate: date ?? null,
    });
  };

  const handleDueDateChange = (date: Date | undefined) => {
    updateTask.mutate({
      id: taskId,
      workspaceId,
      dueDate: date ?? null,
    });
  };

  const handleCategoryChange = (value: string | null) => {
    updateTask.mutate({
      id: taskId,
      workspaceId,
      category: value ?? null,
    });
  };

  const handleAssigneeChange = (value: string | null) => {
    updateTask.mutate({
      id: taskId,
      workspaceId,
      assigneeId: value === "unassigned" || !value ? null : value,
    });
  };

  // TODO: Fetch workspace members and populate assignee options
  // const { data: members } = useGetWorkspaceMembers(workspaceId);
  const assigneeOptions = [
    { value: "unassigned", label: "Unassigned" },
    // ...members
  ];

  const categoryOptions = [
    { value: "bug", label: "Bug" },
    { value: "feature", label: "Feature" },
    { value: "improvement", label: "Improvement" },
  ];

  return (
    <div className="py-2">
      {/* Status */}
      <AttributeRow
        icon={<CheckCircleIcon className="size-4" />}
        label="Status"
      >
        <Select value={task?.columnId ?? ""} onValueChange={handleStatusChange}>
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
        <AttributeSearchSelect
          value={task?.category ?? null}
          onChange={handleCategoryChange}
          options={categoryOptions}
          placeholder="—"
        />
      </AttributeRow>

      <Separator />

      {/* Assignee */}
      <AttributeRow icon={<UserIcon className="size-4" />} label="Assignee">
        <AttributeSearchSelect
          value={task?.assigneeId ?? null}
          onChange={handleAssigneeChange}
          options={assigneeOptions}
          placeholder="—"
        />
      </AttributeRow>

      <Separator />

      {/* Start date */}
      <AttributeRow
        icon={<CalendarIcon className="size-4" />}
        label="Start date"
      >
        <DatePicker
          value={task?.startDate ? new Date(task.startDate) : undefined}
          onChange={handleStartDateChange}
          placeholder="—"
        />
      </AttributeRow>

      <Separator />

      {/* Due date */}
      <AttributeRow icon={<CalendarIcon className="size-4" />} label="Due date">
        <DatePicker
          value={task?.dueDate ? new Date(task.dueDate) : undefined}
          onChange={handleDueDateChange}
          placeholder="—"
        />
      </AttributeRow>
    </div>
  );
};

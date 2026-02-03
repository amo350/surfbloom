"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TaskDate } from "./TaskDate";
import { TaskActions } from "./TaskActions";

export type TaskRow = {
  id: string;
  name: string;
  workspaceId: string;
  columnId: string;
  column: {
    id: string;
    name: string;
    color: string;
  };
  assignee: {
    id: string;
    name: string;
    image: string | null;
  } | null;
  dueDate: Date | string | null;
  createdAt: Date | string;
};

type ColumnOptions = {
  workspaceId: string;
  onOpenTask: (taskId: string) => void;
};

export const getTaskTableColumns = ({
  workspaceId,
  onOpenTask,
}: ColumnOptions): ColumnDef<TaskRow>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        onClick={(e) => e.stopPropagation()}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        onClick={(e) => e.stopPropagation()}
      />
    ),
    enableSorting: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4"
      >
        Task Name
        <ArrowUpDownIcon className="ml-2 size-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const name = row.original.name;
      return (
        <span className="font-medium truncate max-w-[300px] block">
          {name || "Untitled task"}
        </span>
      );
    },
  },
  {
    accessorKey: "column",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4"
      >
        Status
        <ArrowUpDownIcon className="ml-2 size-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const taskColumn = row.original.column;
      return (
        <div className="flex items-center gap-2">
          <div
            className="size-2.5 rounded-full shrink-0"
            style={{ backgroundColor: taskColumn.color }}
          />
          <span>{taskColumn.name}</span>
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      return rowA.original.column.name.localeCompare(rowB.original.column.name);
    },
  },
  {
    accessorKey: "assignee",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4"
      >
        Assignee
        <ArrowUpDownIcon className="ml-2 size-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const assignee = row.original.assignee;
      if (!assignee) {
        return <span className="text-muted-foreground">Unassigned</span>;
      }
      const initials = assignee.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
      return (
        <div className="flex items-center gap-2">
          <Avatar className="size-6">
            <AvatarImage src={assignee.image ?? undefined} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <span className="truncate max-w-[150px]">{assignee.name}</span>
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const a = rowA.original.assignee?.name ?? "";
      const b = rowB.original.assignee?.name ?? "";
      return a.localeCompare(b);
    },
  },
  {
    accessorKey: "dueDate",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4"
      >
        Due Date
        <ArrowUpDownIcon className="ml-2 size-4" />
      </Button>
    ),
    cell: ({ row }) => <TaskDate value={row.original.dueDate} />,
    sortingFn: (rowA, rowB) => {
      const a = rowA.original.dueDate
        ? new Date(rowA.original.dueDate).getTime()
        : Infinity;
      const b = rowB.original.dueDate
        ? new Date(rowB.original.dueDate).getTime()
        : Infinity;
      return a - b;
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4"
      >
        Created
        <ArrowUpDownIcon className="ml-2 size-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <TaskDate value={row.original.createdAt} neutral />
    ),
    sortingFn: (rowA, rowB) => {
      const a = new Date(rowA.original.createdAt).getTime();
      const b = new Date(rowB.original.createdAt).getTime();
      return a - b;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <TaskActions
        taskId={row.original.id}
        workspaceId={workspaceId}
        onOpenTask={onOpenTask}
      />
    ),
  },
];

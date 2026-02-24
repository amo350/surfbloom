"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  CheckSquareIcon,
  ChevronDownIcon,
  FilterIcon,
  PlusIcon,
  SquareIcon,
  Trash2Icon,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TaskViewSwitcher } from "@/features/tasks/components/TaskViewSwitcher";
import { useGetTaskColumns } from "@/features/tasks/hooks/use-task-columns";
import {
  useBulkDeleteTasks,
  useCreateTask,
} from "@/features/tasks/hooks/use-tasks";
import { useConfirm } from "@/hooks/use-confirm";
import { authClient } from "@/lib/auth-client";
import { useTRPC } from "@/trpc/client";
import { TaskRow } from "./TaskTableColumns";

const generateId = () => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `${timestamp}${randomPart}`;
};

type TaskView = "table" | "kanban" | "calendar";

type TaskHeaderProps = {
  workspaceId: string;
  view: TaskView;
  onViewChange: (view: TaskView) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  onOpenTask: (taskId: string) => void;
  selectedTasks: TaskRow[];
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
};

export const TaskHeader = ({
  workspaceId,
  view,
  onViewChange,
  showFilters,
  onToggleFilters,
  onOpenTask,
  selectedTasks,
  onSelectAll,
  onDeselectAll,
}: TaskHeaderProps) => {
  const searchParams = useSearchParams();
  const createTask = useCreateTask();
  const bulkDeleteTasks = useBulkDeleteTasks();
  const { data: columns } = useGetTaskColumns(workspaceId);
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const { data: session } = authClient.useSession();

  const [ConfirmDialog, confirm] = useConfirm(
    "Delete Tasks",
    `Are you sure you want to delete ${selectedTasks.length} task${selectedTasks.length !== 1 ? "s" : ""}? This action cannot be undone.`,
  );

  const defaultColumn =
    columns?.find((col) => col.position === 3) ?? columns?.[0];

  const handleCreateTask = () => {
    if (!defaultColumn || !session?.user?.id) return;

    const newTaskId = generateId();

    const basePath = `/workspaces/${workspaceId}/tasks`;
    const params = searchParams.toString();
    const newUrl = params
      ? `${basePath}/${newTaskId}?${params}`
      : `${basePath}/${newTaskId}`;
    window.history.pushState(null, "", newUrl);

    const optimisticTask = {
      id: newTaskId,
      workspaceId,
      columnId: defaultColumn.id,
      name: "Untitled task",
      taskNumber: null,
      description: null,
      assigneeId: session.user.id,
      contactId: null,
      dueDate: null,
      startDate: null,
      category: null,
      reviewId: null,
      position: 999999,
      createdAt: new Date(),
      updatedAt: new Date(),
      column: defaultColumn,
      assignee: {
        id: session.user.id,
        name: session.user.name,
        image: session.user.image ?? null,
      },
    };

    queryClient.setQueryData(
      trpc.tasks.getOne.queryOptions({
        id: newTaskId,
        workspaceId,
      }).queryKey,
      optimisticTask,
    );

    onOpenTask(newTaskId);

    createTask.mutate({
      id: newTaskId,
      workspaceId,
      columnId: defaultColumn.id,
      name: "Untitled task",
      assigneeId: session.user.id,
    });
  };

  const handleBulkDelete = async () => {
    if (selectedTasks.length === 0) return;

    const confirmed = await confirm();
    if (confirmed) {
      bulkDeleteTasks.mutate({
        workspaceId,
        ids: selectedTasks.map((t) => t.id),
      });
      onDeselectAll?.();
    }
  };

  const selectedCount = selectedTasks.length;

  return (
    <>
      <ConfirmDialog />
      <AppHeader>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleCreateTask}
            disabled={!defaultColumn}
          >
            <PlusIcon className="size-4" />
            New Task
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Actions
                {selectedCount > 0 && (
                  <span className="ml-1.5 rounded-full bg-primary text-primary-foreground px-1.5 py-0.5 text-xs">
                    {selectedCount}
                  </span>
                )}
                <ChevronDownIcon className="ml-1 size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem onClick={onSelectAll}>
                <CheckSquareIcon className="size-4 mr-2" />
                Select All
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onDeselectAll}
                disabled={selectedCount === 0}
              >
                <SquareIcon className="size-4 mr-2" />
                Deselect All
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleBulkDelete}
                disabled={selectedCount === 0 || bulkDeleteTasks.isPending}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2Icon className="size-4 mr-2" />
                Delete ({selectedCount})
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant={showFilters ? "secondary" : "outline"}
            size="sm"
            onClick={onToggleFilters}
          >
            <FilterIcon className="size-4" />
            Filters
          </Button>
          <TaskViewSwitcher value={view} onChange={onViewChange} />
        </div>
      </AppHeader>
    </>
  );
};

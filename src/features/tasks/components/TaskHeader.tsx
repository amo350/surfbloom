"use client";

import { PlusIcon, FilterIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { AppHeader } from "@/components/AppHeader";
import { TaskViewSwitcher } from "@/features/tasks/components/TaskViewSwitcher";
import { useCreateTask } from "@/features/tasks/hooks/use-tasks";
import { useGetTaskColumns } from "@/features/tasks/hooks/use-task-columns";
import { useTRPC } from "@/trpc/client";
import { authClient } from "@/lib/auth-client";

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
};

export const TaskHeader = ({
  workspaceId,
  view,
  onViewChange,
  showFilters,
  onToggleFilters,
  onOpenTask,
}: TaskHeaderProps) => {
  const createTask = useCreateTask();
  const { data: columns } = useGetTaskColumns(workspaceId);
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const { data: session } = authClient.useSession();

  const defaultColumn =
    columns?.find((col) => col.position === 3) ?? columns?.[0];

  const handleCreateTask = () => {
    if (!defaultColumn || !session?.user?.id) return;

    const newTaskId = generateId();

    // Seed cache with optimistic data
    const optimisticTask = {
      id: newTaskId,
      workspaceId,
      columnId: defaultColumn.id,
      name: "Untitled task",
      description: null,
      assigneeId: session.user.id,
      dueDate: null,
      startDate: null,
      category: null,
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

    // Open modal via parent (handles URL and stores previous URL)
    onOpenTask(newTaskId);

    // Create task in background
    createTask.mutate({
      id: newTaskId,
      workspaceId,
      columnId: defaultColumn.id,
      name: "Untitled task",
      assigneeId: session.user.id,
    });
  };

  return (
    <AppHeader>
      <Button size="sm" onClick={handleCreateTask} disabled={!defaultColumn}>
        <PlusIcon className="size-4" />
        New Task
      </Button>
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
  );
};

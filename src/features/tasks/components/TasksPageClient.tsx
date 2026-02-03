"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { TaskHeader } from "./TaskHeader";
import { TaskFilters } from "./TaskFilters";
import { TasksContent } from "./TasksContent";
import { TaskModal } from "./TaskModal";
import { useTaskModal } from "../hooks/use-task-modal";
import { useGetTasks } from "../hooks/use-tasks";
import { TaskRow } from "./TaskTableColumns";

type TaskView = "table" | "kanban" | "calendar";

type Filters = {
  columnId: string | null;
  categoryId: string | null;
  assigneeId: string | null;
  creatorId: string | null;
  overdue: boolean;
  watching: boolean;
};

type TasksPageClientProps = {
  workspaceId: string;
  initialTaskId?: string;
};

export const TasksPageClient = ({
  workspaceId,
  initialTaskId,
}: TasksPageClientProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [view, setView] = useState<TaskView>("kanban");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<TaskRow[]>([]);
  const taskModal = useTaskModal();

  const hasOpenedInitialRef = useRef(false);
  const previousUrlRef = useRef<string>("");

  const basePath = `/workspaces/${workspaceId}/tasks`;

  // Read initial filters from URL
  const filtersFromUrl: Filters = {
    columnId: searchParams.get("s"),
    categoryId: searchParams.get("c"),
    assigneeId: searchParams.get("a"),
    creatorId: searchParams.get("cr"),
    overdue: searchParams.get("to") === "true",
    watching: searchParams.get("w") === "true",
  };

  // Local filter state for optimistic updates (immediate UI response)
  const [filters, setFilters] = useState<Filters>(filtersFromUrl);

  // Sync local filters when URL changes (e.g., browser back/forward)
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally depend on searchParams only; filtersFromUrl is derived from it
  useEffect(() => {
    setFilters(filtersFromUrl);
  }, [searchParams]);

  const hasActiveFilters = !!(
    filters.columnId ||
    filters.categoryId ||
    filters.assigneeId ||
    filters.creatorId ||
    filters.overdue ||
    filters.watching
  );

  // Get tasks using optimistic filters (refetches immediately on filter change)
  const { data: tasks } = useGetTasks({
    workspaceId,
    ...(filters.columnId && { columnId: filters.columnId }),
    ...(filters.assigneeId && { assigneeId: filters.assigneeId }),
  });

  useEffect(() => {
    if (hasActiveFilters && !showFilters) {
      setShowFilters(true);
    }
  }, [hasActiveFilters, showFilters]);

  useEffect(() => {
    if (initialTaskId && !hasOpenedInitialRef.current) {
      hasOpenedInitialRef.current = true;
      if (!previousUrlRef.current) {
        previousUrlRef.current = basePath;
      }
      taskModal.open(initialTaskId);
    }
  }, [initialTaskId, taskModal, basePath]);

  // Handle browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const pathParts = window.location.pathname.split("/");
      const tasksIndex = pathParts.indexOf("tasks");
      const taskIdFromUrl = pathParts[tasksIndex + 1];

      if (taskIdFromUrl && taskIdFromUrl !== "tasks") {
        taskModal.open(taskIdFromUrl);
      } else {
        taskModal.close();
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [taskModal]);

  // Update both local state (immediate) and URL (async)
  const updateFilters = (newFilters: Partial<Filters>) => {
    // Update local state immediately for instant UI response
    setFilters((prev) => ({ ...prev, ...newFilters }));

    // Update URL in background
    const params = new URLSearchParams(searchParams.toString());

    if (newFilters.columnId !== undefined) {
      if (newFilters.columnId) params.set("s", newFilters.columnId);
      else params.delete("s");
    }
    if (newFilters.categoryId !== undefined) {
      if (newFilters.categoryId) params.set("c", newFilters.categoryId);
      else params.delete("c");
    }
    if (newFilters.assigneeId !== undefined) {
      if (newFilters.assigneeId) params.set("a", newFilters.assigneeId);
      else params.delete("a");
    }
    if (newFilters.creatorId !== undefined) {
      if (newFilters.creatorId) params.set("cr", newFilters.creatorId);
      else params.delete("cr");
    }
    if (newFilters.overdue !== undefined) {
      if (newFilters.overdue) params.set("to", "true");
      else params.delete("to");
    }
    if (newFilters.watching !== undefined) {
      if (newFilters.watching) params.set("w", "true");
      else params.delete("w");
    }

    const newUrl = params.toString()
      ? `${basePath}?${params.toString()}`
      : basePath;
    router.push(newUrl, { scroll: false });
  };

  const handleClearFilters = () => {
    // Clear local state immediately
    setFilters({
      columnId: null,
      categoryId: null,
      assigneeId: null,
      creatorId: null,
      overdue: false,
      watching: false,
    });
    router.push(basePath, { scroll: false });
    router.refresh();
  };

  const handleOpenTask = (taskId: string) => {
    const params = searchParams.toString();
    previousUrlRef.current = params ? `${basePath}?${params}` : basePath;
    window.history.pushState(null, "", `${basePath}/${taskId}`);
    taskModal.open(taskId);
  };

  const handleModalClose = (open: boolean) => {
    if (!open) {
      taskModal.close();
      const restoreUrl = previousUrlRef.current || basePath;
      window.history.replaceState(null, "", restoreUrl);
      previousUrlRef.current = "";
    }
  };

  const handleSelectionChange = useCallback((selected: TaskRow[]) => {
    setSelectedTasks(selected);
  }, []);

  const handleSelectAll = () => {
    if (tasks) {
      setSelectedTasks(tasks as TaskRow[]);
    }
  };

  const handleDeselectAll = () => {
    setSelectedTasks([]);
  };

  return (
    <>
      <TaskHeader
        workspaceId={workspaceId}
        view={view}
        onViewChange={setView}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters((prev) => !prev)}
        onOpenTask={handleOpenTask}
        selectedTasks={selectedTasks}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
      />

      {showFilters && (
        <TaskFilters
          workspaceId={workspaceId}
          filters={filters}
          onFiltersChange={updateFilters}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={handleClearFilters}
        />
      )}

      <div className="flex-1 p-6">
        <TasksContent
          workspaceId={workspaceId}
          columnId={filters.columnId}
          assigneeId={filters.assigneeId}
          view={view}
          onTaskClick={handleOpenTask}
          onSelectionChange={handleSelectionChange}
        />
      </div>

      <TaskModal
        open={taskModal.isOpen}
        onOpenChange={handleModalClose}
        workspaceId={workspaceId}
      />
    </>
  );
};

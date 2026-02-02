"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { TaskHeader } from "./TaskHeader";
import { TaskFilters } from "./TaskFilters";
import { TasksContent } from "./TasksContent";
import { TaskModal } from "./TaskModal";
import { useTaskModal } from "../hooks/use-task-modal";

type TaskView = "table" | "kanban" | "calendar";

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
  const taskModal = useTaskModal();

  const hasOpenedInitialRef = useRef(false);

  // Store the URL to return to when closing modal
  const previousUrlRef = useRef<string>("");

  const basePath = `/workspaces/${workspaceId}/tasks`;

  // Filter URL params
  const filters = {
    columnId: searchParams.get("s"),
    categoryId: searchParams.get("c"),
    assigneeId: searchParams.get("a"),
    creatorId: searchParams.get("cr"),
    overdue: searchParams.get("to") === "true",
    watching: searchParams.get("w") === "true",
  };

  const hasActiveFilters = !!(
    filters.columnId ||
    filters.categoryId ||
    filters.assigneeId ||
    filters.creatorId ||
    filters.overdue ||
    filters.watching
  );

  useEffect(() => {
    if (hasActiveFilters && !showFilters) {
      setShowFilters(true);
    }
  }, [hasActiveFilters, showFilters]);

  // Open modal if initialTaskId provided from route
  useEffect(() => {
    if (initialTaskId && !hasOpenedInitialRef.current) {
      hasOpenedInitialRef.current = true;
      // If coming directly to a task URL, store base path as previous
      if (!previousUrlRef.current) {
        previousUrlRef.current = basePath;
      }
      taskModal.open(initialTaskId);
    }
  }, [initialTaskId, taskModal, basePath]);

  // Update filters in URL
  const updateFilters = (newFilters: Partial<typeof filters>) => {
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
    router.push(basePath, { scroll: false });
    router.refresh();
  };

  // Open task: store current URL, then navigate to clean task URL
  const handleOpenTask = (taskId: string) => {
    // Store current URL with filters to restore later
    const params = searchParams.toString();
    previousUrlRef.current = params ? `${basePath}?${params}` : basePath;

    // Navigate to clean task URL (no filter params)
    window.history.pushState(null, "", `${basePath}/${taskId}`);
    taskModal.open(taskId);
  };

  // Close modal: restore previous URL with filters
  const handleModalClose = (open: boolean) => {
    if (!open) {
      taskModal.close();

      // Restore previous URL (with filters)
      const restoreUrl = previousUrlRef.current || basePath;
      window.history.pushState(null, "", restoreUrl);
      previousUrlRef.current = "";
    }
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
          onTaskClick={handleOpenTask}
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

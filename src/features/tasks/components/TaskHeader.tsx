"use client";

import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/AppHeader";
import { TaskViewSwitcher } from "./TaskViewSwitcher";
import { TaskModal } from "./TaskModal";
import { useTaskModal } from "../hooks/use-task-modal";

type TaskView = "table" | "kanban" | "calendar";

type TaskHeaderProps = {
  workspaceId: string;
  view?: TaskView;
  onViewChange?: (view: TaskView) => void;
};

export const TaskHeader = ({ workspaceId, view, onViewChange }: TaskHeaderProps) => {
  const taskModal = useTaskModal();
  const [internalView, setInternalView] = useState<TaskView>("table");
  const currentView = view ?? internalView;
  const handleViewChange = onViewChange ?? setInternalView;

  return (
    <>
      <AppHeader>
        <Button size="sm" onClick={() => taskModal.open()}>
          <PlusIcon className="size-4" />
          New Task
        </Button>
        <div className="ml-auto">
          <TaskViewSwitcher value={currentView} onChange={handleViewChange} />
        </div>
      </AppHeader>

      <TaskModal
        open={taskModal.isOpen}
        onOpenChange={(open) => {
          if (!open) taskModal.close();
        }}
        workspaceId={workspaceId}
      />
    </>
  );
};

"use client";

import { MoreVerticalIcon, ExternalLinkIcon, TrashIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteTask } from "../hooks/use-tasks";
import { useTaskModal } from "../hooks/use-task-modal";
import { useConfirm } from "@/hooks/use-confirm";

type TaskActionsProps = {
  taskId: string;
  workspaceId: string;
  onOpenTask: (taskId: string) => void;
};

export const TaskActions = ({
  taskId,
  workspaceId,
  onOpenTask,
}: TaskActionsProps) => {
  const deleteTask = useDeleteTask();
  const taskModal = useTaskModal();
  const [ConfirmDialog, confirm] = useConfirm(
    "Delete Task",
    "Are you sure you want to delete this task? This action cannot be undone.",
  );

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = await confirm();
    if (confirmed) {
      // Close modal if this task is currently open
      if (taskModal.taskId === taskId) {
        taskModal.close();
        // Clear URL
        const basePath = window.location.pathname.replace(/\/[^/]+$/, "");
        window.history.replaceState(null, "", basePath);
      }
      deleteTask.mutate({ id: taskId, workspaceId });
    }
  };

  const handleOpenTask = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenTask(taskId);
  };

  return (
    <>
      <ConfirmDialog />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="size-8">
            <MoreVerticalIcon className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleOpenTask}>
            <ExternalLinkIcon className="size-4 mr-2" />
            Open Task
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleDelete}
            disabled={deleteTask.isPending}
            className="text-red-600 focus:text-red-600"
          >
            <TrashIcon className="size-4 mr-2" />
            Delete Task
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

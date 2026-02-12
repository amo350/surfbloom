"use client";

import { ExternalLinkIcon, MoreVerticalIcon, TrashIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useConfirm } from "@/hooks/use-confirm";
import { useTaskModal } from "../hooks/use-task-modal";
import { useDeleteTask } from "../hooks/use-tasks";

type TaskActionsProps = {
  taskId: string;
  workspaceId: string;
  onOpenTask: (taskId: string) => void;
  returnUrl?: string;
  children?: React.ReactNode;
};

export const TaskActions = ({
  taskId,
  workspaceId,
  onOpenTask,
  returnUrl,
  children,
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
      if (taskModal.taskId === taskId) {
        taskModal.close();
        if (returnUrl) {
          window.history.replaceState(null, "", returnUrl);
        }
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
          {children ?? (
            <Button variant="ghost" size="icon" className="size-8">
              <MoreVerticalIcon className="size-4" />
            </Button>
          )}
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

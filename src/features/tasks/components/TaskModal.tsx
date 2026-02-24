"use client";

import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useTaskModal } from "../hooks/use-task-modal";
import { useGetTask, useUpdateTask } from "../hooks/use-tasks";
import { TaskAttributes } from "./TaskAttributes";
import { TaskMessaging } from "./TaskMessenger";
import { TaskModalHeader } from "./TaskModalHeader";

// TODO: Future — sync taskId to URL as query param (e.g., /tasks?task=abc123) for shareable links

type TaskModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
};

export const TaskModal = ({
  open,
  onOpenChange,
  workspaceId,
}: TaskModalProps) => {
  const taskModal = useTaskModal();
  const { data: task, isLoading } = useGetTask(
    taskModal.taskId ?? "",
    workspaceId,
  );
  const updateTask = useUpdateTask();

  const taskNumber = task?.taskNumber ?? null;
  const statusColor = task?.column?.color ?? "#6B7280";
  const creatorEmail = task?.assignee?.name ?? "user";

  const handleTitleChange = (newTitle: string) => {
    if (!task) return;
    updateTask.mutate({
      id: task.id,
      workspaceId,
      name: newTitle,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[800px] w-[58vw] h-[75vh] max-h-[75vh] sm:max-w-[800px] p-0 gap-0 flex flex-col overflow-hidden [&>button]:hidden"
        aria-label="Task"
        aria-describedby={undefined}
      >
        {/* One row: left column, separator (full height), right column — separator runs through header */}
        <div className="flex flex-1 min-h-0">
          {/* Left: header left + messenger */}
          <div className="w-2/3 flex flex-col overflow-hidden min-w-0">
            <div className="flex items-center gap-5 min-w-0 px-8 py-5 border-b bg-background shrink-0 min-h-[72px]">
              <TaskModalHeader
                taskNumber={taskNumber}
                title={
                  task?.name && task.name !== "Untitled task" ? task.name : ""
                }
                statusColor={statusColor}
                creatorEmail={creatorEmail}
                onTitleChange={handleTitleChange}
              />
            </div>
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <TaskMessaging taskId={task?.id ?? ""} />
            </div>
          </div>

          <Separator orientation="vertical" className="h-full shrink-0" />

          {/* Right: header right + attributes */}
          <div className="w-1/3 flex flex-col overflow-hidden min-w-0 bg-muted/20">
            <div className="flex items-center gap-5 shrink-0 pl-4 pr-6 py-5 border-b bg-background min-h-[72px] -mt-1">
              <span className="text-sm font-medium text-muted-foreground">
                Task Attributes
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="ml-auto"
              >
                <XIcon className="size-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0">
              {task ? (
                <TaskAttributes taskId={task.id} workspaceId={workspaceId} />
              ) : isLoading ? (
                <div className="p-6 text-sm text-muted-foreground">
                  Loading...
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

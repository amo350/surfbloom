"use client";

import { XIcon } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TaskModalHeader } from "./TaskModalHeader";
import { TaskMessaging } from "./TaskMessenger";
import { TaskAttributes } from "./TaskAttributes";

type TaskModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: {
    id: string;
    taskNumber: number;
    title: string;
    statusColor: string;
    creatorEmail: string;
  };
  workspaceId: string;
};

export const TaskModal = ({
  open,
  onOpenChange,
  task,
  workspaceId,
}: TaskModalProps) => {
  const displayTask = task ?? {
    id: "",
    taskNumber: 0,
    title: "New Task",
    statusColor: "#6B7280",
    creatorEmail: "user@example.com",
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
                taskNumber={displayTask.taskNumber}
                title={displayTask.title}
                statusColor={displayTask.statusColor}
                creatorEmail={displayTask.creatorEmail}
                onTitleChange={(newTitle) => {
                  console.log("Title changed to:", newTitle);
                }}
              />
            </div>
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <TaskMessaging taskId={displayTask.id} />
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
              <TaskAttributes task={displayTask} workspaceId={workspaceId} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

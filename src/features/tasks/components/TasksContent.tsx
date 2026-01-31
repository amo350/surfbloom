"use client";

import { useState } from "react";

type TaskView = "table" | "kanban" | "calendar";

type TasksContentProps = {
  workspaceId: string;
};

export const TasksContent = ({ workspaceId }: TasksContentProps) => {
  const [view, setView] = useState<TaskView>("kanban");

  return (
    <div className="h-full">
      {view === "table" && (
        <div className="border rounded-lg p-8 text-center text-muted-foreground">
          Table view coming soon...
        </div>
      )}
      {view === "kanban" && (
        <div className="border rounded-lg p-8 text-center text-muted-foreground">
          Kanban board coming soon...
        </div>
      )}
      {view === "calendar" && (
        <div className="border rounded-lg p-8 text-center text-muted-foreground">
          Calendar view coming soon...
        </div>
      )}
    </div>
  );
};

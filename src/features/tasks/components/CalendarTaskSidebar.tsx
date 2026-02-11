"use client";

import { Draggable, Droppable } from "@hello-pangea/dnd";
import { SquareIcon, GripVerticalIcon } from "lucide-react";

type Task = {
  id: string;
  name: string;
  dueDate: Date | string | null;
  assignee: {
    id: string;
    name: string;
    image: string | null;
  } | null;
  column: {
    id: string;
    name: string;
    color: string;
  };
};

type CalendarTaskSidebarProps = {
  tasks: Task[];
  onTaskClick: (taskId: string) => void;
};

export const CalendarTaskSidebar = ({
  tasks,
  onTaskClick,
}: CalendarTaskSidebarProps) => {
  // Show all tasks, prioritize those without due dates
  const sortedTasks = [...tasks].sort((a, b) => {
    // Tasks without due dates first
    if (!a.dueDate && b.dueDate) return -1;
    if (a.dueDate && !b.dueDate) return 1;
    return 0;
  });

  const unscheduledCount = tasks.filter((t) => !t.dueDate).length;

  return (
    <div className="w-64 border-l flex flex-col bg-muted/30">
      <div className="p-3 border-b">
        <h3 className="font-medium text-sm">Tasks</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {unscheduledCount} unscheduled · {tasks.length} total
        </p>
      </div>

      <Droppable droppableId="task-sidebar" isDropDisabled>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex-1 overflow-y-auto p-2"
          >
            {sortedTasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`mb-1.5 ${snapshot.isDragging ? "opacity-50" : ""}`}
                  >
                    <div
                      className="bg-card border rounded p-2 cursor-pointer hover:bg-muted/50 flex items-start gap-2"
                      onClick={() => onTaskClick(task.id)}
                    >
                      <div
                        {...provided.dragHandleProps}
                        className="mt-0.5 cursor-grab active:cursor-grabbing"
                      >
                        <GripVerticalIcon className="size-3 text-muted-foreground" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <div
                            className="size-3 rounded-sm flex items-center justify-center shrink-0"
                            style={{ backgroundColor: task.column.color }}
                          >
                            <SquareIcon className="size-2 text-white" />
                          </div>
                          <span className="text-xs text-muted-foreground truncate">
                            {task.column.name}
                          </span>
                        </div>

                        <p className="text-sm font-medium line-clamp-2">
                          {task.name || "Untitled"}
                        </p>

                        {task.dueDate && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(task.dueDate).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </p>
                        )}

                        {!task.dueDate && (
                          <p className="text-xs text-orange-500 mt-1">
                            No due date
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}

            {tasks.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-8">
                No tasks yet
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};

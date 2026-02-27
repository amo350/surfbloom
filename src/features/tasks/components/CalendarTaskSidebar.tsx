"use client";

import { SquareIcon } from "lucide-react";
import {
  type UIEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const SIDEBAR_BATCH_SIZE = 20;
const LOAD_MORE_THRESHOLD_PX = 160;

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
  onDragStart: (task: Task) => void;
  onDragEnd: () => void;
};

export const CalendarTaskSidebar = ({
  tasks,
  onTaskClick,
  onDragStart,
  onDragEnd,
}: CalendarTaskSidebarProps) => {
  const sortedTasks = useMemo(
    () =>
      [...tasks].sort((a, b) => {
        if (!a.dueDate && b.dueDate) return -1;
        if (a.dueDate && !b.dueDate) return 1;
        return 0;
      }),
    [tasks],
  );
  const [visibleTaskCount, setVisibleTaskCount] = useState(() =>
    Math.min(SIDEBAR_BATCH_SIZE, sortedTasks.length),
  );
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisibleTaskCount((current) => {
      if (sortedTasks.length === 0) return 0;
      return Math.min(
        Math.max(current, SIDEBAR_BATCH_SIZE),
        sortedTasks.length,
      );
    });
  }, [sortedTasks.length]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || visibleTaskCount >= sortedTasks.length) return;

    const hasOverflow = container.scrollHeight > container.clientHeight;
    if (!hasOverflow) {
      setVisibleTaskCount((current) =>
        Math.min(current + SIDEBAR_BATCH_SIZE, sortedTasks.length),
      );
    }
  }, [visibleTaskCount, sortedTasks.length]);

  const handleScroll = useCallback(
    (event: UIEvent<HTMLDivElement>) => {
      const container = event.currentTarget;
      const distanceToBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight;

      if (distanceToBottom > LOAD_MORE_THRESHOLD_PX) return;

      setVisibleTaskCount((current) =>
        current >= sortedTasks.length
          ? current
          : Math.min(current + SIDEBAR_BATCH_SIZE, sortedTasks.length),
      );
    },
    [sortedTasks.length],
  );

  const visibleTasks = sortedTasks.slice(0, visibleTaskCount);

  const unscheduledCount = tasks.filter((t) => !t.dueDate).length;

  return (
    <div className="w-64 h-full shrink-0 border-l bg-muted/30 flex flex-col min-h-0">
      <div className="p-3 border-b shrink-0">
        <h3 className="font-medium text-sm">Tasks</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {unscheduledCount} unscheduled · {tasks.length} total
        </p>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex-1 min-h-0 overflow-y-auto p-2"
        onScroll={handleScroll}
      >
        {visibleTasks.map((task) => (
          <div
            key={task.id}
            draggable
            onDragStart={() => onDragStart(task)}
            onDragEnd={onDragEnd}
            className="mb-1.5"
          >
            <div
              className="bg-card border rounded p-2 cursor-grab active:cursor-grabbing hover:bg-muted/50 flex items-start gap-2"
              onClick={() => onTaskClick(task.id)}
            >
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
                    {new Date(task.dueDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                )}

                {!task.dueDate && (
                  <p className="text-xs text-orange-500 mt-1">No due date</p>
                )}
              </div>
            </div>
          </div>
        ))}

        {tasks.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-8">
            No tasks yet
          </div>
        )}

        {tasks.length > 0 && visibleTaskCount < sortedTasks.length && (
          <p className="text-xs text-center text-muted-foreground py-2">
            Showing {visibleTaskCount} of {sortedTasks.length}
          </p>
        )}
      </div>
    </div>
  );
};

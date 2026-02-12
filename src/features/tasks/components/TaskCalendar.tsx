"use client";

import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import {
  addDays,
  addMonths,
  addWeeks,
  format,
  getDay,
  parse,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";
import { enUS } from "date-fns/locale";
import { useCallback, useState } from "react";
import {
  Calendar,
  Components,
  dateFnsLocalizer,
  View,
} from "react-big-calendar";
import withDragAndDrop, {
  EventInteractionArgs,
} from "react-big-calendar/lib/addons/dragAndDrop";
import { useUpdateTask } from "../hooks/use-tasks";
import { CalendarEventCard } from "./CalendarEventCard";
import { CalendarTaskSidebar } from "./CalendarTaskSidebar";
import { CalendarToolbar } from "./CalendarToolbar";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

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

type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  statusColor: string;
  assigneeName?: string;
};

const DnDCalendar = withDragAndDrop<CalendarEvent, object>(Calendar);

type TaskCalendarProps = {
  tasks: Task[];
  workspaceId: string;
  onTaskClick: (taskId: string) => void;
};

type CalendarView = "month" | "week" | "day";

export const TaskCalendar = ({
  tasks,
  workspaceId,
  onTaskClick,
}: TaskCalendarProps) => {
  const [date, setDate] = useState(() => new Date());
  const [view, setView] = useState<CalendarView>("month");
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const updateTask = useUpdateTask();

  // Convert tasks with due dates to calendar events
  const events: CalendarEvent[] = tasks
    .filter((task) => task.dueDate)
    .map((task) => {
      const start = new Date(task.dueDate!);
      const end = new Date(task.dueDate!);
      end.setHours(end.getHours() + 1);
      return {
        id: task.id,
        title: task.name,
        start,
        end,
        statusColor: task.column.color,
        assigneeName: task.assignee?.name,
      };
    });

  const handleNavigate = useCallback(
    (action: "PREV" | "NEXT" | "TODAY") => {
      if (action === "TODAY") {
        setDate(new Date());
        return;
      }

      if (view === "month") {
        setDate((prev) =>
          action === "PREV" ? subMonths(prev, 1) : addMonths(prev, 1),
        );
      } else if (view === "week") {
        setDate((prev) =>
          action === "PREV" ? subWeeks(prev, 1) : addWeeks(prev, 1),
        );
      } else if (view === "day") {
        setDate((prev) =>
          action === "PREV" ? subDays(prev, 1) : addDays(prev, 1),
        );
      }
    },
    [view],
  );

  const handleSelectEvent = useCallback(
    (event: CalendarEvent) => {
      onTaskClick(event.id);
    },
    [onTaskClick],
  );

  // Handle drag within calendar (moving event to different date)
  const handleEventDrop = useCallback(
    ({ event, start }: EventInteractionArgs<CalendarEvent>) => {
      updateTask.mutate({
        id: event.id,
        workspaceId,
        dueDate: start as Date,
      });
    },
    [updateTask, workspaceId],
  );
  const handleDropFromOutside = useCallback(
    ({ start }: { start: Date | string }) => {
      if (!draggedTask) return;

      const nextDate = start instanceof Date ? start : new Date(start);

      updateTask.mutate({
        id: draggedTask.id,
        workspaceId,
        dueDate: nextDate,
      });

      setDraggedTask(null);
    },
    [draggedTask, updateTask, workspaceId],
  );

  const handleDragOver = useCallback((dragEvent: React.DragEvent) => {
    dragEvent.preventDefault();
  }, []);

  const components: Components<CalendarEvent> = {
    event: ({ event }) => (
      <CalendarEventCard
        title={event.title}
        statusColor={event.statusColor}
        assigneeName={event.assigneeName}
        onClick={() => handleSelectEvent(event)}
      />
    ),
  };

  return (
    <div className="h-full flex flex-col">
      <CalendarToolbar
        date={date}
        view={view}
        onNavigate={handleNavigate}
        onViewChange={setView}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Calendar */}
        <div className="flex-1 overflow-y-auto">
          <DnDCalendar
            localizer={localizer}
            date={date}
            onNavigate={setDate}
            view={view as View}
            onView={(v) => setView(v as CalendarView)}
            events={events}
            toolbar={false}
            showAllEvents
            className="task-calendar"
            components={components}
            onEventDrop={handleEventDrop}
            onDropFromOutside={handleDropFromOutside}
            dragFromOutsideItem={() =>
              draggedTask
                ? {
                    id: draggedTask.id,
                    title: draggedTask.name,
                    start: draggedTask.dueDate
                      ? new Date(draggedTask.dueDate)
                      : new Date(),
                    end: draggedTask.dueDate
                      ? new Date(draggedTask.dueDate)
                      : new Date(),
                    statusColor: draggedTask.column.color,
                    assigneeName: draggedTask.assignee?.name,
                  }
                : ({} as CalendarEvent)
            }
            onDragOver={handleDragOver}
            resizable={false}
            selectable
            formats={{
              weekdayFormat: (date, culture, localizer) =>
                localizer?.format(date, "EEE", culture) ?? "",
            }}
          />
        </div>

        {/* Task Sidebar */}
        <CalendarTaskSidebar
          tasks={tasks}
          onTaskClick={onTaskClick}
          onDragStart={(task) => setDraggedTask(task)}
          onDragEnd={() => setDraggedTask(null)}
        />
      </div>
    </div>
  );
};

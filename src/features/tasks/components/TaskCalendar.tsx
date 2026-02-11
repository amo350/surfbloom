"use client";

import { useState, useCallback } from "react";
import {
  Calendar,
  dateFnsLocalizer,
  View,
  Components,
} from "react-big-calendar";
import withDragAndDrop, {
  EventInteractionArgs,
} from "react-big-calendar/lib/addons/dragAndDrop";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import {
  format,
  parse,
  startOfWeek,
  getDay,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
} from "date-fns";
import { enUS } from "date-fns/locale";

import { CalendarToolbar } from "./CalendarToolbar";
import { CalendarEventCard } from "./CalendarEventCard";
import { CalendarTaskSidebar } from "./CalendarTaskSidebar";
import { useUpdateTask } from "../hooks/use-tasks";

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
  const updateTask = useUpdateTask();

  // Convert tasks with due dates to calendar events
  const events: CalendarEvent[] = tasks
    .filter((task) => task.dueDate)
    .map((task) => ({
      id: task.id,
      title: task.name,
      start: new Date(task.dueDate!),
      end: new Date(task.dueDate!),
      statusColor: task.column.color,
      assigneeName: task.assignee?.name,
    }));

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

  // Handle drag from sidebar (sidebar-to-calendar would need drop-coordinates → date mapping)
  const handleDragEnd = useCallback((_result: DropResult) => {
    // No calendar droppables without dateCellWrapper; implement coordinate-based drop if needed
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
    <DragDropContext onDragEnd={handleDragEnd}>
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
              resizable={false}
              selectable
              formats={{
                weekdayFormat: (date, culture, localizer) =>
                  localizer?.format(date, "EEE", culture) ?? "",
              }}
            />
          </div>

          {/* Task Sidebar */}
          <CalendarTaskSidebar tasks={tasks} onTaskClick={onTaskClick} />
        </div>
      </div>
    </DragDropContext>
  );
};

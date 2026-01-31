"use client";

import { LayoutGridIcon, TableIcon, CalendarIcon } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type TaskView = "table" | "kanban" | "calendar";

type TaskViewSwitcherProps = {
  value: TaskView;
  onChange: (value: TaskView) => void;
};

export const TaskViewSwitcher = ({
  value,
  onChange,
}: TaskViewSwitcherProps) => {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as TaskView)}>
      <TabsList>
        <TabsTrigger value="table" className="gap-1.5">
          <TableIcon className="size-4" />
          <span className="hidden sm:inline">Table</span>
        </TabsTrigger>
        <TabsTrigger value="kanban" className="gap-1.5">
          <LayoutGridIcon className="size-4" />
          <span className="hidden sm:inline">Kanban</span>
        </TabsTrigger>
        <TabsTrigger value="calendar" className="gap-1.5">
          <CalendarIcon className="size-4" />
          <span className="hidden sm:inline">Calendar</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CalendarView = "month" | "week" | "day";

type CalendarToolbarProps = {
  date: Date;
  view: CalendarView;
  onNavigate: (action: "PREV" | "NEXT" | "TODAY") => void;
  onViewChange: (view: CalendarView) => void;
};

export const CalendarToolbar = ({
  date,
  view,
  onNavigate,
  onViewChange,
}: CalendarToolbarProps) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => onNavigate("TODAY")}>
          Today
        </Button>
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => onNavigate("PREV")}
          >
            <ChevronLeftIcon className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => onNavigate("NEXT")}
          >
            <ChevronRightIcon className="size-4" />
          </Button>
        </div>
        <h2 className="text-lg font-semibold ml-2">
          {format(date, "MMMM yyyy")}
        </h2>
      </div>

      <Select
        value={view}
        onValueChange={(v) => onViewChange(v as CalendarView)}
      >
        <SelectTrigger className="w-28 h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="month">Month</SelectItem>
          <SelectItem value="week">Week</SelectItem>
          <SelectItem value="day">Day</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

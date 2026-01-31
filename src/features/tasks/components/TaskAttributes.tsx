"use client";

import { useState } from "react";
import {
  CheckCircleIcon,
  ChevronDownIcon,
  GridIcon,
  UserIcon,
  CalendarIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type TaskAttributesProps = {
  task: {
    id: string;
  };
  workspaceId: string;
};

type AttributeRowProps = {
  icon?: React.ReactNode;
  label: string;
  children: React.ReactNode;
  className?: string;
};

const AttributeRow = ({ icon, label, children, className }: AttributeRowProps) => (
  <div className={cn("flex items-center justify-between gap-6 py-4", className)}>
    <div className="flex items-center min-w-0 flex-1">
      <div className="w-[1.25ch] min-w-[1.25ch] shrink-0 flex items-center justify-center text-foreground/80 [&_svg]:size-3 [&_svg]:shrink-0 [&_svg]:inline-block" aria-hidden>
        {icon}
      </div>
      <span className="text-sm text-muted-foreground whitespace-nowrap ml-2">{label}</span>
    </div>
    <div className="shrink-0 w-36 flex justify-end">{children}</div>
  </div>
);

/**
 * When closed: "—" + down arrow in the attribute row.
 * When open: that same space becomes the search field inline; the list dropdown appears below (in line with the separator).
 */
function AttributeSearchDropdown({ placeholder = "—" }: { placeholder?: string }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setSearch("");
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <div className="h-8 w-full max-w-36 flex items-center justify-end rounded-md">
          {open ? (
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-7 w-28 text-xs rounded-md"
              autoFocus
            />
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-full justify-end gap-1 text-sm text-muted-foreground font-normal"
            >
              <span>{placeholder}</span>
              <ChevronDownIcon className="size-4 shrink-0 opacity-50" />
            </Button>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={0}
        className="w-64 p-0 rounded-t-none border-t-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="max-h-48 overflow-y-auto p-1 min-h-[80px] border rounded-b-md">
          {/* List area — options or "No results" render here, below the row/separator */}
          <p className="text-xs text-muted-foreground p-2">No results</p>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export const TaskAttributes = ({ task, workspaceId }: TaskAttributesProps) => {
  return (
    <div className="pl-4 pr-6 pt-0 pb-6">
      <AttributeRow icon={<CheckCircleIcon />} label="Status">
        <Select>
          <SelectTrigger className="w-full max-w-28 h-7 text-xs">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="backlog">Backlog</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>
      </AttributeRow>

      <Separator />

      <AttributeRow icon={<GridIcon className="size-4" />} label="Category">
        <AttributeSearchDropdown placeholder="—" />
      </AttributeRow>

      <Separator />

      <AttributeRow icon={<UserIcon className="size-4" />} label="Assignee">
        <AttributeSearchDropdown placeholder="—" />
      </AttributeRow>

      <Separator />

      <AttributeRow icon={<CalendarIcon className="size-4" />} label="Start date">
        <AttributeSearchDropdown placeholder="—" />
      </AttributeRow>

      <Separator />

      <AttributeRow icon={<CalendarIcon className="size-4" />} label="Due date">
        <AttributeSearchDropdown placeholder="—" />
      </AttributeRow>
    </div>
  );
};

"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useGetTaskColumns } from "../hooks/use-task-columns";

// FILTER URL STRUCTURE:
//
// ?s=<columnId>         — filter by status/column
// ?c=<categoryId>       — filter by category
// ?a=<userId>           — filter by assignee
// ?cr=<userId>          — filter by creator
// ?to=true              — task overdue
// ?w=true               — watching
// ?task=<taskId>        — open task modal (separate from filters)
//
// TODO: Date filters - ?dd=7&df=end&dt=last_seven_days
//       Complex date filtering by created, start, end, custom ranges

type Filters = {
  columnId: string | null;
  categoryId: string | null;
  assigneeId: string | null;
  creatorId: string | null;
  overdue: boolean;
  watching: boolean;
};

type TaskFiltersProps = {
  workspaceId: string;
  filters: Filters;
  onFiltersChange: (filters: Partial<Filters>) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
};

export const TaskFilters = ({
  workspaceId,
  filters,
  onFiltersChange,
  hasActiveFilters,
  onClearFilters,
}: TaskFiltersProps) => {
  const { data: columns } = useGetTaskColumns(workspaceId);

  // TODO: Fetch workspace members for assignee/creator filter
  // TODO: Fetch categories for category filter

  return (
    <div className="flex items-center gap-3 px-6 py-3 border-b bg-muted/30">
      {/* Status filter */}
      <Select
        value={filters.columnId ?? "all"}
        onValueChange={(value) =>
          onFiltersChange({ columnId: value === "all" ? null : value })
        }
      >
        <SelectTrigger className="w-40 h-8 text-sm">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectSeparator />
          {columns?.map((column) => (
            <SelectItem key={column.id} value={column.id}>
              <div className="flex items-center gap-2">
                <div
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: column.color }}
                />
                {column.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Category filter */}
      <Select
        value={filters.categoryId ?? "all"}
        onValueChange={(value) =>
          onFiltersChange({ categoryId: value === "all" ? null : value })
        }
      >
        <SelectTrigger className="w-40 h-8 text-sm">
          <SelectValue placeholder="All categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          <SelectSeparator />
          {/* TODO: Populate from workspace categories */}
          <SelectItem value="bug">Bug</SelectItem>
          <SelectItem value="feature">Feature</SelectItem>
          <SelectItem value="improvement">Improvement</SelectItem>
        </SelectContent>
      </Select>

      {/* Assignee filter */}
      <Select
        value={filters.assigneeId ?? "all"}
        onValueChange={(value) =>
          onFiltersChange({ assigneeId: value === "all" ? null : value })
        }
      >
        <SelectTrigger className="w-40 h-8 text-sm">
          <SelectValue placeholder="All assignees" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All assignees</SelectItem>
          <SelectSeparator />
          {/* TODO: Populate from workspace members */}
          <SelectItem value="unassigned">Unassigned</SelectItem>
        </SelectContent>
      </Select>

      {/* Creator filter */}
      <Select
        value={filters.creatorId ?? "all"}
        onValueChange={(value) =>
          onFiltersChange({ creatorId: value === "all" ? null : value })
        }
      >
        <SelectTrigger className="w-40 h-8 text-sm">
          <SelectValue placeholder="All creators" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All creators</SelectItem>
          <SelectSeparator />
          {/* TODO: Populate from workspace members */}
        </SelectContent>
      </Select>

      {/* TODO: Date filter dropdown */}
      {/* TODO: Overdue toggle (?to=true) */}
      {/* TODO: Watching toggle (?w=true) */}

      <div className="flex-1" />

      {/* Clear filters — far right, triggers hard re-render */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClearFilters}
          className="text-muted-foreground hover:text-foreground"
        >
          Clear filters
        </Button>
      )}
    </div>
  );
};

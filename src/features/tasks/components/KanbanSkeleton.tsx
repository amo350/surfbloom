export const KanbanSkeleton = () => {
  // 4 columns to match default column count
  const columns = [1, 2, 3, 4];
  // Random card counts per column for visual variety
  const cardCounts = [5, 6, 4, 5];

  return (
    <div className="flex gap-4 h-full">
      {columns.map((col, colIndex) => (
        <div key={col} className="flex-1 flex flex-col gap-3">
          {/* Column header skeleton */}
          <div className="flex items-center gap-2 pb-2">
            <div className="h-7 w-24 rounded-md bg-muted animate-pulse" />
            <div className="h-5 w-6 rounded-full bg-muted animate-pulse" />
          </div>

          {/* Color bar */}
          <div className="h-0.5 w-full rounded-full bg-muted animate-pulse" />

          {/* Card skeletons */}
          <div className="flex flex-col gap-2">
            {Array.from({ length: cardCounts[colIndex] }).map((_, i) => (
              <div
                key={i}
                className="rounded-lg border bg-card p-4 space-y-3 animate-pulse"
              >
                {/* Title line */}
                <div className="h-4 w-3/4 rounded bg-muted" />
                {/* Bottom row: assignee avatar + due date */}
                <div className="flex items-center justify-between">
                  <div className="h-6 w-6 rounded-full bg-muted" />
                  <div className="h-3 w-16 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

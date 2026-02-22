"use client";

export function TimelineConnector({
  delayMinutes,
}: {
  delayMinutes: number;
}) {
  const label = formatDelay(delayMinutes);

  return (
    <div className="flex flex-col items-center py-1">
      <div className="w-px h-4 bg-border" />
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/30 border">
        <svg
          className="h-3 w-3 text-muted-foreground"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <circle cx="8" cy="8" r="6.5" />
          <path d="M8 4.5V8l2.5 1.5" />
        </svg>
        <span className="text-[10px] font-medium text-muted-foreground">
          Wait {label}
        </span>
      </div>
      <div className="w-px h-4 bg-border" />
    </div>
  );
}

export function formatDelay(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  if (minutes < 1440) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  const d = Math.floor(minutes / 1440);
  const remainH = Math.floor((minutes % 1440) / 60);
  return remainH > 0 ? `${d}d ${remainH}h` : `${d}d`;
}

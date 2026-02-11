"use client";

type CalendarEventCardProps = {
  title: string;
  statusColor: string;
  assigneeName?: string;
  onClick?: () => void;
};

export const CalendarEventCard = ({
  title,
  statusColor,
  assigneeName,
  onClick,
}: CalendarEventCardProps) => {
  const initials = assigneeName
    ? assigneeName.split("@")[0].slice(0, 3).toUpperCase()
    : "???";

  return (
    <div
      className="px-1 py-0.5 rounded text-xs truncate cursor-pointer hover:opacity-80 border-l-2"
      style={{
        borderLeftColor: statusColor,
        backgroundColor: `${statusColor}15`,
      }}
      onClick={onClick}
    >
      <div className="flex items-center gap-1">
        <span className="truncate font-medium">{title || "Untitled"}</span>
        <span className="text-muted-foreground shrink-0">@{initials}</span>
      </div>
    </div>
  );
};

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string; dot?: string }
> = {
  draft: {
    label: "Draft",
    bg: "bg-slate-50",
    text: "text-slate-700",
    border: "border-slate-200",
  },
  scheduled: {
    label: "Scheduled",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-500",
  },
  sending: {
    label: "Sending",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  paused: {
    label: "Paused",
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
  },
  completed: {
    label: "Completed",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
  },
};

export function CampaignStatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border ${config.bg} ${config.text} ${config.border}`}
    >
      {config.dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${config.dot} ${
            status === "sending" ? "animate-pulse" : ""
          }`}
        />
      )}
      {config.label}
    </span>
  );
}

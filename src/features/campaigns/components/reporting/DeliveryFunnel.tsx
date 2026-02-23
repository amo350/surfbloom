"use client";

import { Loader2 } from "lucide-react";
import { useReportingFunnel } from "@/features/campaigns/hooks/use-reporting";

const STAGE_COLORS: Record<string, string> = {
  sent: "bg-teal-500",
  delivered: "bg-emerald-500",
  opened: "bg-blue-500",
  clicked: "bg-amber-500",
  replied: "bg-orange-500",
};

export function DeliveryFunnel({
  workspaceId,
  days,
  channel,
}: {
  workspaceId?: string;
  days: number;
  channel: "all" | "sms" | "email";
}) {
  const { data, isLoading } = useReportingFunnel({
    workspaceId,
    days,
    channel,
  });

  if (isLoading || !data) {
    return (
      <div className="rounded-lg border bg-white p-4 h-[200px] flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const stages = [
    { key: "sent", label: "Sent", value: data.sent ?? 0 },
    { key: "delivered", label: "Delivered", value: data.delivered ?? 0 },
    { key: "opened", label: "Opened", value: data.opened ?? 0 },
    { key: "clicked", label: "Clicked", value: data.clicked ?? 0 },
    { key: "replied", label: "Replied", value: data.replied ?? 0 },
  ];
  const total = Math.max(1, stages[0].value);

  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="mb-3">
        <p className="text-sm font-semibold">Delivery Funnel</p>
        <p className="text-xs text-muted-foreground">
          Drop-off by delivery stage
        </p>
      </div>

      <div className="space-y-2.5">
        {stages.map((stage) => {
          const pct = (stage.value / total) * 100;
          return (
            <div key={stage.key} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{stage.label}</span>
                <span className="font-medium tabular-nums">
                  {stage.value.toLocaleString()} ({pct.toFixed(1)}%)
                </span>
              </div>
              <div className="h-2 rounded bg-muted overflow-hidden">
                <div
                  className={`h-full ${STAGE_COLORS[stage.key] || "bg-slate-400"}`}
                  style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

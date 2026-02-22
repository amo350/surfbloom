"use client";

import { ArrowDownRight, ArrowUpRight, Loader2 } from "lucide-react";
import { useReportingOverview } from "@/features/campaigns/hooks/use-reporting";

function TrendPill({ value }: { value: number }) {
  const positive = value >= 0;
  return (
    <div
      className={`mt-2 inline-flex items-center gap-1 text-[11px] ${
        positive ? "text-emerald-600" : "text-red-600"
      }`}
    >
      {positive ? (
        <ArrowUpRight className="h-3 w-3" />
      ) : (
        <ArrowDownRight className="h-3 w-3" />
      )}
      {Math.abs(value).toFixed(1)}%
    </div>
  );
}

function MetricCard({
  label,
  value,
  trend,
}: {
  label: string;
  value: string;
  trend: number;
}) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
      <TrendPill value={trend} />
    </div>
  );
}

export function HeroMetrics({
  workspaceId,
  days,
  channel,
}: {
  workspaceId?: string;
  days: number;
  channel: "all" | "sms" | "email";
}) {
  const { data, isLoading } = useReportingOverview({
    workspaceId,
    days,
    channel,
  });

  if (isLoading || !data) {
    return (
      <div className="rounded-lg border bg-white p-8 flex justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      <MetricCard
        label="Sent"
        value={data.sent.toLocaleString()}
        trend={data.sentTrend}
      />
      <MetricCard
        label="Delivered"
        value={data.delivered.toLocaleString()}
        trend={data.deliveredTrend}
      />
      <MetricCard
        label="Delivery Rate"
        value={`${data.deliveryRate.toFixed(1)}%`}
        trend={data.deliveryRateTrend}
      />
      <MetricCard
        label="Replies"
        value={data.replied.toLocaleString()}
        trend={data.repliedTrend}
      />
      <MetricCard
        label="Reply Rate"
        value={`${data.replyRate.toFixed(1)}%`}
        trend={data.replyRateTrend}
      />
    </div>
  );
}

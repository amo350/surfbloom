"use client";

import { Loader2 } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useReportingTimeSeries } from "@/features/campaigns/hooks/use-reporting";

const chartConfig = {
  sent: { label: "Sent", color: "#14b8a6" },
  delivered: { label: "Delivered", color: "#10b981" },
  failed: { label: "Failed", color: "#ef4444" },
  replied: { label: "Replied", color: "#f59e0b" },
};

export function SendsChart({
  workspaceId,
  days,
  channel,
}: {
  workspaceId?: string;
  days: number;
  channel: "all" | "sms" | "email";
}) {
  const { data, isLoading } = useReportingTimeSeries({
    workspaceId,
    days,
    channel,
  });

  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="mb-3">
        <p className="text-sm font-semibold">Sends Over Time</p>
        <p className="text-xs text-muted-foreground">
          Daily trend for sent, delivered, failed, and replied messages
        </p>
      </div>

      {isLoading || !data ? (
        <div className="h-[280px] flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <AreaChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })
              }
            />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="sent"
              stroke="var(--color-sent)"
              fill="var(--color-sent)"
              fillOpacity={0.22}
            />
            <Area
              type="monotone"
              dataKey="delivered"
              stroke="var(--color-delivered)"
              fill="var(--color-delivered)"
              fillOpacity={0.2}
            />
            <Area
              type="monotone"
              dataKey="failed"
              stroke="var(--color-failed)"
              fill="var(--color-failed)"
              fillOpacity={0.14}
            />
            <Area
              type="monotone"
              dataKey="replied"
              stroke="var(--color-replied)"
              fill="var(--color-replied)"
              fillOpacity={0.16}
            />
          </AreaChart>
        </ChartContainer>
      )}
    </div>
  );
}

"use client";

import { Loader2 } from "lucide-react";
import { Cell, Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useReportingChannelBreakdown } from "@/features/campaigns/hooks/use-reporting";

const COLORS = ["#14b8a6", "#3b82f6"];

export function ChannelDonut({
  workspaceId,
  days,
}: {
  workspaceId?: string;
  days: number;
}) {
  const { data, isLoading } = useReportingChannelBreakdown({
    workspaceId,
    days,
  });

  const pieData = [
    { name: "SMS", value: data?.sms.sent || 0 },
    { name: "Email", value: data?.email.sent || 0 },
  ];

  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="mb-3">
        <p className="text-sm font-semibold">Channel Breakdown</p>
        <p className="text-xs text-muted-foreground">
          SMS vs Email send volume
        </p>
      </div>

      {isLoading || !data ? (
        <div className="h-[200px] flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-4 items-center">
          <ChartContainer
            config={{ sms: { label: "SMS", color: COLORS[0] } }}
            className="h-[200px] w-[200px]"
          >
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                innerRadius={48}
                outerRadius={80}
              >
                {pieData.map((entry, idx) => (
                  <Cell key={entry.name} fill={COLORS[idx]} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ChartContainer>

          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-teal-500" />
                SMS
              </span>
              <span className="font-medium tabular-nums">
                {data.sms.sent.toLocaleString()} sent
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                Email
              </span>
              <span className="font-medium tabular-nums">
                {data.email.sent.toLocaleString()} sent
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
